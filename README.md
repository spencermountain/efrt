<div align="center">
  <img src="https://cloud.githubusercontent.com/assets/399657/23590290/ede73772-01aa-11e7-8915-181ef21027bc.png" />
  <div>compression of key-value data</div>
  <a href="https://npmjs.org/package/efrt">
    <img src="https://img.shields.io/npm/v/efrt.svg?style=flat-square" />
  </a>
  <a href="https://unpkg.com/efrt/builds/efrt.min.js">
     <img src="https://badge-size.herokuapp.com/spencermountain/efrt/master/builds/efrt.min.js" />
  </a>
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-stable-green.svg?style=flat-square" />
  </a>
</div>

<div align="center">
  <code>npm install efrt</code>
</div>

if your data looks like this:

```js
var data = {
  bedfordshire: 'England',
  aberdeenshire: 'Scotland',
  buckinghamshire: 'England',
  argyllshire: 'Scotland',
  bambridgeshire: 'England',
  cheshire: 'England',
  ayrshire: 'Scotland',
  banffshire: 'Scotland'
}
```

you can compress it like this:

```js
import { pack } from 'efrt'
var str = pack(data)
//'England:b0che1;ambridge0edford0uckingham0;shire|Scotland:a0banff1;berdeen0rgyll0yr0;shire'
```

then \_very!\_ quickly flip it back into:

```js
import { unpack } from 'efrt'
var obj = unpack(str)
obj['bedfordshire'] //'England'
```

<h1 align="center">Yep,</h1>

**efrt** packs category-type data into a _[very compressed prefix trie](https://en.wikipedia.org/wiki/Trie)_ format, so that redundancies in the data are shared, and nothing is repeated.

By doing this clever-stuff ahead-of-time, **efrt** lets you ship _much more_ data to the client-side, without hassle or overhead.

The whole library is **8kb**, the unpack half is barely **2kb**.

it is based on:

- 😍 [tamper](https://nytimes.github.io/tamper/) by the [NYTimes](https://github.com/NYTimes/)
- 💝 [lookups](https://github.com/mckoss/lookups) by [Mike Koss](https://github.com/mckoss),
- 💓 [bits.js](http://stevehanov.ca/blog/index.php?id=120) by [Steve Hanov](https://twitter.com/smhanov)

<a href="https://monolithpl.github.io/trie-compiler/">Benchmarks!</a>

<h3 align="center">
  <a href="https://rawgit.com/nlp-compromise/efrt/master/demo/index.html">Demo!</a>
</h3>

<h5 align="left">
Basically,
</h5>

- get a js object into very compact form
- reduce filesize/bandwidth a bunch
- ensure the unpacking time is negligible
- keep word-lookups on critical-path

```js
import { pack, unpack } from 'efrt' // const {pack, unpack} = require('efrt')

var foods = {
  strawberry: 'fruit',
  blueberry: 'fruit',
  blackberry: 'fruit',
  tomato: ['fruit', 'vegetable'],
  cucumber: 'vegetable',
  pepper: 'vegetable'
}
var str = pack(foods)
//'{"fruit":"bl0straw1tomato;ack0ue0;berry","vegetable":"cucumb0pepp0tomato;er"}'

var obj = unpack(str)
console.log(obj.tomato)
//['fruit', 'vegetable']
```

---

<h5 align="left">
or, an Array:
</h5>

if you pass it an array of strings, it just creates an object with `true` values:

```js
const data = [
  'january',
  'february',
  'april',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december'
]
const packd = pack(data)
// true¦a6dec4febr3j1ma0nov4octo5sept4;rch,y;an1u0;ly,ne;uary;em0;ber;pril,ugust
const sameArray = Object.keys(unpack(packd))
// same thing !
```

## Reserved characters

the keys of the object are normalized. Spaces/unicode are good, but numbers, case-sensitivity, and _some punctuation_ (semicolon, comma, exclamation-mark) are not (yet) supported.

```js
specialChars = new RegExp('[0-9A-Z,;!:|¦]')
```

For input validation, use `pack(data, { strict: true })`. It throws a `TypeError`
for empty or unsupported keys, non-string array entries, or distinct keys that
become identical after lowercasing:

```js
pack(['apple1'], { strict: true }) // throws: unsupported key "apple1"
pack({ Apple: 'fruit', apple: 'company' }, { strict: true }) // throws: normalization collision
pack(['Apple', 'Apple'], { strict: true }) // valid: exact duplicates are allowed
```

Strict mode still lowercases keys and uses the category semantics below. Without
this option, unsupported keys are silently dropped and normalization collisions
are merged, preserving the existing behavior. Strict mode validates input keys;
it does not resolve the known trie metadata collision for names such as `_c`.

Category values cannot contain `|` or `¦`; `pack()` throws a `TypeError`
instead of producing an ambiguous packed string. Categories use the existing
string-based format: values are converted to strings, except the category
`"true"` decodes as boolean `true` (also used for arrays of words). Consequently,
`false` decodes as `"false"`, numbers decode as strings, and the string `"true"`
cannot be distinguished from boolean `true`. Category arrays represent membership
in multiple categories, not a general-purpose array serialization format.

Keys are limited to 1,024 UTF-16 code units after lowercasing. Longer keys throw
a `RangeError` to bound recursive trie construction. `unpack()` validates the
packed syntax and references and throws a `SyntaxError` for malformed data;
its traversal is iterative, so deeply nested valid tries do not exhaust the call
stack. Empty strings, `null`, and `undefined` unpack to `{}`; other non-string
inputs throw a `TypeError`.

_efrt_ is built-for, and used heavily in [compromise](https://github.com/nlp-compromise/compromise), to expand the amount of data it can ship onto the client-side.
If you find another use for efrt, please [drop us a line](mailto:spencermountain@gmail.com)🎈

## Performance

_efrt_ is tuned to be very quick to unzip. It is O(1) to lookup. Packing-up the data is the slowest part, which is usually fine:

```js
var compressed = pack(skateboarders) //1k words (on a macbook)
var trie = unpack(compressed)
// unpacking-step: 5.1ms

trie.hasOwnProperty('tony hawk')
// cached-lookup: 0.02ms
```

## Size

`efrt` will pack filesize down as much as possible, depending upon the redundancy of the prefixes/suffixes in the words, and the size of the list.

- list of countries - `1.5k -> 0.8k` _(46% compressed)_
- all adverbs in wordnet - `58k -> 24k` _(58% compressed)_
- all adjectives in wordnet - `265k -> 99k` _(62% compressed)_
- all nouns in wordnet - `1,775k -> 692k` _(61% compressed)_

but there are some things to consider:

- bigger files compress further (see [🎈 birthday problem](https://en.wikipedia.org/wiki/Birthday_problem))
- using efrt will reduce gains from gzip compression, which most webservers quietly use
- english is more suffix-redundant than prefix-redundant, so non-english words may benefit from other styles

Assuming your data has a low _category-to-data ratio_, you will hit-breakeven with at about 250 keys. If your data is in the thousands, you can very be confident about saving your users some considerable bandwidth.

## Use

**Browser script tags**

```html
<script src="https://unpkg.com/efrt@latest/builds/efrt.min.js"></script>
<script>
  var smaller = efrt.pack(['larry', 'curly', 'moe'])
  var trie = efrt.unpack(smaller)
  console.log(trie['moe'])
</script>
```

if you're doing the second step in the client, you can load just the CJS unpack-half of the library(~3k):

```js
const unpack = require('efrt/unpack') // node/cjs
```

```html
<script src="https://unpkg.com/efrt@latest/builds/efrt-unpack.min.js"></script>
<script>
  var trie = efrt(compressedStuff)
  trie.hasOwnProperty('miles davis')
</script>
```

Thanks to [John Resig](https://johnresig.com/) for his fun [trie-compression post](https://johnresig.com/blog/javascript-trie-performance-analysis/) on his blog, and [Wiktor Jakubczyc](https://github.com/monolithpl) for his performance analysis work

## Development checks

Run `npm run verify` after installing development dependencies. It rebuilds the
bundles, runs lint and both test suites, and tests an actual npm tarball installed
offline in a temporary consumer project. The package check covers ESM, CommonJS,
standalone unpack, browser globals, and exported version consistency.

GitHub Actions runs these checks on Node 22, 24, and 26. Test commands preserve
the test process exit status without a shell reporter pipeline.

MIT
