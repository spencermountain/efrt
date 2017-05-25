'use strict';
const efrt = require('./src');
const unpack = require('./builds/efrt-unpack.es6');
let words = require('./test/data/countries');

var packd = efrt.pack(['ohio', 'denmark', 'scandanavia', 'ontario']);
console.log(packd);
var trie = unpack(packd);
// var trie = efrt.unpack(packd);

console.log(trie.toArray());
