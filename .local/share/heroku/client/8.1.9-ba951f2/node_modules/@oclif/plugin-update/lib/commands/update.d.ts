import { Command } from '@oclif/core';
export default class UpdateCommand extends Command {
    static description: string;
    static args: {
        channel: import("@oclif/core/lib/interfaces/parser").Arg<string | undefined, Record<string, unknown>>;
    };
    static examples: {
        description: string;
        command: string;
    }[];
    static flags: {
        autoupdate: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        available: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        version: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        interactive: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        force: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
    private promptForVersion;
}
