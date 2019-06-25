'use strict'
const test = require('tape')
const efrt = require('./lib/efrt')

test('uncompressable-array', function(t) {
  const arr = ['a', 'b', 'c', 'd', 'e', 'f']
  const str = efrt.pack(arr)
  const ptrie = efrt.unpack(str)
  for (let i = 0; i < arr.length; i++) {
    const has = ptrie.hasOwnProperty(arr[i])
    t.equal(has, true, "trie has '" + arr[i] + "'")
  }
  t.equal(ptrie.hasOwnProperty('z'), false, 'no-false-positive')
  t.end()
})

test('very-compressable-array', function(t) {
  const arr = [
    'aaa',
    'aa',
    'aaa',
    'aaa',
    'aaab',
    'a',
    'aaaa',
    'aö',
    'a a',
    // 'aA',
    "a's",
    'b',
    'proto neo antidisistablishmentarianism'
    // 'b22',
    // '35',
    // '1234e',
    // '567890',
    // 'fe567890',
    // 'workin\'',
  ]
  const str = efrt.pack(arr)
  const ptrie = efrt.unpack(str)
  for (let i = 0; i < arr.length; i++) {
    const has = ptrie.hasOwnProperty(arr[i])
    t.equal(has, true, "trie has '" + arr[i] + "'")
  }
  t.equal(ptrie.hasOwnProperty('zaaa'), false, 'no-false-positive')
  t.equal(ptrie.hasOwnProperty('z aaa'), false, 'no-false-positive-two-word')
  t.end()
})

test('tricky-subsets', function(t) {
  const arr = [
    'cool',
    'coolish',
    'cool hat',
    'cool hatting',
    'coold',
    'cool d',
    'cool dog',
    'fun',
    'fund',
    'd',
    'hat',
    'lkj hat',
    'fim hat'
  ]
  const str = efrt.pack(arr)
  const ptrie = efrt.unpack(str)
  for (let i = 0; i < arr.length; i++) {
    const has = ptrie.hasOwnProperty(arr[i])
    t.equal(has, true, "trie has '" + arr[i] + "'")
  }
  t.equal(ptrie.hasOwnProperty('zaaa'), false, 'no-false-positive')
  t.equal(ptrie.hasOwnProperty('z cool'), false, 'no-false-positive-two-word')
  t.equal(ptrie.hasOwnProperty('funish'), false, 'no-false-positive-shared')
  t.equal(ptrie.hasOwnProperty('fun hat'), false, 'no-false-positive-shared-two-word')
  t.equal(ptrie.hasOwnProperty('fun d'), false, 'no-false-positive-shared-two-word')
  t.end()
})

test('prefix-match-regression', function(t) {
  const arr = ['reno', 'chicago', 'fargo']
  const str = efrt.pack(arr)
  const trie = efrt.unpack(str)
  t.equal(trie.hasOwnProperty(''), false, 'empty-string-is-false')
  t.equal(trie.hasOwnProperty('chica'), false, 'does-not-match-prefix')
  t.equal(trie.hasOwnProperty('a'), false, 'does-not-match-prefix')
  t.equal(trie.hasOwnProperty('chicago'), true, 'matches-full')
  t.equal(trie.hasOwnProperty('fargo'), true, 'matches-full')
  t.end()
})

test('prefix-match-regression2', function(t) {
  const arr = ['chicago', 'fargo', 'chaska']
  const str = efrt.pack(arr)
  const trie = efrt.unpack(str)
  t.equal(trie.hasOwnProperty('ch'), false, 'prefix fails')
  t.equal(trie.hasOwnProperty('chicago'), true, 'matches-full')
  t.equal(trie.hasOwnProperty('chaska'), true, 'matches-full')
  t.end()
})
