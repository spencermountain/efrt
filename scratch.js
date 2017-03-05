'use strict';
let arr = require('./test/maleNames');
// const trieHard = require('./bits');
const trieHard = require('./src');
//
arr = [
  'chicago', 'ago',
];
let str = trieHard.pack(arr);
console.log(str);
let trie = trieHard.unpack(str);

// console.log(trie.has(''));
console.log(trie.has('chica'));
