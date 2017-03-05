'use strict';
let arr = require('./test/maleNames');
// const trieHard = require('./bits');
const trieHard = require('./src');
//
arr = [
  // 'chicago', 'fargo',
  'coolish',
  // 'cool',
  'coolhat',
// 'cool hatting',
// 'coold',
];
// console.time('pack');
let str = trieHard.pack(arr);
let trie = trieHard.unpack(str);

// arr.forEach((s) => {
//   let bool = trie.has(s);
//   if (!bool) {
//     console.log(s);
//   }
// });


// console.log(trie.has(''));
// console.log('\n\n');
// console.log('chica - ' + trie.has('chica'));
// console.log('chicago - ' + trie.has('chicago'));
// console.log('cool - ' + trie.has('cool'));
console.log('cool - ' + trie.has('cool'));
