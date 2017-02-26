'use strict';
const trieHard = require('./src');
let arr = [
  'cool',
  'coolish',
  'cool hat',
  'cooledomingo',
  'zzzzzzzzzz',
  'zzzzzzzzzzzz'
];

let str = trieHard.pack(arr);
// console.log(str)

let trie = trieHard.unpack(str)
// console.log(trie)

for (let i = 0; i < arr.length; i++) {
  if (!trie.isWord(arr[i])) {
    console.log(arr[i]);
  }
}
console.log(trie.isWord('cool hat'));
