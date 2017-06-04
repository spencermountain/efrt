'use strict';
const efrt = require('./src');
// const unpack = require('./builds/efrt-unpack.es6');
// let words = require('./test/data/countries');

var packd = efrt.pack({
  ohio: 'Place',
  denmark: 'Place',
  scandanavia: 'Place',
  ontario: 'Place',
  sally: 'Person',
  sara: 'Person',
  orlando: 'Person'
});
console.log(packd);
console.log('');
// var trie = efrt.unpack(packd);
// console.log(trie);
