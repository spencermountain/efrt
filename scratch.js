import { pack, unpack } from './src/index.js'
// import efrt from './src/index.js'
// console.log(efrt)
// const efrt = require('./builds/efrt')
// let words = require('./test/data/countries');

const data = [
  'better',
  'earlier',
  'sounds',
  'a few',
  'here',
  'no doubt',
  'is',
  'are',
  'was',
  'were',
  'am',
  'if',
  'unless',
  'said',
  'had',
  'been',
  'began',
  'came',
  'did',
  'meant',
  'went',
  'taken',
  'going',
  'being',
  'according',
  'resulting',
  'developing',
  'staining',
  'not',
  'non',
  'never',
  'no',
  'where',
  'why',
  'when',
  'who',
  'whom',
  'whose',
  'what',
  'which',
  "how's",
  'how come',
  'ad hominem',
  'banking',
  'body',
  'boyfriend',
  'breakfast',
  'canary',
  'ceiling',
  'chocolate',
  'city',
  'civil war',
  'credit card',
  'death',
  'dinner',
  'documentary'
]
const packd = pack([])
console.log(packd, '\n')
const arr = Object.keys(unpack(packd))
console.log(arr)
