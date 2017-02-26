'use strict';
const Trie = require('./pack/trie');
const FrozenTrie = require('./unpack/frozenTrie');
const RankDirectory = require('./rankDirectory');
const config = require('./config');
const normalize = require('./normalize');

//
const pack = (words) => {
  var trie = new Trie();
  words.sort();
  words.forEach((str) => {
    str = normalize(str);
    trie.insert(str);
  });
  var trieData = trie.encode();
  // console.log(trie.root.children[0]);
  var nodes = trie.getNodeCount();
  var directory = RankDirectory.Create(trieData, nodes * 2 + 1, config.L1, config.L2);
  return {
    data: trieData,
    directory: directory.getData(),
    nodes: nodes
  };
};

const unpack = (o) => {
  var ftrie = new FrozenTrie(o.data, o.directory, o.nodes);
  return ftrie;
};
module.exports = {
  pack: pack,
  unpack: unpack
};
