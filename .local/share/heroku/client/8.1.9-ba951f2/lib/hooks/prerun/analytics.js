"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analytics = void 0;
const tslib_1 = require("tslib");
const analytics_1 = tslib_1.__importDefault(require("../../analytics"));
const analytics = async function (options) {
    const analytics = new analytics_1.default(this.config);
    await analytics.record(options);
};
exports.analytics = analytics;
