'use strict'
const test = require('tape')
const efrt = require('./lib/efrt')

test('Ptrie has everything:', function(t) {
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
