import { pack, unpack } from './src/index.js'
// import efrt from './src/index.js'
// console.log(efrt)
// const efrt = require('./builds/efrt')
// let words = require('./test/data/countries');

const data = [
  "a_c",
]
const packd = pack(data)
console.log(packd, '\n')
const arr = Object.keys(unpack(packd))
console.log(arr)
