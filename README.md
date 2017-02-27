# trie-hard
work-in-progress prefix/suffix [trie-based](https://en.wikipedia.org/wiki/Trie) data-structure optimised for compression of english words

based on [bits.js](http://stevehanov.ca/blog/index.php?id=120) by [Steve Hanov](https://twitter.com/smhanov) and [mckoss/lookups](https://github.com/mckoss/lookups) by [Mike Koss](https://github.com/mckoss)

it can compress a wordlist/dictionary into a very compact form, so that filesize/http/bandwidth is low.

the clients though, can build-up from the compressed form without being too-fancy.

```js
var trieHard=require('trie-hard')//(not yet published)
var words = [
  'calvin coolridge', //must boring, lowercase, non-unicode
  'cool',
  'cool hat',
];
//pack these words as tightly as possible
var compressed = trieHard.pack(arr);
//(some insanely-small string of letters+numbers)

//pull it apart into a lookup-trie
var trie = trieHard.unpack(compressed);

//hit it!
console.log(trie.has('cool'));//true
console.log(trie.has('miles davis'));//false
```

if you're doing the second step in the browser, you can just load the unpack bit (~6k):
```html
<script src="./builds/trie-hard-unpack.min.js"></script>
<script>
  $.get('./compressedStuff.txt',(str)=>{
    var trie=unpack(str)
    console.log(trie.has('miles davis'));//false
  })
</script>
```

the words you input need to be heavily normalized before-hand. Unicode will make it die.
