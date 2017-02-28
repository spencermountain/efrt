'use strict';
let arr = require('./test/maleNames');
// const trieHard = require('./bits');
const trieHard = require('./src');
//
// arr = [
//   'fun',
//   'fungi',
//   'fund',
//   // 'fun2',
//   'funö',
// ];

arr = [
  'cool',
  'cool dude',
  'cool hat',
  'cool farm',
  'fun',
  'funghi',
  'fungho',
  'funzilla',
  'funzillo'
];
// console.time('pack');
let str = trieHard.pack(arr);
console.log(str.split(/;/g));
// console.timeEnd('pack');

console.log('\n\n');

// console.time('bench');
let trie = trieHard.unpack(str);

// console.log(trie.has('cool hat'));
// console.log(trie.has('fungho'));
// arr.forEach((str) => {
//   let bool = trie.has(str);
//   if (!bool) {
//     console.log(str);
//   }
// });
// console.timeEnd('bench');
