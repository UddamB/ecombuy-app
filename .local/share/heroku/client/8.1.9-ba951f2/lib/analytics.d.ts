import { Interfaces } from '@oclif/core';
import deps from './deps';
export interface RecordOpts {
    Command: Interfaces.Command.Class;
    argv: string[];
}
export interface AnalyticsInterface {
    source: string;
    event: string;
    properties: {
        cli: string;
        command: string;
        completion: number;
        version: string;
        plugin: string;
        plugin_version: string;
        os: string;
        shell: string;
        valid: boolean;
        language: string;
        install_id: string;
    };
}
export default class AnalyticsCommand {
    config: Interfaces.Config;
    userConfig: typeof deps.UserConfig.prototype;
    http: typeof deps.HTTP;
    constructor(config: Interfaces.Config);
    record(opts: RecordOpts): Promise<any>;
    get url(): string;
    get authorizationToken(): string | undefined;
    get netrcToken(): string | undefined;
    get usingHerokuAPIKey(): boolean;
    get netrcLogin(): string | undefined;
    get user(): string | undefined;
    _acAnalytics(id: string): Promise<number>;
    private init;
}
