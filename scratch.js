'use strict';
const trieHard = require('./src');

var words = [
  'cool',
  'c sharp',
];
let obj = trieHard.pack(words);
let trie = trieHard.unpack(obj);
console.log(trie.lookup('cool'));
console.log(trie.lookup('c sharp'));
