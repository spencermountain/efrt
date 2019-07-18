'use strict'
const efrt = require('./src')
// const unpack = require('./builds/efrt-unpack.es6');
// let words = require('./test/data/countries');

const data = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december'
]
const packd = efrt.pack(data)
console.log(packd, '\n')
const arr = Object.keys(efrt.unpack(packd))
console.log(arr)
