'use strict';
const Trie = require('./pack/trie');
const Ptrie = require('./unpack/ptrie');

//turn an array into a compressed string
const pack = function(arr) {
  let t = new Trie(arr)
  return t.pack();
}

//turn that compressed string into a queryable string
const unpack = function(str) {
  return new Ptrie(str)
}

module.exports = {
  pack: pack,
  unpack: unpack
}
