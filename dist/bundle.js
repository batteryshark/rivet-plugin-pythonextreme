// src/nodes/RunPythonScriptNode.ts
function RunPythonScriptNode_default(rivet) {
  const nodeImpl = {
    // This should create a new instance of your node type from scratch.
    create() {
      const node = {
        // Use rivet.newId to generate new IDs for your nodes.
        id: rivet.newId(),
        // This is the default data that your node will store
        data: {
          code: "",
          arguments: "",
          python_path: "python",
          mod_path: "",
          conda_env: ""
        },
        // This is the default title of your node.
        title: "Run Python Code",
        // This must match the type of your node.
        type: "runPythonCode",
        // X and Y should be set to 0. Width should be set to a reasonable number so there is no overflow.
        visualData: {
          x: 0,
          y: 0,
          width: 200
        }
      };
      return node;
    },
    // This function should return all input ports for your node, given its data, connections, all other nodes, and the project. The
    // connection, nodes, and project are for advanced use-cases and can usually be ignored.
    getInputDefinitions(data, _connections, _nodes, _project) {
      const inputs = [];
      inputs.push({
        id: "code",
        dataType: "string",
        title: "Code",
        required: true
      });
      if (data.useArgumentsInput) {
        inputs.push({
          id: "arguments",
          dataType: "string[]",
          title: "Arguments"
        });
      }
      if (data.usePythonPathInput) {
        inputs.push({
          id: "python_path",
          dataType: "string",
          title: "Python Path"
        });
      }
      if (data.useModPathInput) {
        inputs.push({
          id: "mod_path",
          dataType: "string",
          title: "Module Base Path"
        });
      }
      if (data.useCondaEnvInput) {
        inputs.push({
          id: "conda_env",
          dataType: "string",
          title: "Conda Environment"
        });
      }
      return inputs;
    },
    // This function should return all output ports for your node, given its data, connections, all other nodes, and the project. The
    // connection, nodes, and project are for advanced use-cases and can usually be ignored.
    getOutputDefinitions(_data, _connections, _nodes, _project) {
      return [
        {
          id: "output",
          dataType: "string",
          title: "Output"
        }
      ];
    },
    // This returns UI information for your node, such as how it appears in the context menu.
    getUIData() {
      return {
        contextMenuTitle: "Run Python Code",
        group: "Advanced",
        infoBoxBody: "This is an expanded node to incorporate Python code execution.",
        infoBoxTitle: "Run Python Code Node"
      };
    },
    // This function defines all editors that appear when you edit your node.
    getEditors(_data) {
      return [
        {
          type: "string",
          dataKey: "arguments",
          useInputToggleDataKey: "useArgumentsInput",
          label: "Arguments"
        },
        {
          type: "string",
          dataKey: "python_path",
          useInputToggleDataKey: "usePythonPathInput",
          label: "Python Path"
        },
        {
          type: "string",
          dataKey: "mod_path",
          useInputToggleDataKey: "useModPathInput",
          label: "Module Base Path"
        },
        {
          type: "string",
          dataKey: "conda_env",
          useInputToggleDataKey: "useCondaEnvInput",
          label: "Conda Environment"
        }
      ];
    },
    // This function returns the body of the node when it is rendered on the graph. You should show
    // what the current data of the node is in some way that is useful at a glance.
    getBody(data) {
      return rivet.dedent`
        ${data.code}
      `;
    },
    // This is the main processing function for your node. It can do whatever you like, but it must return
    // a valid Outputs object, which is a map of port IDs to DataValue objects. The return value of this function
    // must also correspond to the output definitions you defined in the getOutputDefinitions function.
    async process(data, inputData, context) {
      if (context.executor !== "nodejs") {
        throw new Error("This node can only be run using a nodejs executor.");
      }
      let args;
      function splitArgs(args2) {
        const matcher = /(?:[^\s"]+|"[^"]*")+/g;
        return args2.match(matcher) || [];
      }
      const inputArguments = inputData["arguments"];
      if (data.useArgumentsInput && inputArguments) {
        if (rivet.isArrayDataType(inputArguments.type)) {
          args = rivet.coerceType(inputArguments, "string[]");
        } else {
          const stringArgs = rivet.coerceType(inputArguments, "string");
          args = splitArgs(stringArgs);
        }
      } else {
        args = splitArgs(data.arguments);
      }
      let code = inputData["code"]?.value ?? "";
      let python_path = rivet.getInputOrData(data, inputData, "python_path", "string") ?? "";
      let mod_path = rivet.getInputOrData(data, inputData, "mod_path", "string") ?? "";
      let conda_env = rivet.getInputOrData(data, inputData, "conda_env", "string");
      const { runPythonScript } = await import("../dist/nodeEntry.cjs");
      const output = await runPythonScript(code, args, python_path, mod_path, conda_env);
      return {
        ["output"]: {
          type: "string",
          value: output
        }
      };
    }
  };
  const nodeDefinition = rivet.pluginNodeDefinition(
    nodeImpl,
    "Run Python Code"
  );
  return nodeDefinition;
}

// src/index.ts
var initializer = (rivet) => {
  const node = RunPythonScriptNode_default(rivet);
  const plugin = {
    // The ID of your plugin should be unique across all plugins.
    id: "rivet-plugin-example-python-exec",
    // The name of the plugin is what is displayed in the Rivet UI.
    name: "Rivet Plugin Example - Python Exec",
    // Define all configuration settings in the configSpec object.
    configSpec: {},
    // Define any additional context menu groups your plugin adds here.
    contextMenuGroups: [
      {
        id: "example",
        label: "Example"
      }
    ],
    // Register any additional nodes your plugin adds here. This is passed a `register`
    // function, which you can use to register your nodes.
    register: (register) => {
      register(node);
    }
  };
  return plugin;
};
var src_default = initializer;
export {
  src_default as default
};
