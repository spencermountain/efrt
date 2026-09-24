import test from 'tape'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import * as esm from 'efrt'
import unpack from 'efrt/unpack'

const require = createRequire(import.meta.url)

test('public ESM and CommonJS entry points', function (t) {
  const cjs = require('efrt')
  const unpackCjs = require('efrt/unpack')
  const input = { apple: 'fruit', pear: ['fruit', 'green'] }
  const packed = esm.pack(input)
  t.deepEqual(esm.unpack(packed), input, 'ESM root')
  t.deepEqual(unpack(packed), input, 'ESM unpack')
  t.deepEqual(cjs.unpack(cjs.pack(input)), input, 'CommonJS root')
  t.equal(typeof unpackCjs, 'function', 'CommonJS unpack exports a function')
  t.deepEqual(unpackCjs(packed), input, 'CommonJS unpack')
  t.end()
})

test('browser bundles expose their documented globals', function (t) {
  for (const filename of ['efrt.min.js', 'efrt-unpack.min.js']) {
    const context = {}
    runInNewContext(readFileSync(new URL('../builds/' + filename, import.meta.url), 'utf8'), context)
    const decode = filename === 'efrt.min.js' ? context.efrt.unpack : context.efrt
    t.equal(decode('fruit¦apple').apple, 'fruit', filename)
  }
  t.end()
})
