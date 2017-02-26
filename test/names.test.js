'use strict';
const test = require('tape');
const debug = require('./debug');
// const arr = require('./maleNames.j');
const trieHard = require('../src/index');

var arr = [
  'brian',
  'bruce',
  'bryan',
  'bryant',
  'bryce',
  'bryon',
  'buddy',
  'dejan',
  'burton',
  'byron',
  'caleb',
  'calvin',
  'carlo',
  'carlton',
  'carroll',
  'cedric',
  'cesar',
  'cha',
  'charle',
  'charli',
  'chester',
  'chri',
  'christian',
  'christopher',
  'chuck',
  'clarence',
  'clark',
  'claude',
  'clay',
  'clayton',
  'damian',
  'damien',
  'damon',
  'daniel',
  'danny',
  'darin',
  'dariu',
  'darwin',
  'daryl',
  'dav',
  'davi',
  'david',
  'dean',
  'delbert',
  'deni',
  'demetriu',
  'denni',
  'derek',
  'derrick',
  'desmond',
  'deven',
  'devin',
  'dewayne',
  'dewey',
  'dexter',
];
console.log(arr.join(' '));

test('match-every-name:', function(t) {
  var str = trieHard.pack(arr);
  t.equal(typeof str, 'string', 'packed-string');
  console.log(str);
  debug(str);
  var ptrie = trieHard.unpack(str);
  for (var i = 0; i < arr.length; i++) {
    var has = ptrie.isWord(arr[i]);
    t.equal(has, true, 'trie has \'' + arr[i] + '\'');
  }
  t.equal(ptrie.isWord('woodstock2'), false, 'no-false-positive');
  t.end();
});
