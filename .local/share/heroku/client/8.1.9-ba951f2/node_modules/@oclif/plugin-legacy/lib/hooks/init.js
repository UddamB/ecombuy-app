"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const util_1 = require("../util");
exports.init = async function (opts) {
    const plugins = await Promise.all(opts.config.plugins.map(async (p, i) => {
        if (p.valid)
            return;
        try {
            const plugin = new __1.PluginLegacy(opts.config, p);
            await plugin.load();
            // Insert the legacy plugin into the plugins array. This only works for @oclif/config based CLIs
            opts.config.plugins[i] = plugin; // eslint-disable-line require-atomic-updates
            // Return the legacy plugin. @oclif/core will insert into the plugins array
            return plugin;
        }
        catch (error) {
            const err = error;
            err.name = `@oclif/plugin-legacy: Plugin ${p.name}: ${err.name}`;
            err.message = util_1.compact([err.message, p.root]).join(' ');
            process.emitWarning(err);
        }
    }));
    return plugins.filter(p => Boolean(p));
};
