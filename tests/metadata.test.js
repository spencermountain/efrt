import test from 'tape'
import efrt from './_lib.js'

test('metadata names survive terminal, prefix, and shared suffix compression', function (t) {
  const names = ['_c', '_d', '_v', '_g', '_n', 'edges', '__proto__']
  for (const name of names) {
    const cases = [
      [name],
      [name, 'ordinary'],
      [name, name + 'a', name + 'b'],
      ['a' + name, 'b' + name],
      ['a' + name, 'b' + name, 'a' + name + 'x', 'b' + name + 'x']
    ]
    for (const words of cases) {
      const expected = Object.fromEntries(words.map((word) => [word, true]))
      for (const strict of [false, true]) {
        t.deepEqual(efrt.unpack(efrt.pack(words, { strict })), expected,
          JSON.stringify(words) + ' strict=' + strict)
      }
    }
  }
  t.end()
})

test('metadata names retain categories in objects and string input', function (t) {
  const words = ['_c', '_d', '_v', '_g', '_n', 'edges', '__proto__']
  for (const word of words) {
    const input = Object.fromEntries([[word, ['first', 'second']]])
    t.deepEqual(efrt.unpack(efrt.pack(input, { strict: true })), input, word + ' categories')
    t.deepEqual(efrt.unpack(efrt.pack(word)), Object.fromEntries([[word, true]]), word + ' string')
  }
  const expected = Object.fromEntries(words.map((word) => [word, true]))
  t.deepEqual(efrt.unpack(efrt.pack(words)), expected, 'all metadata names together')
  t.equal(efrt.pack(['_c']), 'true¦_c', 'uses the existing packed format')
  t.end()
})
