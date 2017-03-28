'use strict';
var test = require('tape');
const efrt = require('./lib/efrt');

test('uncompressable-array', function(t) {
  var arr = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
  ];
  var str = efrt.pack(arr);
  var ptrie = efrt.unpack(str);
  for (var i = 0; i < arr.length; i++) {
    var has = ptrie.has(arr[i]);
    t.equal(has, true, 'trie has \'' + arr[i] + '\'');
  }
  t.equal(ptrie.has('z'), false, 'no-false-positive');
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
    'aö',
    'a a',
    'aA',
    'a\'s',
    'b',
    'proto neo antidisistablishmentarianism'
  // 'b22',
  // '35',
  // '1234e',
  // '567890',
  // 'fe567890',
  // 'workin\'',
  ];
  var str = efrt.pack(arr);
  var ptrie = efrt.unpack(str);
  for (var i = 0; i < arr.length; i++) {
    var has = ptrie.has(arr[i]);
    t.equal(has, true, 'trie has \'' + arr[i] + '\'');
  }
  t.equal(ptrie.has('zaaa'), false, 'no-false-positive');
  t.equal(ptrie.has('z aaa'), false, 'no-false-positive-two-word');
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
  var str = efrt.pack(arr);
  var ptrie = efrt.unpack(str);
  for (var i = 0; i < arr.length; i++) {
    var has = ptrie.has(arr[i]);
    t.equal(has, true, 'trie has \'' + arr[i] + '\'');
  }
  t.equal(ptrie.has('zaaa'), false, 'no-false-positive');
  t.equal(ptrie.has('z cool'), false, 'no-false-positive-two-word');
  t.equal(ptrie.has('funish'), false, 'no-false-positive-shared');
  t.equal(ptrie.has('fun hat'), false, 'no-false-positive-shared-two-word');
  t.equal(ptrie.has('fun d'), false, 'no-false-positive-shared-two-word');
  t.end();
});

test('prefix-match-regression', function(t) {
  var arr = [
    'reno', 'chicago', 'fargo'
  ];
  let str = efrt.pack(arr);
  let trie = efrt.unpack(str);
  t.equal(trie.has(''), false, 'empty-string-is-false');
  t.equal(trie.has('chica'), false, 'does-not-match-prefix');
  t.equal(trie.has('a'), false, 'does-not-match-prefix');
  t.equal(trie.has('chicago'), true, 'matches-full');
  t.equal(trie.has('fargo'), true, 'matches-full');
  t.end();
});

test('prefix-match-regression2', function(t) {
  var arr = [
    'chicago',
    'fargo',
    'chaska',
  ];
  let str = efrt.pack(arr);
  let trie = efrt.unpack(str);
  t.equal(trie.has('ch'), false, 'prefix fails');
  t.equal(trie.has('chicago'), true, 'matches-full');
  t.equal(trie.has('chaska'), true, 'matches-full');
  t.end();
});
