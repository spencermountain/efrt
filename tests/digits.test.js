import test from 'tape'
import efrt from './_lib.js'

const expectedWords = (words) => Object.fromEntries(words.map((word) => [word.toLowerCase(), true]))
const family = (fragment) => Array.from({ length: 20 }, (_, i) =>
  String.fromCharCode(97 + i) + fragment + String.fromCharCode(97 + ((i * 7) % 20)))

test('digit labels round trip with every direction and dictionary setting', function (t) {
  const cases = [
    ['101domain.com', 'example.com', 'site24.net'],
    ['0', '1', '01', '10', '100', '001', '0123456789'],
    ['a0', 'b0', 'a1', 'b1', 'a01', 'b01'],
    ['0-1', '-0', '1-0', 'a-1', 'a1-', '--1', '1--'],
    ['1', '\\', '\\a', '\\j', '\\1', 'a\\b', '\\\\', 'a\\9b'],
    ['😀0', '😁0', '𠀀12', 'café3', 'ΟΣ1', 'İ2', '_c1', '__proto__']
  ]
  for (const words of cases) {
    for (const direction of ['prefix', 'suffix', 'auto']) {
      for (const dictionary of [false, true]) {
        const options = { direction, dictionary, strict: true }
        const packed = efrt.pack(words, options)
        t.ok(packed.startsWith('true¦!2;'), 'version marker before optional headers')
        t.deepEqual(efrt.unpack(Buffer.from(packed).toString('utf8')), expectedWords(words),
          direction + ' dictionary=' + dictionary + ' ' + JSON.stringify(words))
      }
    }
  }
  t.equal(efrt.pack(['101domain.com']), String.raw`true¦!2;\b\a\bdomain.com`, 'documented wire format')
  t.deepEqual(efrt.unpack(efrt.pack('101domain.com site24.net')), expectedWords(['101domain.com', 'site24.net']),
    'space-separated string input')
  t.end()
})

test('versioned and legacy categories coexist without changing legacy escapes', function (t) {
  const input = { '101domain.com': ['domains', 'favorites'], apple: 'fruit', '\\a': 'literal' }
  const packed = efrt.pack(input)
  t.ok(packed.includes('fruit¦apple|literal¦\\a'), 'categories without digits keep legacy bytes')
  t.deepEqual(efrt.unpack(packed), input, 'mixed categories preserve memberships')
  t.equal(efrt.pack(['\\a']), String.raw`true¦\a`, 'unmarked backslash remains literal')
  t.deepEqual(efrt.unpack(String.raw`true¦\a,\q`), expectedWords(['\\a', '\\q']), 'old backslashes decode literally')
  t.deepEqual(efrt.unpack(String.raw`true¦!2;0:1;a0b0;\b`), { a1: true, b1: true },
    'digit labels remain distinct from symbol definitions and references')
  t.deepEqual(efrt.unpack(String.raw`true¦!2;:0:1;a0b0;\b`), { '1a': true, '1b': true },
    'reverse after unescaping and traversing references')
  t.equal(efrt.pack(['bad1!', 'apple']), 'true¦apple', 'discarded words do not force a new version')
  t.throws(() => efrt.pack(['X1', 'x1'], { strict: true }), /both normalize/, 'strict collisions still checked')
  t.end()
})

test('dictionary definitions and cost calculations use escaped labels', function (t) {
  for (const fragment of ['0123456789', '12\\a34\\j56', '😀123ありがとう']) {
    const words = family(fragment)
    for (const direction of ['prefix', 'suffix', 'auto']) {
      const plain = efrt.pack(words, { direction })
      const packed = efrt.pack(words, { direction, dictionary: true })
      t.ok(packed.includes('!1:'), 'learns a dictionary for ' + fragment)
      t.ok(Buffer.byteLength(packed) < Buffer.byteLength(plain), 'saves bytes after escaping and headers')
      t.deepEqual(efrt.unpack(packed), expectedWords(words), 'definitions expand once')
    }
    for (const dictionary of [false, true]) {
      const prefix = efrt.pack(words, { dictionary, direction: 'prefix' })
      const suffix = efrt.pack(words, { dictionary, direction: 'suffix' })
      t.equal(efrt.pack(words, { dictionary, direction: 'auto' }),
        Buffer.byteLength(suffix) < Buffer.byteLength(prefix) ? suffix : prefix,
        'auto compares complete escaped representations')
    }
  }
  t.deepEqual(efrt.unpack(String.raw`true¦!2;!1:#:\b\a;#`), { '10': true }, 'escaped digits in definition')
  t.deepEqual(efrt.unpack(String.raw`true¦!2;!1:#:\\a;#`), { '\\a': true }, 'expanded backslash is not decoded twice')
  t.deepEqual(efrt.unpack(String.raw`true¦!1:#:\a;#`), { '\\a': true }, 'legacy definition stays literal')
  t.end()
})

test('malformed versioned escapes and headers fail clearly', function (t) {
  for (const body of [
    '!2;', '!2;:', '!3;apple', '!2;!2;apple', '!2;::apple',
    '\\', '\\k', '\\0', '\\A', 'a\\', '!2;1',
    String.raw`!1:#:\k;#`, String.raw`!1:#:1;#`, String.raw`!1:\:word;\a`
  ]) {
    const packed = 'true¦' + (body.startsWith('!2;') || body.startsWith('!3;') ? '' : '!2;') + body
    t.throws(() => efrt.unpack(packed), SyntaxError, packed)
  }
  t.end()
})

test('seeded digit and punctuation sets preserve trie sharing', function (t) {
  let seed = 153
  const chars = Array.from('abc0123456789-\\_😀')
  const next = () => {
    seed = ((seed * 1664525) + 1013904223) % 4294967296
    return seed
  }
  for (let sample = 0; sample < 60; sample++) {
    const words = Array.from({ length: 40 }, () => {
      let word = ''
      const length = 1 + (next() % 10)
      for (let i = 0; i < length; i++) {
        word += chars[next() % chars.length]
      }
      return word
    })
    const options = { direction: ['prefix', 'suffix', 'auto'][sample % 3], dictionary: sample % 2 === 0 }
    t.deepEqual(efrt.unpack(efrt.pack(words, options)), expectedWords(words), 'sample ' + sample)
  }
  t.end()
})
