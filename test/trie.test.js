'use strict';
var test = require('tape');
const Trie = require('../src');

test('trie has everything:', function(t) {
  var arr = [
    'cool',
    'coolish',
    'cool hat',
    'cooledomingo',
  ];
  let tree = new Trie(arr);
  for (let i = 0; i < arr.length; i++) {
    var has = tree.isWord(arr[i])
    t.equal(has, true, 'trie has \'' + arr[i] + '\'')
  }
  t.end();
});
