'use strict';
const efrt = require('./src');
let words = require('./test/data/maleNames');

// var words = [
//   'bruce',
//   'bruno',
//   'bryan',
//   'bryant',
//   'bryce',
// ];
//pack these words as tightly as possible
var compressed = efrt.pack(words);
// console.log(compressed);
//(some insanely-small string of letters+numbers)

//pull it apart into a lookup-trie
var trie = efrt.unpack(compressed);
// console.log(trie);
console.time('lookup1');
trie.has('bryce');
trie.has('bruno');
trie.has('john');
console.timeEnd('lookup1');

console.time('cache');
trie.cache();
console.timeEnd('cache');

console.time('lookup2');
trie.has('bryce');
trie.has('bruno');
trie.has('john');
console.timeEnd('lookup2');

//hit it!
// console.log(trie.has('cool')); //true
// console.log(trie.has('miles davis')); //false
