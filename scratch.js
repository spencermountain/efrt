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

console.time('cache');
trie.cache();
console.timeEnd('cache');
console.log('\n\n');

console.time('lookup');
console.log(trie.has('bryce'));
console.log(trie.has('bruno'));
console.log(trie.has('john'));
console.timeEnd('lookup');

//hit it!
// console.log(trie.has('cool')); //true
// console.log(trie.has('miles davis')); //false
