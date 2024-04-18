import { execa } from "execa";
import { writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

export async function runPythonScript(
  code: string,
  args: string[] = [],
  python_path: string = 'python',
  mod_path: string = '',
  conda_env: string = '',
  conda_path: string = 'conda' // Assuming 'conda' is in the PATH, or provide the full path
): Promise<string> {
  const filePath = join(tmpdir(), `temp_python_script_${Date.now()}.py`);

  if (code === "") {
    throw new Error("No Code provided");
  }

  // Prepend module path to code if provided
  if (mod_path !== "") {
    code = `import sys\nsys.path.insert(0, "${mod_path.replace(/\\/g, '\\\\')}")\n` + code;
  }

  // Write the Python code to a temporary file
  await writeFile(filePath, code);

  let command = python_path;
  let commandArgs = [filePath, ...args];
  let options = {};

  if (conda_env !== "") {
    const condaActivateCmd = `${conda_path} run -n ${conda_env}`;
    if (process.platform === "win32") {
      // Windows command handling
      command = 'cmd.exe';
      commandArgs = ['/c', `${condaActivateCmd} ${python_path} ${filePath} ${args.join(' ')}`];
    } else {
      // Unix-like platforms
      command = 'bash';
      commandArgs = ['-c', `${condaActivateCmd} ${python_path} ${filePath} ${args.join(' ')}`];
    }
  }

  // Execute the Python script
  const { stdout } = await execa(command, commandArgs, options);

  // Remove the temporary Python file
  await unlink(filePath);

  // Return the result of the Python script execution
  return stdout;
}
