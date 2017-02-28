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

// arr = [
//   'cool',
//   'cool dude',
//   'cool hat',
//   'cool farm',
//   'fun',
//   'funghi',
//   'fungho',
//   'funzilla',
//   'funzillo'
// ];
// console.time('pack');
let str = trieHard.pack(arr);
// console.log(str.split(/;/g));
// console.timeEnd('pack');

console.log('\n\n');

console.time('bench');
let trie = trieHard.unpack(str);

// console.log(trie.has('fungho'));
arr.forEach((s) => {
  let bool = trie.has(s);
  if (!bool) {
    console.log(s);
  }
});
console.timeEnd('bench');

// console.time('one');
// console.log(trie.has('mark'));
// console.timeEnd('one');
