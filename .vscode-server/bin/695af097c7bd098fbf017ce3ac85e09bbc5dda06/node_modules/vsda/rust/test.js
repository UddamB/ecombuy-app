'use strict';

const assert = require('assert');
const vsda = require('./nodejs/vsda');
const vsdaNative = require('../index');
const enc = require('./crypt');

it('encrypts and decrypts', async () => {
  const encrypted = await enc.encrypt(Buffer.from('hello world!'));
  assert.notDeepStrictEqual(new Uint8Array(encrypted), new Uint8Array(Buffer.from('hello world!')));
  const decrypted = await enc.decrypt(encrypted);
  assert.deepStrictEqual(new Uint8Array(decrypted), new Uint8Array(Buffer.from('hello world!')));
});

describe('vsda module', () => {
  it('has signer interface', () => {
    assert.strictEqual(typeof vsda.signer, 'function');
    assert.strictEqual(typeof Object.getOwnPropertyDescriptor(
      vsda.signer.prototype, 'sign').value, 'function');
  });

  it('has validator interface', () => {
    assert.strictEqual(typeof vsda.validator, 'function');
    assert.strictEqual(typeof Object.getOwnPropertyDescriptor(
      vsda.validator.prototype, 'createNewMessage').value, 'function');
    assert.strictEqual(typeof Object.getOwnPropertyDescriptor(
      vsda.validator.prototype, 'validate').value, 'function');
  });

  it('can sign with a valid string input', () => {
    const signer = new vsda.signer();
    const validator = new vsda.validator();
    const message = validator.createNewMessage("test");
    const signed_message = signer.sign(message);
    assert.strictEqual(validator.validate(signed_message), "ok");
  })

  it('is cross compatible wasm->native', () => {
    const validator = new vsda.validator();
    const message = validator.createNewMessage("test");
    const signed_message = new vsdaNative.signer().sign(message);
    assert.strictEqual(validator.validate(signed_message), "ok");
  })

  it('is cross compatible native->wasm', () => {
    const validator = new vsdaNative.validator();
    const message = validator.createNewMessage("test");
    const signed_message = new vsda.signer().sign(message);
    assert.strictEqual(validator.validate(signed_message), "ok");
  })

  it('throws for invalid input', () => {
    const signer = new vsda.signer();
    const validator = new vsda.validator();
    assert.throws(() => {
      validator.createNewMessage()
    }, "/^Error: Wrong number of arguments$/");
    assert.throws(() => {
      validator.createNewMessage(1)
    }, "/^Error: Wrong type of argment. Expects a string.$/");

    assert.throws(() => {
      validator.validate(1, 2)
    }, "/^Error: Wrong number of arguments$/");
    assert.throws(() => {
      validator.validate(1)
    }, "/^Error: Wrong type of argment. Expects a string.$/");

    assert.throws(() => {
      signer.sign(undefined)
    }, "/^Error: Wrong type of argment. Expects a string.$/");
  })
});
