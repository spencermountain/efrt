'use strict';
const Trie = require('./pack/trie');
const Ptrie = require('./unpack/ptrie');

const pack = function(arr) {
  let t = new Trie(arr)
  return t.pack();
}
const unpack = function(str) {
  return new Ptrie(str)
}
module.exports = Trie

module.exports = {
  pack: pack,
  unpack: unpack
}
