'use strict';
const trieHard = require('./src');

var words = [
  'cool',
  'happy',
  'coolish',
  'happier',
  'cooldude',
];
let obj = trieHard.pack(words);
let trie = trieHard.unpack(obj);
console.log(trie.lookup('coolish'));
