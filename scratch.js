'use strict';
const efrt = require('./src');
// const unpack = require('./builds/efrt-unpack.es6');
// let words = require('./test/data/countries');

var foods = {
  strawberry: 'fruit',
  blueberry: 'fruit',
  blackberry: 'fruit',
  tomato: ['fruit', 'vegetable'],
  cucumber: 'vegetable',
  pepper: 'vegetable'
};
var packd = efrt.pack(foods);
console.log(packd, '\n');
var obj = efrt.unpack(packd);
console.log(obj);
