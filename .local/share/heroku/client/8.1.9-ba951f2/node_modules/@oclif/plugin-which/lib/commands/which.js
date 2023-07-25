"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
class Which extends core_1.Command {
    async run() {
        const { argv } = await this.parse(Which);
        let command = argv;
        if (argv.length === 1 && typeof argv[0] === 'string') {
            // If this if statement is true then the command to find was passed in as a single string, e.g. `mycli which "my command"`
            // So we must use the topicSeparator to split it into an array
            command = argv[0].split(this.config.topicSeparator);
        }
        else {
            throw new Error('"which" expects a command name.  Try something like "which your:command:here" ');
        }
        const cmd = this.config.findCommand(command.join(':'), { must: true });
        core_1.CliUx.ux.styledHeader(command.join(this.config.topicSeparator));
        core_1.CliUx.ux.styledObject({
            plugin: cmd.pluginName,
        }, ['plugin']);
    }
}
exports.default = Which;
Which.description = 'Show which plugin a command is in.';
Which.strict = false;
Which.examples = [
    {
        description: 'See which plugin the `help` command is in:',
        command: '<%= config.bin %> <%= command.id %> help',
    },
];
