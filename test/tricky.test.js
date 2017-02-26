'use strict';
var test = require('tape');
const trieHard = require('../src/index');

test('uncompressable-array', function(t) {
  var arr = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
  ];
  var str = trieHard.pack(arr);
  var ptrie = trieHard.unpack(str);
  for (var i = 0; i < arr.length; i++) {
    var has = ptrie.lookup(arr[i]);
    t.equal(has, true, 'trie has \'' + arr[i] + '\'');
  }
  t.equal(ptrie.lookup('z'), false, 'no-false-positive');
  t.end();
});

test('very-compressable-array', function(t) {
  var arr = [
    'aaa',
    'aa',
    'aaa',
    'aaa',
    'aaab',
    'a',
    'aaaa',
    'b',
    'b22',
    '35',
    '1234e',
    '567890',
    'fe567890',
    'workin\'',
  ];
  var str = trieHard.pack(arr);
  var ptrie = trieHard.unpack(str);
  for (var i = 0; i < arr.length; i++) {
    var has = ptrie.lookup(arr[i]);
    t.equal(has, true, 'trie has \'' + arr[i] + '\'');
  }
  t.equal(ptrie.lookup('zaaa'), false, 'no-false-positive');
  t.equal(ptrie.lookup('z aaa'), false, 'no-false-positive-two-word');
  t.end();
});

test('tricky-subsets', function(t) {
  let arr = [
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
  ];
  var str = trieHard.pack(arr);
  var ptrie = trieHard.unpack(str);
  for (var i = 0; i < arr.length; i++) {
    var has = ptrie.lookup(arr[i]);
    t.equal(has, true, 'trie has \'' + arr[i] + '\'');
  }
  t.equal(ptrie.lookup('zaaa'), false, 'no-false-positive');
  t.equal(ptrie.lookup('z cool'), false, 'no-false-positive-two-word');
  t.equal(ptrie.lookup('funish'), false, 'no-false-positive-shared');
  t.equal(ptrie.lookup('fun hat'), false, 'no-false-positive-shared-two-word');
  t.equal(ptrie.lookup('fun d'), false, 'no-false-positive-shared-two-word');
  t.end();
});
