const fs = require('fs');
const crypto = require('crypto');

const key = [
  "*",
  "* Visual Studio Code Server",
  "*",
  "* By using the software, you agree to",
  "* the Visual Studio Code Server License Terms (https://aka.ms/vscode-server-license) and",
  "* the Microsoft Privacy Statement (https://privacy.microsoft.com/en-US/privacystatement).",
  "*"
].join('\n');

const keyBytes = new TextEncoder().encode(key);
const keySize = 32;
const ivSize = 16;
const step = keySize + ivSize;

/**
 * @param {BufferSource} contents
 * @returns Promise<ArrayBuffer>
 */
exports.encrypt = async (contents) => {
  for (let i = Math.floor(keyBytes.length / step - 1) * step; i >= 0; i -= step) {
    const key = await crypto.subtle.importKey('raw', keyBytes.slice(i + ivSize, i + ivSize + keySize), { name: 'AES-CBC' }, false, ['encrypt']);
    contents = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: keyBytes.slice(i, i + ivSize) }, key, contents);
  }

  return contents;
};

/**
 * @param {BufferSource} contents
 * @returns Promise<ArrayBuffer>
 */
exports.decrypt = async (contents) => {
  for (let i = 0;  i + step < keyBytes.length; i += step) {
    const key = await crypto.subtle.importKey('raw', keyBytes.slice(i + ivSize, i + ivSize + keySize), { name: 'AES-CBC' }, false, ['decrypt']);
    contents = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: keyBytes.slice(i, i + ivSize) }, key, contents);
  }

  return contents;
};

if (require.main === module) {
  (async () => {
    const [a0, a1, operation, file] = process.argv;

    if (file && operation === 'encrypt') {
      fs.writeFileSync(file, Buffer.from(await exports.encrypt(fs.readFileSync(file))));
    } else if (file && operation === 'decrypt') {
      fs.writeFileSync(file, Buffer.from(await exports.decrypt(fs.readFileSync(file))));
    } else {
      console.error(`Usage: ${a0} ${a1} <encrypt|decrypt> <file>`);
      process.exit(1);
    }
  })();
}
