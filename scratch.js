'use strict';
let arr = require('./test/maleNames');
// const trieHard = require('./bits');
const trieHard = require('./src');
//
arr = [
  'Reno', 'Chicago', 'Fargo', 'Minnesota',
  'Buffalo', 'Toronto', 'Winslow', 'Sarasota',
  'Wichita', 'Tulsa', 'Ottawa', 'Oklahoma',
  'Tampa', 'Panama', 'Mattawa', 'La Paloma',
  'Bangor', 'Baltimore', 'Salvador', 'Amarillo',
  'Tocapillo', 'Baranquilla', 'and Perdilla'
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
//

// console.log(trie.has(''));
console.log(trie.has('chica'));
