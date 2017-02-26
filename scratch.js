'use strict';
const trieHard = require('./src');
const debug = require('./test/debug');

let arr = [
  // 'cool',
  // 'coolish',
  // 'cool hat',
  // 'cool hatting',
  'cool3',
// 'fun',
// 'funish',
// 'smoke',
// 'turkey'
// 'lkj hat',
// 'fim hat'
];

let str = trieHard.pack(arr);
debug(str);

let trie = trieHard.unpack(str);
console.log(trie);

console.log('\n');
for (let i = 0; i < arr.length; i++) {
  if (!trie.isWord(arr[i])) {
    console.log(arr[i]);
  }
}
console.log(trie.isWord('cool hat'));
