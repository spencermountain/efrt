'use strict';
const trieHard = require('./src');

var words = [
  'farm',
  'farout',
];
let obj = trieHard.pack(words);
let trie = trieHard.unpack(obj);
// console.log(trie.lookup('cool'));
// console.log(trie.lookup('9'));
console.log(trie.lookup('farm'));
console.log(trie.getNodeByIndex(2));
