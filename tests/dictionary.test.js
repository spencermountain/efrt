import test from 'tape'
import efrt from './_lib.js'

const family = (fragment) => Array.from({ length: 20 }, (_, i) =>
  String.fromCharCode(97 + i) + fragment + String.fromCharCode(97 + ((i * 7) % 20)))

test('input-derived dictionaries preserve multilingual labels and UTF-8', function (t) {
  for (const fragment of ['longfragment', 'ありがとう', 'приветствие', '😀😁😀', 'électricité']) {
    const words = family(fragment)
    const expected = Object.fromEntries(words.map((word) => [word, true]))
    for (const direction of ['prefix', 'suffix', 'auto']) {
      const plain = efrt.pack(words, { direction })
      const packed = efrt.pack(words, { direction, dictionary: true, strict: true })
      t.ok(packed.includes('!1:'), 'includes dictionary version: ' + fragment + ' ' + direction)
      t.ok(Buffer.byteLength(packed) < Buffer.byteLength(plain), 'saves bytes including definitions')
      t.deepEqual(efrt.unpack(Buffer.from(packed).toString('utf8')), expected, 'complete round trip')
      t.equal(efrt.pack(words, { direction, dictionary: true }), packed, 'deterministic output')
    }
  }
  t.end()
})

test('dictionary markers, symbols, literals, and direction remain distinct', function (t) {
  t.deepEqual(efrt.unpack('true¦!1:#:ありがとう;a#,b#'),
    { 'aありがとう': true, 'bありがとう': true }, 'dictionary tokens occur inside labels')
  t.deepEqual(efrt.unpack('true¦:!1:#:gnit;a#,b#'),
    { tinga: true, tingb: true }, 'reverse after resolving labels')
  t.deepEqual(efrt.unpack('true¦!1:#:long;0:1;a0b0;#'),
    { along: true, blong: true }, 'node symbols can follow a dictionary')
  t.deepEqual(efrt.unpack('fruit¦!1:#:apple;#,#|green¦apple'),
    { apple: ['fruit', 'green'] }, 'duplicate memberships remain deduplicated')
  t.deepEqual(efrt.unpack('true¦a#b'), { 'a#b': true }, 'unmarked punctuation remains literal')
  const punctuation = '#$%&()*+-./<=>?@[]^_`~'
  const words = family('longfragment').concat([punctuation, '__proto__', 'constructor'])
  t.equal(efrt.pack(words, { dictionary: true }), efrt.pack(words),
    'falls back when all candidate token characters occur in the input')
  const withHash = family('longfragment').concat(['a#b'])
  const packed = efrt.pack(withHash, { dictionary: true })
  t.ok(packed.includes('!1:'), 'can choose a different available token')
  t.deepEqual(efrt.unpack(packed), Object.fromEntries(withHash.map((word) => [word, true])),
    'literal punctuation survives in a dictionary-enabled category')
  for (const input of [[], ['apple'], null, ['ΟΣ', 'ΟΣΑ', 'İX', '😀a', '😁a']]) {
    const plain = efrt.pack(input, { direction: 'auto' })
    const encoded = efrt.pack(input, { direction: 'auto', dictionary: true })
    t.ok(Buffer.byteLength(encoded) <= Buffer.byteLength(plain), 'never increases raw UTF-8 size')
    t.deepEqual(efrt.unpack(encoded), efrt.unpack(plain), 'normalization and empty inputs preserved')
    t.equal(efrt.pack(input, { dictionary: false }), efrt.pack(input), 'opt out retains legacy bytes')
  }
  t.end()
})

test('invalid dictionary headers are rejected', function (t) {
  for (const body of [
    '!2:#:word;a#', '!1:#:word', '!1::word;a', '!1:##:one,two;a#',
    '!1:#$:one;a#', '!1:a:word;a', '!1:0:word;a', '!1:#:;a#',
    '!1:#:BAD;a#', '!1:#:word:extra;a#', '!1:😀:word;a', '!1: :word;a'
  ]) {
    t.throws(() => efrt.unpack('true¦' + body), SyntaxError, body)
  }
  for (const dictionary of [null, 1, 'auto', {}]) {
    t.throws(() => efrt.pack([], { dictionary }), /dictionary must be/, 'validates option')
  }
  t.throws(() => efrt.pack(['bad!'], { strict: true, dictionary: true }),
    /unsupported key/, 'existing reserved characters are still rejected')
  t.end()
})
