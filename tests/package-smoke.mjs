// Copied into an isolated consumer by scripts/test-package.js.
import assert from 'assert'
import { createRequire } from 'module'
import { readFileSync } from 'fs'
import { runInNewContext } from 'vm'
import * as esm from 'efrt'
import unpack from 'efrt/unpack'

const require = createRequire(import.meta.url)
const cjs = require('efrt')
const unpackCjs = require('efrt/unpack')
const data = JSON.parse('{"__proto__":"fruit","apple":["fruit","green"],"pear":"hasOwnProperty"}')
const packed = esm.pack(data, { strict: true })
assert.strictEqual(cjs.pack(data, { strict: true }), packed)
for (const decode of [esm.unpack, unpack, cjs.unpack, unpackCjs]) {
  assert.deepStrictEqual(decode(packed), data)
  assert.throws(() => decode('fruit¦0:0;a0'), SyntaxError)
}
for (const library of [esm, cjs]) {
  assert.throws(() => library.pack(['apple1'], { strict: true }), /unsupported key/)
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
}
