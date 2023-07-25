/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// @ts-check
'use strict';

const { execFile } = require('child_process');
const Path = require('path');

const command = process.platform === 'win32' ? 'vsce-sign.exe' : 'vsce-sign';
const vsceSignFilePath = Path.join(__dirname, '..', 'bin', command);

// If this module is in an .asar file, then the binary is unpacked.
const vsceSignOnDiskFilePath = vsceSignFilePath.replace(/\bnode_modules\.asar\b/, 'node_modules.asar.unpacked');

// Must stay in sync with Microsoft.VisualStudio.Extensions.Signing.ReturnCode (https://github.com/microsoft/vsce-sign/blob/main/src/Core/ReturnCode.cs).
const ReturnCode = {};

ReturnCode[ReturnCode["None"] = 0] = "None";  // For internal use.  Used for initialization.
ReturnCode[ReturnCode["RequiredArgumentMissing"] = 1] = "RequiredArgumentMissing"; // A required argument is missing.
ReturnCode[ReturnCode["InvalidArgument"] = 2] = "InvalidArgument";  // An argument is invalid.
ReturnCode[ReturnCode["PackageIsUnreadable"] = 3] = "PackageIsUnreadable";  // The extension package is unreadable.
ReturnCode[ReturnCode["UnhandledException"] = 4] = "UnhandledException"; // An unhandled exception occurred.
ReturnCode[ReturnCode["SignatureManifestIsMissing"] = 5] = "SignatureManifestIsMissing"; // The extension is missing a signature manifest file (.signature.manifest).
ReturnCode[ReturnCode["SignatureManifestIsUnreadable"] = 6] = "SignatureManifestIsUnreadable"; // The signature manifest is unreadable.
ReturnCode[ReturnCode["SignatureIsMissing"] = 7] = "SignatureIsMissing"; // The extension is missing a signature file (.signature.p7s).
ReturnCode[ReturnCode["SignatureIsUnreadable"] = 8] = "SignatureIsUnreadable"; // The signature is unreadable.
ReturnCode[ReturnCode["CertificateIsUnreadable"] = 9] = "CertificateIsUnreadable"; // The certificate is unreadable.
ReturnCode[ReturnCode["SignatureArchiveIsUnreadable"] = 10] = "SignatureArchiveIsUnreadable"; // The signature archive is unreadable.
ReturnCode[ReturnCode["FileAlreadyExists"] = 11] = "FileAlreadyExists"; // The output file already exists.
ReturnCode[ReturnCode["SignatureArchiveIsInvalidZip"] = 12] = "SignatureArchiveIsInvalidZip"; // The signature archive is not valid ZIP format.

// Space reserved for additional CLI-specific return codes.
ReturnCode[ReturnCode["Success"] = 100] = "Success"; // The operation succeeded.
ReturnCode[ReturnCode["PackageIntegrityCheckFailed"] = 101] = "PackageIntegrityCheckFailed"; // The package integrity check failed.
ReturnCode[ReturnCode["SignatureIsInvalid"] = 102] = "SignatureIsInvalid"; // The extension has an invalid signature file (.signature.p7s).
ReturnCode[ReturnCode["SignatureManifestIsInvalid"] = 103] = "SignatureManifestIsInvalid"; // The extension has an invalid signature manifest file (.signature.manifest).
ReturnCode[ReturnCode["SignatureIntegrityCheckFailed"] = 104] = "SignatureIntegrityCheckFailed"; // The extension's signature integrity check failed.  Extension integrity is suspect.
ReturnCode[ReturnCode["EntryIsMissing"] = 105] = "EntryIsMissing"; // An entry referenced in the signature manifest was not found in the extension.
ReturnCode[ReturnCode["EntryIsTampered"] = 106] = "EntryIsTampered"; // The integrity check for an entry referenced in the signature manifest failed.
ReturnCode[ReturnCode["Untrusted"] = 107] = "Untrusted"; // An X.509 certificate in the extension signature is untrusted.
ReturnCode[ReturnCode["CertificateRevoked"] = 108] = "CertificateRevoked"; // An X.509 certificate in the extension signature has been revoked.
ReturnCode[ReturnCode["SignatureIsNotValid"] = 109] = "SignatureIsNotValid"; // The extension signature is invalid.
ReturnCode[ReturnCode["UnknownError"] = 110] = "UnknownError"; // An unknown error occurred.
ReturnCode[ReturnCode["PackageIsInvalidZip"] = 111] = "PackageIsInvalidZip"; // The extension package is not valid ZIP format.

class ExtensionSignatureVerificationError extends Error {
    /**
     * @param {string} code
     * @param {boolean} didExecute
     * @param {string} output
     */
    constructor(code, didExecute, output) {
        super();
        this.code = code;
        this.didExecute = didExecute;
        this.output = output;
    }
}

/**
 * @param {string} vsixFilePath
 * @param {string} signatureArchiveFilePath
 * @param {boolean} verbose
 * @returns {Promise<boolean>}
 */
async function verify(vsixFilePath, signatureArchiveFilePath, verbose) {
    return new Promise((resolve, reject) => {
        const args = ['verify', '--package', vsixFilePath, '--signaturearchive', signatureArchiveFilePath];

        if (verbose === true) {
            args.push('--verbose');
        }

        let errorCode;
        let didExecute = false;

        execFile(vsceSignOnDiskFilePath, args, (error, stdout) => {
            // vsce-sign never returns 0, and execFile(...) returns an error for any non-zero exit code.
            const code = error.code;

            // vsce-sign returns exit codes (numbers), whereas execFile(...), in the absence of an exit code, returns an error code (string) (e.g.:  ENOENT).
            if (typeof code === 'number') {
                didExecute = true;

                if (code === ReturnCode.Success) {
                    return resolve(true);
                }

                errorCode = ReturnCode[code];
            } else if (typeof code === 'string') {
                errorCode = code;
            }

            if (errorCode === undefined) {
                errorCode = ReturnCode[ReturnCode.UnknownError];
            }

            const output = verbose ? stdout : undefined;

            reject(new ExtensionSignatureVerificationError(errorCode, didExecute, output));
        });
    });
}

module.exports = {
    verify,
    ReturnCode,
    ExtensionSignatureVerificationError
};