import test from 'tape'
import fns from '../src/pack/fns.js'
import efrt from './_lib.js'

test('common prefixes include empty, identical, and unicode strings', function (t) {
  for (const [left, right, expected] of [
    ['', 'apple', ''], ['apple', '', ''], ['apple', 'apple', 'apple'],
    ['apple', 'apply', 'appl'], ['apple', 'pear', ''], ['a', 'apple', 'a'],
    ['café', 'cafés', 'café'], ['👍a', '👍b', '👍'],
    ['😀a', '😁b', ''], ['a😀', 'a😁', 'a'], ['😀', '😀a', '😀']
  ]) {
    t.equal(fns.commonPrefix(left, right), expected, left + '/' + right)
  }
  t.end()
})

test('unicode words survive UTF-8 transport without splitting surrogate pairs', function (t) {
  for (const words of [
    ['😀', '😁'], ['😀a', '😁b'], ['a😀', 'b😀', 'a😁', 'b😁'],
    ['😀', '😀a', '😀ab', '😁a', '😁ab'],
    ['𐀀a', '𐀁a', '𠀀a', '𠀁a', 'café', 'éclair', '👍🏽', '👍🏻'],
    ['😀'.repeat(512), '😁'.repeat(512)]
  ]) {
    const packed = efrt.pack(words, { strict: true })
    const transported = Buffer.from(packed, 'utf8').toString('utf8')
    t.equal(transported, packed, 'UTF-8 preserves the packed string')
    t.deepEqual(Object.keys(efrt.unpack(transported)).sort(), words.slice().sort(),
      'UTF-8 transport preserves every word')
  }
  t.deepEqual(efrt.unpack('true¦\ud83d0;\ude00,\ude01'), { '😀': true, '😁': true },
    'previously packed surrogate fragments still decode in memory')
  t.end()
})

test('deduplicate sorted strings in place including long duplicate runs', function (t) {
  for (const [input, expected] of [
    [[], []], [['a'], ['a']], [['a', 'a', 'a'], ['a']],
    [['b', 'a', 'b', 'a', 'a', 'c', 'b'], ['a', 'b', 'c']],
    [Array(10000).fill('a'), ['a']]
  ]) {
    fns.unique(input)
    t.deepEqual(input, expected)
  }
  t.end()
})

test('packing optimization retains the existing byte format', function (t) {
  for (const [input, expected] of [
    [['the', 'them', 'there', 'thesis', 'this'], 'true¦th0;e0is;!m,re,sis'],
    [['cat', 'cats', 'bat', 'bats'], 'true¦b0c0;at0;!s'],
    [{ apple: 'fruit', pear: ['fruit', 'green'] }, 'fruit¦apple,pear|green¦pear']
  ]) {
    t.equal(efrt.pack(input), expected, 'packed fixture')
  }
  t.end()
})

test('suffix inlining never truncates a nonterminal singleton', function (t) {
  // Enough distinct nodes to require a two-character reference. The path
  // for fcfcfebeb has a singleton "eb" edge pointing to another node, while
  // its parent also has a terminal "eb" edge. Only the child is relevant
  // when deciding whether the remaining suffix can be written literally.
  const words = [
    'fafabcdcf', 'befadabab', 'dcbcbcdaf', 'dadebabaf', 'dabcdef',
    'fcfcfebeb', 'def', 'bedcb', 'bcfebebeb', 'bebefabab', 'dafabcded',
    'dcdcfcd', 'fcbedebcb', 'dabed', 'dcdadcd', 'dafafaf', 'bedafcbab',
    'beb', 'fcfeb', 'bebeb', 'fafcdedeb', 'fafcbcfcf', 'dcb', 'dedcfcb',
    'bcfab', 'debadadab', 'dcdcdcfcb', 'debedcfaf', 'fabafaf', 'fcd',
    'debedad', 'fabefcb', 'befedcbed', 'defcb', 'fcded', 'dcbcb',
    'bcb', 'fcbcb', 'daded'
  ]
  const decoded = efrt.unpack(efrt.pack(words, { strict: true }))
  t.equal(decoded.fcfcfebeb, true, 'retains the entire shared suffix')
  t.equal(Object.prototype.hasOwnProperty.call(decoded, 'fcfcfeb'), false,
    'does not invent a truncated word')
  t.deepEqual(Object.keys(decoded).sort(), words.slice().sort(), 'exact word set survives')
  t.end()
})

test('generated lexicons preserve words and category memberships', function (t) {
  let seed = 173
  const random = function (limit) {
    seed = (seed * 48271) % 2147483647
    return seed % limit
  }
  const fragments = ['a', 'b', 'c', 'd', 'ef', 'ing', 'ed', '-', '_', ' ', 'é', '😀', '😁', '𠀀', '\n', '\u0000']
  const categories = ['noun', 'verb', '__proto__', '', 'true']
  for (let sample = 0; sample < 200; sample++) {
    const input = Object.create(null)
    for (let entry = 0; entry < 80; entry++) {
      let word = ''
      const length = 1 + random(10)
      for (let i = 0; i < length; i++) {
        word += fragments[random(fragments.length)]
      }
      input[word] = [categories[random(categories.length)], categories[random(categories.length)]]
    }
    const packed = efrt.pack(input, { strict: true })
    const decoded = efrt.unpack(Buffer.from(packed, 'utf8').toString('utf8'))
    // Memberships are sets: packing deduplicates repeated categories, and
    // the format's "true" category decodes as boolean true.
    const expected = Object.keys(input).sort().map((word) => [
      word, [...new Set(input[word])].sort()
    ])
    const actual = Object.keys(decoded).sort().map((word) => [
      word, [].concat(decoded[word]).map(String).sort()
    ])
    t.deepEqual(actual, expected, 'generated lexicon ' + sample)
  }
  t.end()
})
