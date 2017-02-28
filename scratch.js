'use strict';
const arr = require('./test/maleNames');
// const trieHard = require('./bits');
const trieHard = require('./lookup');

// var words = [
//   'cool',
//   'cool hat',
// ];
console.time('pack');
let str = trieHard.pack(arr);
console.log(str);
console.timeEnd('pack');

console.time('unpack');
let trie = trieHard.unpack(str);
console.timeEnd('unpack');


console.time('query');
console.log(trie.has('darius'));
console.timeEnd('query');

console.time('query2');
console.log(trie.has('cool hat'));
console.timeEnd('query2');
