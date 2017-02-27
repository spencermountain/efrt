# trie-hard
work-in-progress prefix/suffix [trie data-structure](https://en.wikipedia.org/wiki/Trie) optimised for compression of english words

based on [bits.js](http://stevehanov.ca/blog/index.php?id=120) by [Steve Hanov](https://twitter.com/smhanov) and [mckoss/lookups](https://github.com/mckoss/lookups) by [Mike Koss](https://github.com/mckoss)

intended to compress a wordlist/dictionary into a very compact form, so that filesize/http-bandwidth is low.

the client though, can easily pull-apart the compressed form and query it without any too-fancy unpacking.

```js
var words = [
  'calvin coolridge', //must boring, lowercase, non-unicode
  'cool',
  'cool hat',
];
//pack these words as tightly as possible
var compressed = trieHard.pack(arr);

//pull it out to query it
var trie = trieHard.unpack(compressed);

//hit it
console.log(trie.has('cool'));//true
console.log(trie.has('miles davis'));//false
```

if you're doing the second step in the browser, you can just load that part of it:
```html
<script src="./builds/trie-hard-unpack.min.js"></script>
<script>
  $.ajax('./myCompressedThing.js',(str)=>{
    var trie=unpack(str)
    console.log(trie.has('miles davis'));//false
  })
</script>
```
