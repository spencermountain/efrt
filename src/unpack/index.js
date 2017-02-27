'use strict';
const FrozenTrie = require('./frozenTrie');
//
const unpack = (str) => {
  let parts = str.split(/\|/g);
  var ftrie = new FrozenTrie(parts[0], parts[1], parts[2]);
  return ftrie;
};
module.exports = unpack;
