'use strict';
// const trieHard = require('./src');
// const debug = require('./test/debug');
const bits = require('./bits/bits.js');
const Trie = bits.Trie;
const RankDirectory = bits.RankDirectory;
const FrozenTrie = bits.FrozenTrie;

// create a trie
var trie = new Trie();

var words = [
  'cool',
  'happy',
  'coolish',
  'happier',
  'cooldude',
];
words.sort();
words.forEach((str) => {
  trie.insert(str);
});

// Encode the trie.
var trieData = trie.encode();

var L1 = 32 * 32;
var L2 = 32;

var directory = RankDirectory.Create(trieData, trie.getNodeCount() * 2 + 1, L1, L2);
var ftrie = new FrozenTrie(trieData, directory.getData(), trie.getNodeCount());

words.forEach((str) => {
  console.log(ftrie.lookup(str));
});
