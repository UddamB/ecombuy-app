"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const addon = require('../build/Release/vscode-encrypt-native');
function encrypt(key, value) {
    return addon.encrypt(key, value);
}
exports.encrypt = encrypt;
function decrypt(key, value) {
    return addon.decrypt(key, value);
}
exports.decrypt = decrypt;
function getSignatureSerialNumber() {
    if (process.platform === 'win32') {
        return addon.getSignatureSerialNumber();
    } else {
        return Promise.resolve(undefined);
    }
}
exports.getSignatureSerialNumber = getSignatureSerialNumber;