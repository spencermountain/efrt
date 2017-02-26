'use strict';
const test = require('tape');
const arr = require('./maleNames');
const trieHard = require('../src/index');

test('match-every-name:', function(t) {
  var str = trieHard.pack(arr);
  var ptrie = trieHard.unpack(str);
  for (var i = 0; i < arr.length; i++) {
    var has = ptrie.lookup(arr[i]);
    t.equal(has, true, 'trie has \'' + arr[i] + '\'');
  }
  t.equal(ptrie.lookup('woodstock2'), false, 'no-false-positive');
  t.end();
});
