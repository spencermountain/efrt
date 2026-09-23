import test from 'tape'
import efrt from './_lib.js'

test('strict packing rejects unsupported keys before they are dropped', function (t) {
  for (const key of ['', 'apple1', 'a,b', 'a;b', 'a!b', 'a:b', 'a|b', 'a¦b']) {
    t.throws(() => efrt.pack([key], { strict: true }), /unsupported key/, JSON.stringify(key))
    t.throws(() => efrt.pack({ [key]: [] }, { strict: true }), /unsupported key/, 'validate empty category lists')
  }
  t.throws(() => efrt.pack(['apple', 1], { strict: true }), /array keys must be strings/, 'reject coercion')
  t.throws(() => efrt.pack(['apple', null], { strict: true }), /array keys must be strings/, 'reject null key')
  t.throws(() => efrt.pack('apple1 pear', { strict: true }), /unsupported key/, 'string input')
  t.throws(() => efrt.pack({ ['a'.repeat(1025)]: [] }, { strict: true }), /keys cannot exceed/, 'length limit')
  t.end()
})

test('strict packing detects normalization collisions across categories', function (t) {
  for (const input of [
    { Apple: 'fruit', apple: 'company' }, ['Apple', 'apple'], 'Apple apple',
    ['É', 'é'], ['İ', 'i\u0307']
  ]) {
    t.throws(() => efrt.pack(input, { strict: true }), /both normalize/, 'collision')
  }
  const input = ['Apple', 'Apple', 'café', '👍', '__proto__']
  t.equal(efrt.pack(input, { strict: true }), efrt.pack(input), 'capitalization and exact duplicates still allowed')
  t.deepEqual(efrt.unpack(efrt.pack(['Apple'], { strict: true })), { apple: true }, 'normalization retained')
  for (const empty of [null, undefined, [], {}]) {
    t.equal(efrt.pack(empty, { strict: true }), '', 'empty input accepted')
  }
  t.end()
})

test('default packing preserves permissive behavior', function (t) {
  const input = { Apple: 'fruit', apple: 'company', apple1: 'fruit', '': 'fruit' }
  t.deepEqual(efrt.unpack(efrt.pack(input)), { apple: ['fruit', 'company'] }, 'legacy behavior')
  t.equal(efrt.pack(input, { strict: false }), efrt.pack(input), 'explicit opt out')
  t.end()
})
