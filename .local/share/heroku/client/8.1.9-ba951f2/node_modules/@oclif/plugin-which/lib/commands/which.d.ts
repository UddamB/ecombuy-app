import { Command } from '@oclif/core';
export default class Which extends Command {
    static description: string;
    static strict: boolean;
    static examples: {
        description: string;
        command: string;
    }[];
    run(): Promise<void>;
}
