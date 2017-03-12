//test the compression amount
require('shelljs/global');
const fs = require('fs');
const efrt = require('../src');

let pos = 'nouns';
console.log('===' + pos + '===');
let file = '/home/spencer/nlp/wordnet.js/' + pos + '.json';
let out = './tmp.txt';

var fileSize = function(src) {
  var stats = fs.statSync(src);
  var num = (stats['size'] / 1000.0).toFixed(2);
  console.log('  ' + num + 'kb');
  return num;
};

let arr = require(file);
console.log('before:');
console.log('  ' + arr.length + ' words');
let before = fileSize(file);
console.log('  ...\n\n');
let str = efrt.pack(arr);

console.log('after:');
fs.writeFileSync(out, str);
let after = fileSize(out);

console.log('\n\n');

let percent = (before - after) / before;
console.log(parseInt(percent * 100) + '% compressed');


exec('rm ' + out);
