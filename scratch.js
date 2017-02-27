'use strict';
const arr = require('./test/maleNames');
const trieHard = require('./src');

// var words = [
//   'cool',
//   'cool hat',
// ];
let str = trieHard.pack(arr);
console.log(str);
let trie = trieHard.unpack(str);
console.log(trie.has('mike'));
console.log(trie.has('cool hat'));
