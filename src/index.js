'use strict';
const Trie = require('./build/trie');

const create = function(arr) {
  let t = new Trie(arr)
  return t.pack();
}
const unpack = function(str) {}
module.exports = Trie
