//test the compression amount
require('shelljs/global')
const fs = require('fs')
const efrt = require('../src')

const pos = 'nouns'
console.log('===' + pos + '===')
const file = '/home/spencer/nlp/wordnet.js/' + pos + '.json'
const out = './tmp.txt'

const fileSize = function(src) {
  const stats = fs.statSync(src)
  const num = (stats['size'] / 1000.0).toFixed(2)
  console.log('  ' + num + 'kb')
  return num
}

const arr = require(file)
console.log('before:')
console.log('  ' + arr.length + ' words')
const before = fileSize(file)
console.log('  ...\n\n')
const str = efrt.pack(arr)

console.log('after:')
fs.writeFileSync(out, str)
const after = fileSize(out)

console.log('\n\n')

const percent = (before - after) / before
console.log(parseInt(percent * 100) + '% compressed')

exec('rm ' + out)
