'use strict';
const FrozenTrie = require('./frozenTrie');
//
const unpack = (o) => {
  var ftrie = new FrozenTrie(o.data, o.directory, o.nodes);
  return ftrie;
};
module.exports = unpack;
