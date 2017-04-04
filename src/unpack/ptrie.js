'use strict';
const parseSymbols = require('./symbols');
const methods = require('./methods');

//PackedTrie - Trie traversal of the Trie packed-string representation.
const PackedTrie = function(str) {
  this.nodes = str.split(';'); //that's all ;)!
  this.syms = [];
  this.symCount = 0;
  this._cache = null;
  //process symbols, if they have them
  if (str.match(':')) {
    parseSymbols(this);
  }
};

Object.keys(methods).forEach(function(k) {
  PackedTrie.prototype[k] = methods[k];
});

module.exports = PackedTrie;
