import test from 'tape'
import efrt from './_lib.js'
import fns from '../src/pack/fns.js'

test('packing directions preserve categories, normalization, and UTF-8', function (t) {
  const inputs = [
    ['singing', 'ringing', 'bringing', 'swinging'],
    ['ΟΣ', 'ΟΣΑ', 'İX', '😀a', '😁a', '𠀀a'],
    ['_c', '__proto__', 'a', 'ab', 'abc'],
    { apple: ['fruit', 'green'], pear: 'fruit', '__proto__fruit': 'constructor' },
    { Apple: 'fruit', apple: 'company', apple1: 'fruit', '': 'fruit' },
    ['apple1', ''], [], {}, null, 'singing ringing bringing'
  ]
  for (const input of inputs) {
    const expected = efrt.unpack(efrt.pack(input))
    for (const direction of ['prefix', 'suffix', 'auto']) {
      const packed = efrt.pack(input, { direction })
      t.deepEqual(efrt.unpack(Buffer.from(packed).toString('utf8')), expected,
        direction + ' round trip: ' + JSON.stringify(input))
    }
    t.equal(efrt.pack(input, { direction: 'prefix' }), efrt.pack(input), 'default bytes unchanged')
  }
  for (const direction of ['suffix', 'auto']) {
    t.throws(() => efrt.pack(['Apple', 'apple'], { strict: true, direction }),
      /both normalize/, 'strict validation precedes reversal')
    t.throws(() => efrt.pack(['apple!'], { strict: true, direction }),
      /unsupported key/, 'strict validation still rejects reserved characters')
    t.throws(() => efrt.pack(['İ'.repeat(513)], { direction }),
      /keys cannot exceed/, 'length limit applies before reversal')
  }
  t.end()
})

test('auto chooses direction independently per category including marker cost', function (t) {
  const groups = {
    verbs: ['singing', 'ringing', 'bringing', 'swinging'],
    fruit: ['apple'],
    unicode: ['😀a', '😁a', '𠀀a', 'ΟΣ', 'ΟΣΑ']
  }
  const input = {}
  const expected = []
  for (const [category, words] of Object.entries(groups)) {
    const data = Object.fromEntries(words.map((word) => [word, category]))
    Object.assign(input, data)
    const prefix = efrt.pack(data, { direction: 'prefix' })
    const suffix = efrt.pack(data, { direction: 'suffix' })
    expected.push(Buffer.byteLength(suffix) < Buffer.byteLength(prefix) ? suffix : prefix)
  }
  const packed = efrt.pack(input, { direction: 'auto' })
  t.equal(packed, expected.join('|'), 'selects the smaller complete category encoding')
  t.ok(packed.includes('verbs¦:'), 'marks the reversed category')
  t.ok(packed.includes('fruit¦apple'), 'leaves the forward category unmarked')
  t.deepEqual(efrt.unpack(packed), efrt.unpack(efrt.pack(input)), 'mixed directions decode together')
  t.equal(efrt.pack(['apple'], { direction: 'suffix' }), 'true¦:elppa', 'single-byte marker')
  t.equal(efrt.pack(['aa', 'ab'], { direction: 'auto' }), 'true¦a0;a,b',
    'ties including the marker keep prefix-first output')
  t.deepEqual(efrt.unpack('true¦:0:1;a0b0;c'), { ca: true, cb: true },
    'direction marker coexists with symbol definitions')
  t.throws(() => efrt.unpack('true¦::apple'), SyntaxError, 'rejects duplicate direction markers')
  for (const direction of ['', 'reverse', true, null, 1]) {
    t.throws(() => efrt.pack([], { direction }), /direction must be/, 'rejects invalid direction')
  }
  for (const str of ['abc', 'é', '漢', '😀', '\ud800', 'aé漢😀']) {
    t.equal(fns.utf8Length(str), Buffer.byteLength(str), 'UTF-8 cost: ' + JSON.stringify(str))
  }
  t.end()
})
