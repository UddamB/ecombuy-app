"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
// eslint-disable-next-line unicorn/prefer-node-protocol
const os_1 = require("os");
class Version extends core_1.Command {
    async run() {
        var _a, _b;
        const { flags } = await this.parse(Version);
        const _c = this.config.versionDetails, { pluginVersions } = _c, theRest = tslib_1.__rest(_c, ["pluginVersions"]);
        const versionDetail = Object.assign({}, theRest);
        let output = `${this.config.userAgent}`;
        if (flags.verbose) {
            versionDetail.pluginVersions = this.formatPlugins(pluginVersions !== null && pluginVersions !== void 0 ? pluginVersions : {});
            (_a = versionDetail.shell) !== null && _a !== void 0 ? _a : (versionDetail.shell = 'unknown');
            output = ` CLI Version:
\t${versionDetail.cliVersion}

 Architecture:
\t${versionDetail.architecture}

 Node Version:
\t${versionDetail.nodeVersion}

 Plugin Version:
\t${flags.verbose ? ((_b = versionDetail.pluginVersions) !== null && _b !== void 0 ? _b : []).join(os_1.EOL + '\t') : ''}

 OS and Version:
\t${versionDetail.osVersion}

 Shell:
\t${versionDetail.shell}

 Root Path:
\t${versionDetail.rootPath}
`;
        }
        this.log(output);
        return flags.verbose ?
            versionDetail :
            {
                cliVersion: versionDetail.cliVersion,
                architecture: versionDetail.architecture,
                nodeVersion: versionDetail.nodeVersion,
            };
    }
    formatPlugins(plugins) {
        return Object.entries(plugins)
            .map(([name, plugin]) => (Object.assign({ name }, plugin)))
            .sort((a, b) => (a.name > b.name ? 1 : -1))
            .map(plugin => `${this.getFriendlyName(plugin.name)} ${plugin.version} (${plugin.type}) ${plugin.type === 'link' ? plugin.root : ''}`.trim());
    }
    getFriendlyName(name) {
        const scope = this.config.pjson.oclif.scope;
        if (!scope)
            return name;
        const match = name.match(`@${scope}/plugin-(.+)`);
        if (!match)
            return name;
        return match[1];
    }
}
exports.default = Version;
Version.enableJsonFlag = true;
Version.flags = {
    verbose: core_1.Flags.boolean({
        summary: 'Show additional information about the CLI.',
        description: 'Additionally shows the architecture, node version, operating system, and versions of plugins that the CLI is using.',
    }),
};
