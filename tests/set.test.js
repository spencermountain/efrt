import test from 'tape'
import { runInNewContext } from 'node:vm'
import efrt from './_lib.js'

test('Sets use the same encoding as arrays across packing options', function (t) {
  const words = ['Apple', 'pear2', 'café', '😀', '__proto__', 'back\\slash']
  const input = new Set(words)
  for (const direction of ['prefix', 'suffix', 'auto']) {
    for (const dictionary of [false, true]) {
      const options = { direction, dictionary, strict: true }
      const packed = efrt.pack(input, options)
      t.equal(packed, efrt.pack(words, options), direction + ', dictionary=' + dictionary)
      t.deepEqual(efrt.unpack(packed), {
        apple: true, pear2: true, café: true, '😀': true,
        ['__proto__']: true, 'back\\slash': true
      }, 'unpacks to boolean memberships')
    }
  }
  t.deepEqual(Array.from(input), words, 'input Set is unchanged')
  const foreign = runInNewContext('new Set(["apple", "pear"])')
  t.equal(efrt.pack(foreign), efrt.pack(['apple', 'pear']), 'cross-realm Set')
  t.end()
})

test('Set validation and normalization match arrays', function (t) {
  t.equal(efrt.pack(new Set()), '', 'empty Set')
  t.deepEqual(efrt.unpack(efrt.pack(new Set(), { strict: true })), {}, 'empty strict Set')
  t.deepEqual(efrt.unpack(efrt.pack(new Set(['Apple', 'apple', 'bad!', '']))), { apple: true }, 'merge collisions and drop unsupported keys')
  t.equal(efrt.pack(new Set(['Apple', 'Apple']), { strict: true }), efrt.pack(['Apple']), 'exact duplicates allowed')
  t.throws(() => efrt.pack(new Set(['Apple', 'apple']), { strict: true }), /both normalize/, 'strict normalization collision')
  for (const key of ['', 'bad!', 'a|b']) {
    t.throws(() => efrt.pack(new Set([key]), { strict: true }), /unsupported key/, 'strict invalid key')
  }
  for (const key of [1, null, undefined, {}]) {
    t.throws(() => efrt.pack(new Set([key]), { strict: true }), /Set keys must be strings/, 'strict non-string entry')
  }
  t.equal(efrt.pack(new Set([1, null])), efrt.pack([1, null]), 'permissive coercion matches arrays')
  t.throws(() => efrt.pack(new Set(['a'.repeat(1025)])), /keys cannot exceed/, 'length limit')
  t.end()
})
