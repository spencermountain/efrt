'use strict';
const efrt = require('./src');
// const unpack = require('./builds/efrt-unpack.es6');
// let words = require('./test/data/countries');

var words = {
  bedfordshire: 'England',
  berkshire: 'England',
  bristol: 'England',
  buckinghamshire: 'England',
  bambridgeshire: 'England',
  cheshire: 'England',

  aberdeenshire: 'Scotland',
  angus: 'Scotland',
  argyllshire: 'Scotland',
  ayrshire: 'Scotland',
  banffshire: 'Scotland',
  berwickshire: 'Scotland'
};

var packd = efrt.pack(words);
console.log(packd);
console.log('');
// var trie = efrt.unpack(packd);
// console.log(trie);
