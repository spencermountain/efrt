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

<h3 align="center">
  <a href="https://rawgit.com/nlp-compromise/efrt/master/demo/index.html">Demo!</a>
</h3>


the words you input should be pretty normalized. Spaces and unicode are good, but numbers, case-sensitivity, and some punctuation are not (yet) supported.

##Performance
there are two modes that `efrt` can run in, depending on what you want to optimise for:
```js
var compressed = efrt.pack(skateboarders);//1k names (on macbook)
var trie = efrt.unpack(compressed)
trie.has('tony hawk')
// trie-lookup: 1.1ms

trie.cache()
// caching-step: 5.1ms

trie.has('tony hawk')
// cached-lookup: 0.02ms
```
the `trie.cache()` command will spin the trie into a good-old javascript object, for faster lookups. It takes some time though.

In this example, with 1k words, it makes sense to hit `.cache()` if you are going to do more-than 5 lookups on the trie, but your mileage may vary.
You can access the object from `trie._cache` if you'd like use it directly.

**IE9+**
```html
<script src="https://unpkg.com/efrt@latest/builds/efrt.min.js"></script>
<script>
  var smaller=efrt.pack(['larry','curly','moe'])
  var trie=efrt.unpack(smaller)
  console.log(trie.has('moe'))
</script>
```

if you're doing the second step in the client, you can load just the unpack-half of the library(~3k):
```html
<script src="https://unpkg.com/efrt@latest/builds/efrt-unpack.min.js"></script>
<script>
  var trie=unpack(compressedStuff);
  trie.has('miles davis');
</script>
```
