'use strict';
const efrt = require('./src');
let words = require('./test/data/maleNames');
console.log(words.length);

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
console.time('plain-lookup');
trie.has('tim');
console.timeEnd('plain-lookup');

console.time('cache');
trie.cache();
console.timeEnd('cache');

console.time('cached-lookup');
trie.has('tim');
console.timeEnd('cached-lookup');

//hit it!
// console.log(trie.has('cool')); //true
// console.log(trie.has('miles davis')); //false
