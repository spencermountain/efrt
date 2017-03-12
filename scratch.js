'use strict';
const efrt = require('./src');
// const wordnet = require('/home/spencer/nlp/wordnet.js');

// let words = require('./test/data/maleNames');
let words = require('./test/data/adjectives');
// words = [
//   'Neanderthal',
//   'Neandertal',
//   'Neanderthalian',
//   'criterial',
//   'criterional',
//   'unexclusive',
//   'unrestricted',
//   'axiomatic',
// ];
var compressed = efrt.pack(words);
var trie = efrt.unpack(compressed);
console.log(trie.has('neanderthalian'));

//
// for (var i = 0; i < words.length; i++) {
//   var has = trie.has(words[i]);
//   if (!has) {
//     console.log(words[i]);
//   }
// }

// wordnet.words((arr) => {
//   console.log(arr);
// });
