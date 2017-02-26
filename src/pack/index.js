'use strict';
const Trie = require('./trie');

//turn an array into a compressed string
const pack = function(arr) {
  let t = new Trie(arr)
  return t.pack();
}
module.exports = pack
