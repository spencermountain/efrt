'use strict';
const test = require('tape');
const arr = require('./maleNames.js');
const trieHard = require('../src/index');

test('match-every-name:', function(t) {
  var str = trieHard.pack(arr);
  t.equal(typeof str, 'string', 'packed-string');

  var ptrie = trieHard.unpack(str);
  for (var i = 0; i < arr.length; i++) {
    var has = ptrie.isWord(arr[i]);
    t.equal(has, true, 'trie has \'' + arr[i] + '\'');
  }
  t.equal(ptrie.isWord('woodstock2'), false, 'no-false-positive');
  t.end();
});
