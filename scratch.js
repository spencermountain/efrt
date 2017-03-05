'use strict';
// let arr = require('./test/data/maleNames');
const efrt = require('./src');

var words = [
  'coolage', //must boring, lowercase, non-unicode
  'cool',
  'cool cat',
  'cool.com',
  'coolamungo'
];
//pack these words as tightly as possible
var compressed = efrt.pack(words);
console.log(compressed);
//(some insanely-small string of letters+numbers)

//pull it apart into a lookup-trie
var trie = efrt.unpack(compressed);

//hit it!
console.log(trie.has('cool')); //true
console.log(trie.has('miles davis')); //false
