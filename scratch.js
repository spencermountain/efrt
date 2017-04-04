'use strict';
const efrt = require('./src');
const unpack = require('./builds/efrt-unpack.es6');
let words = require('./test/data/countries');

var packd = efrt.pack(words);
var trie = unpack(packd);
// var trie = efrt.unpack(packd);

console.log(trie.toArray());
