<div align="center">
  <img src="https://cloud.githubusercontent.com/assets/399657/23590290/ede73772-01aa-11e7-8915-181ef21027bc.png" />
  <div>trie-based compression of word-data</div>
  <a href="https://npmjs.org/package/efrt">
    <img src="https://img.shields.io/npm/v/efrt.svg?style=flat-square" />
  </a>
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-stable-green.svg?style=flat-square" />
  </a>
</div>

<div align="center">
  <code>npm i efrt</code>
</div>

`efrt` is a prefix/suffix [trie](https://en.wikipedia.org/wiki/Trie) optimised for compression of english words.

it is based on [mckoss/lookups](https://github.com/mckoss/lookups) by [Mike Koss](https://github.com/mckoss)
 and [bits.js](http://stevehanov.ca/blog/index.php?id=120) by [Steve Hanov](https://twitter.com/smhanov)

 * squeeze a list of words into a very compact form
 * reduce filesize/bandwidth a bunch
 * ensure unpacking overhead is negligible
 * word-lookups are critical-path

By doing the fancy stuff ahead-of-time, **efrt** lets you ship much bigger word-lists to the client-side, without much hassle.

```js
var efrt = require('efrt')
var words = [
  'coolage',
  'cool',
  'cool cat',
  'cool.com',
  'coolamungo'
];

//pack these words as tightly as possible
var compressed = efrt.pack(words);
//cool0;! cat,.com,a0;ge,mungo

//create a lookup-trie
var trie = efrt.unpack(compressed);

//hit it!
console.log(trie.has('cool'));//true
console.log(trie.has('miles davis'));//false
```

### [Demo!](https://rawgit.com/nlp-compromise/efrt/master/demo/index.html)

if you're doing the second step in the client, you can load only the unpack-half of the library(~3k):
```html
<script src="./builds/efrt-unpack.min.js"></script>
<script>
  $.get('./compressedStuff.txt', (str)=>{
    var trie=unpack(str);
    trie.has('miles davis');
  })
</script>
```

the words you input should be pretty normalized. Spaces and unicode are good, but numbers, case-sensitivity, and some punctuation are not (yet) supported.
