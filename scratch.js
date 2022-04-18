import { pack, unpack } from './src/index.js'
// import efrt from './src/index.js'
// console.log(efrt)
// const efrt = require('./builds/efrt')
// let words = require('./test/data/countries');

const data = [
  "Brian Vollmer",
  "Brian Wansink",
  "Brice Marden",
  "Brideless Groom",
  "Bridge Constructor Portal",
  "Bridge Protocol Data Unit",
  "Bridget Kearney",
  "Bridget Malcolm",
  "Bridgewater State University",
  "Bridie",
]
const packd = pack(data)
console.log(packd, '\n')
const arr = Object.keys(unpack(packd))
console.log(arr)
