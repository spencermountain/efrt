// Copied into an isolated consumer by scripts/test-package.js.
import assert from 'node:assert'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import * as esm from 'efrt'
import unpack from 'efrt/unpack'

const require = createRequire(import.meta.url)
const cjs = require('efrt')
const unpackCjs = require('efrt/unpack')
const data = JSON.parse('{"__proto__":"fruit","apple":["fruit","green"],"pear":"hasOwnProperty"}')
const packed = esm.pack(data, { strict: true })
const suffixPacked = esm.pack(data, { strict: true, direction: 'suffix' })
const dictionaryInput = Array.from({ length: 20 }, (_, i) =>
  String.fromCharCode(97 + i) + 'ありがとう' + String.fromCharCode(97 + ((i * 7) % 20)))
const dictionaryPacked = esm.pack(dictionaryInput, { direction: 'auto', dictionary: true })
const dictionaryExpected = Object.fromEntries(dictionaryInput.map((word) => [word, true]))
const digitInput = dictionaryInput.map((word) => word + '101\\a')
const digitExpected = Object.fromEntries(digitInput.map((word) => [word, true]))
const digitPacked = esm.pack(digitInput, { strict: true, direction: 'suffix', dictionary: true })
assert.ok(digitPacked.startsWith('true¦!2;:'))
assert.ok(dictionaryPacked.includes('!1:'))
assert.strictEqual(cjs.pack(data, { strict: true }), packed)
assert.strictEqual(cjs.pack(data, { strict: true, direction: 'suffix' }), suffixPacked)
for (const decode of [esm.unpack, unpack, cjs.unpack, unpackCjs]) {
  assert.deepStrictEqual(decode(packed), data)
  assert.deepStrictEqual(decode(suffixPacked), data)
  assert.deepStrictEqual(decode(dictionaryPacked), dictionaryExpected)
  assert.deepStrictEqual(decode(digitPacked), digitExpected)
  assert.throws(() => decode('fruit¦0:0;a0'), SyntaxError)
}
for (const library of [esm, cjs]) {
  assert.deepStrictEqual(library.unpack(library.pack(['101domain.com'], { strict: true })),
    { '101domain.com': true })
  assert.deepStrictEqual(library.unpack(library.pack(['_c'], { strict: true })), { _c: true })
  assert.throws(() => library.pack(['apple!'], { strict: true }), /unsupported key/)
  assert.throws(() => library.pack(['Apple', 'apple'], { strict: true }), /both normalize/)
}
const packageRoot = new URL('./node_modules/efrt/', import.meta.url)
const manifest = JSON.parse(readFileSync(new URL('package.json', packageRoot), 'utf8'))
assert.strictEqual(esm.version, manifest.version)
assert.strictEqual(cjs.version, manifest.version)
for (const filename of ['efrt.min.js', 'efrt-unpack.min.js']) {
  const context = {}
  runInNewContext(readFileSync(new URL('builds/' + filename, packageRoot), 'utf8'), context)
  const decode = filename === 'efrt.min.js' ? context.efrt.unpack : context.efrt
  assert.strictEqual(JSON.stringify(decode(packed)), JSON.stringify(data))
  assert.deepStrictEqual(JSON.parse(JSON.stringify(decode(suffixPacked))), data)
  assert.deepStrictEqual(JSON.parse(JSON.stringify(decode(dictionaryPacked))), dictionaryExpected)
  assert.deepStrictEqual(JSON.parse(JSON.stringify(decode(digitPacked))), digitExpected)
  assert.strictEqual(decode('true¦_c')._c, true)
  if (filename === 'efrt.min.js') {
    assert.strictEqual(context.efrt.pack(['_c']), 'true¦_c')
    assert.strictEqual(context.efrt.pack(['101domain.com']), String.raw`true¦!2;\b\a\bdomain.com`)
  }
}
