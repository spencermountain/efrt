'use strict';
const trieHard = require('./src');
const debug = require('./test/debug');

var arr = [
  'brian',
  'bruce',
  'bryan',
  'bryat',
  'bryon',
  'bu',
  'dejan',
  'burton',
  // 'byron',
  'caleb',
  'calvin',
  'carlo',
  'carlton',
  'carroll',
  'cedric',
  'cesar',
  'cha',
  'charle',
  // 'charli',
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
  'dever',
];

let str = trieHard.pack(arr);
// debug(str);

let trie = trieHard.unpack(str);
// console.log(trie);

console.log('\n');
for (let i = 0; i < arr.length; i++) {
  if (!trie.isWord(arr[i])) {
    console.log(arr[i]);
  }
}
console.log(trie.isWord('dejan'));
console.log(trie.words('de'));
