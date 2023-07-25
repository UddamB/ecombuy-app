import { Command, Interfaces } from '@oclif/core';
export type VersionDetail = Omit<Interfaces.VersionDetails, 'pluginVersions'> & {
    pluginVersions?: string[];
};
export default class Version extends Command {
    static enableJsonFlag: boolean;
    static flags: {
        verbose: Interfaces.BooleanFlag<boolean>;
    };
    run(): Promise<VersionDetail>;
    private formatPlugins;
    private getFriendlyName;
}
