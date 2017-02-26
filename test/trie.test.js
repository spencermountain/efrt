'use strict';
var test = require('tape');
const Trie = require('../src/pack/trie');
const trieHard = require('../src/index');


test('trie has everything:', function(t) {
  var arr = [
    'cool',
    'coolish',
    'cool hat',
    'cooledomingo',
  ];
  let trie = new Trie(arr);
  for (let i = 0; i < arr.length; i++) {
    var has = trie.isWord(arr[i])
    t.equal(has, true, 'trie has \'' + arr[i] + '\'')
  }
  t.equal(trie.isWord('farmington'), false, 'no-false-positive')
  t.end();
});

test('Ptrie has everything:', function(t) {
  var arr = [
    'cool',
    'coolish',
    'cool hat',
    'cooledomingo',
  ];
  let str = trieHard.pack(arr)
  t.equal(typeof str, 'string', 'packed-string')

  let ptrie = trieHard.unpack(str)
  for (let i = 0; i < arr.length; i++) {
    var has = ptrie.isWord(arr[i])
    t.equal(has, true, 'trie has \'' + arr[i] + '\'')
  }
  t.equal(ptrie.isWord('farmington'), false, 'no-false-positive')
  t.end();
});
