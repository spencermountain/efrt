<div align="center">
  <img src="https://cloud.githubusercontent.com/assets/399657/21955696/46e882d4-da3e-11e6-94a6-720c34e27df7.jpg" />
  <div>trie-based compression of word-data</div>
  <a href="https://npmjs.org/package/efrt">
    <img src="https://img.shields.io/npm/v/compromise.svg?style=flat-square" />
  </a>
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-stable-green.svg?style=flat-square" />
  </a>
</div>

<div align="center">
  <sub>
    by
    <a href="https://github.com/spencermountain">Spencer Kelly</a> and
    <a href="https://github.com/nlp-compromise/efrt/graphs/contributors">
      contributors
    </a>
  </sub>
</div>

<div align="center">
  <code>npm i efrt</code>
</div>

<div align="center">
  inspect and play with english text.
  <div>
  compress a wordlist/dictionary into a very compact form, so that filesize/http/bandwidth is low
  </div>
</div>
<br/>

a prefix/suffix <a href="https://en.wikipedia.org/wiki/Trie">trie</a> optimised for compression of english words
based on [mckoss/lookups](https://github.com/mckoss/lookups) by [Mike Koss](https://github.com/mckoss)
 and [bits.js](http://stevehanov.ca/blog/index.php?id=120) by [Steve Hanov](https://twitter.com/smhanov)

clients though can query from the compressed form ultra-quick, with performance that's comparable to a straight-up javascript obj.

By doing the fancy stuff ahead-of-time, `efrt` lets you ship much bigger word-lists to the client-side, while ensuring there's no big unpacking step - so that users are always on the critical path.

```js
var efrt = require('efrt')//
var words = [
  'coolage', //must boring, lowercase, non-unicode
  'cool',
  'cool cat',
  'cool.com',
  'coolamungo'
];
//pack these words as tightly as possible
var compressed = efrt.pack(words);
//cool0;! cat,.com,a0;ge,mungo

//pull it apart into a lookup-trie
var trie = efrt.unpack(compressed);

//hit it!
console.log(trie.has('cool'));//true
console.log(trie.has('miles davis'));//false
```

## [Demo](https://rawgit.com/nlp-compromise/efrt/master/demo/index.html)

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
