import test from 'tape'
import efrt from './_lib.js'

test('Ptrie has everything:', function (t) {
  const arr = ['cool', 'coolish', 'cool hat', 'cooledomingo']
  const str = efrt.pack(arr)
  t.equal(typeof str, 'string', 'packed-string')
  const ptrie = efrt.unpack(str)
  for (let i = 0; i < arr.length; i++) {
    const has = ptrie.hasOwnProperty(arr[i])
    t.equal(has, true, "trie has '" + arr[i] + "'")
  }
  t.equal(ptrie.hasOwnProperty('farmington'), false, 'no-false-positive')
  t.end()
})

test('support unicode chars:', function (t) {
  const arr = ['coëol', 'coo👍lish', 'cool_hat', 'coole👨‍👩‍👧‍👧domingo', '@#$%^&*()_+=-', '~`"\\', '_', '__']
  const str = efrt.pack(arr)
  t.equal(typeof str, 'string', 'packed-string')
  const ptrie = efrt.unpack(str)
  for (let i = 0; i < arr.length; i++) {
    const has = ptrie.hasOwnProperty(arr[i])
    t.equal(has, true, "trie has '" + arr[i] + "'")
  }
  t.equal(ptrie.hasOwnProperty('rmi👨‍👩‍👧‍👧n'), false, 'no-false-positive')
  t.end()
})

test('support internal underscore names:', function (t) {
  const arr = [
    '_d',
    '_v',
    '_c',
    '_g',
    '_n',
    '_',
    'foo_d',
    '_f',
  ]
  const str = efrt.pack(arr)
  t.equal(typeof str, 'string', 'packed-string')
  const ptrie = efrt.unpack(str)
  for (let i = 0; i < arr.length; i++) {
    const has = ptrie.hasOwnProperty(arr[i])
    t.equal(has, true, "trie has '" + arr[i] + "'")
  }
  t.equal(ptrie.hasOwnProperty('_x'), false, 'no-false-positive')
  t.end()
})
