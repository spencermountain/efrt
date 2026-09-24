import test from 'tape'
import { execFileSync } from 'node:child_process'
import efrt from './_lib.js'

test('duplicate packed words retain set membership within each category', function (t) {
  for (const [packed, expected] of [
    ['fruit¦apple,apple', { apple: 'fruit' }],
    ['fruit¦a0a0;b', { ab: 'fruit' }],
    ['fruit¦a0ab;!b', { a: 'fruit', ab: 'fruit' }],
    ['true¦apple,apple', { apple: true }],
    ['¦apple,apple', { apple: '' }],
    ['fruit¦apple,apple|green¦apple,apple|true¦apple,apple',
      { apple: ['fruit', 'green', true] }],
    ['fruit¦__proto__,__proto__', JSON.parse('{"__proto__":"fruit"}')]
  ]) {
    t.deepEqual(efrt.unpack(packed), expected, packed)
  }
  t.end()
})

test('long malformed fragments are rejected without repeatedly rescanning', function (t) {
  // Bound the regression in a child process: the old searching regex can
  // spend minutes on this input. The timeout allows ample startup overhead.
  const script = `
    import assert from 'node:assert/strict'
    import efrt from ${JSON.stringify(new URL('./_lib.js', import.meta.url).href)}
    for (const suffix of ['!', ':', ',']) {
      assert.throws(() => efrt.unpack('true¦' + 'a'.repeat(1000000) + suffix), SyntaxError)
    }
  `
  t.doesNotThrow(() => execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    timeout: 5000,
    stdio: 'pipe'
  }), 'rejects large malformed nodes within a bounded process')
  t.end()
})

test('prototype names in categories and keys', function (t) {
  for (const category of ['constructor', 'hasOwnProperty', '__proto__', 'toString']) {
    for (const value of [category, [category]]) {
      const input = { apple: value, pear: 'fruit' }
      t.deepEqual(efrt.unpack(efrt.pack(input)), { apple: category, pear: 'fruit' }, category)
    }
  }
  const input = JSON.parse('{"__proto__":["fruit","vegetable"],"constructor":"fruit","pear":"fruit"}')
  const result = efrt.unpack(efrt.pack(input))
  t.deepEqual(result, input, 'special keys survive multiple categories')
  t.equal(Object.getPrototypeOf(result), Object.prototype, 'result retains normal object prototype')
  const list = efrt.unpack(efrt.pack(['__proto__', 'constructor']))
  t.equal(Object.prototype.hasOwnProperty.call(list, '__proto__'), true, 'array retains __proto__')
  t.equal(list.__proto__, true, '__proto__ is a data property')
  t.equal(list.constructor, true, 'constructor is a data property')
  t.end()
})

test('category validation and legacy value semantics', function (t) {
  for (const category of ['x|y', 'x¦y']) {
    t.throws(() => efrt.pack({ apple: category }), /categories cannot contain/, 'reject scalar delimiter')
    t.throws(() => efrt.pack({ apple: ['fruit', category] }), /categories cannot contain/, 'reject array delimiter')
  }
  const values = { apple: false, pear: true, plum: 'true', peach: 42, kiwi: '' }
  t.deepEqual(efrt.unpack(efrt.pack(values)), {
    apple: 'false', pear: true, plum: true, peach: '42', kiwi: ''
  }, 'retain existing string coercion and true sentinel')
  t.end()
})

test('invalid packed input fails clearly', function (t) {
  for (const str of [
    'fruit', 'fruit¦a¦b', 'fruit¦a|', 'fruit¦a|fruit¦b',
    'fruit¦a0', 'fruit¦aZZZZZZZZZZZZZZZZ',
    'fruit¦0:0;a0', 'fruit¦0:1;a0;b0',
    'fruit¦0:9;a', 'fruit¦0:1', 'fruit¦1:0;a', 'fruit¦0:0;0:0;a',
    'fruit¦x0:0;a', 'fruit¦a;0:0', 'fruit¦a0;0',
    'fruit¦0:1\n;a0;b', 'fruit¦a0;', 'fruit¦;a',
    'fruit¦a,,b', 'fruit¦a,', 'fruit¦,a', 'fruit¦a!', 'fruit¦A'
  ]) {
    t.throws(() => efrt.unpack(str), /^SyntaxError: Invalid efrt packed data:/, str)
  }
  for (const value of [true, false, 0, 123, {}, []]) {
    t.throws(() => efrt.unpack(value), /unpack expects a string/, 'reject non-string input')
  }
  for (const value of ['', null, undefined]) {
    t.deepEqual(efrt.unpack(value), {}, 'empty input stays supported')
  }
  t.deepEqual(efrt.unpack('fruit¦0:1;a0b0;c'), { ac: 'fruit', bc: 'fruit' }, 'valid shared symbol')
  t.deepEqual(efrt.unpack('fruit¦'), {}, 'empty trie stays supported')
  t.end()
})

test('long keys and deep packed tries', function (t) {
  const longest = 'a'.repeat(1024)
  t.equal(efrt.unpack(efrt.pack([longest]))[longest], true, 'maximum key length round trips')
  for (const length of [1025, 20000]) {
    t.throws(() => efrt.pack(['a'.repeat(length)]), /keys cannot exceed 1024/, 'long key has explicit limit')
  }
  t.throws(() => efrt.pack(['İ'.repeat(513)]), /keys cannot exceed 1024/, 'limit applies after normalization')
  const depth = 20000
  const decoded = efrt.unpack('fruit¦' + 'a0;'.repeat(depth) + 'z')
  t.equal(decoded['a'.repeat(depth) + 'z'], 'fruit', 'deep valid trie does not use call stack')
  t.end()
})
