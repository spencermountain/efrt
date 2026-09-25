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
//'England¦b0che1;ambridge0edford0uckingham0;shire|Scotland¦a0banff1;berdeen0rgyll0yr0;shire'
```

then \_very!\_ quickly flip it back into:

```js
import { unpack } from 'efrt'
var obj = unpack(str)
obj['bedfordshire'] //'England'
```

<h1 align="center">Yep,</h1>

**efrt** packs category-type data into a _[compressed prefix trie](https://en.wikipedia.org/wiki/Trie)_ format, sharing repeated prefixes and suffixes within each category.

By doing this work ahead of time, **efrt** can reduce the data you ship to the client-side.

The current minified browser builds are about **11.6 KB** for the whole library
and **3.5 KB** for unpack only, before gzip or Brotli (1 KB = 1,000 bytes).

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
- unpack once into an object for repeated lookups
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
//'fruit¦bl0straw1tomato;ack0ue0;berry|vegetable¦cucumb0pepp0tomato;er'

var obj = unpack(str)
console.log(obj.tomato)
//['fruit', 'vegetable']
```

---

<h5 align="left">
or, an Array:
</h5>

if you pass it an array of strings, it creates an object with `true` values.
Unpacking preserves the unique supported words after lowercasing, not the
original array order, capitalization, or duplicates:

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
// true¦a5dec3febr2j0nov3octo4sept3;an1u0;ly,ne;uary;em0;ber;pril,ugust
const words = Object.keys(unpack(packd))
// the same unique month names; original order is not preserved
```

## Packing direction

`pack(data, { direction: 'auto' })` tries prefix-first and suffix-first packing
for each category and chooses the smaller UTF-8 text output, including the
direction marker. Ties keep prefix-first packing. This takes more packing work;
it does not optimize for gzip or Brotli.

```js
const packed = pack(['singing', 'ringing', 'bringing', 'swinging'], {
  direction: 'auto'
})
const words = unpack(packed) // direction is detected automatically
```

The default is `direction: 'prefix'`, preserving the existing output format.
Use `direction: 'suffix'` to force suffix-first packing. These options also work
with `strict: true`. Keys are lowercased before reversing, and Unicode code
points stay intact.

Suffix-first categories have a single `:` immediately after `¦`, for example
`true¦:elppa` decodes to `{ apple: true }`. Prefix-first categories have no marker;
both directions can appear in the same packed string. The updated unpacker reads
both old and new output, but older unpackers cannot read suffix-marked data.

## Fragment dictionaries

Use `pack(data, { dictionary: true, direction: 'auto' })` to learn a small
dictionary of repeated word fragments independently for each category. There
is no built-in language list. Candidates come from Unicode code-point sequences
in the trie's word labels, after prefix/suffix sharing. They never include node
separators or references. Tokens are emitted in edge labels and resolved when
those labels are decoded; this is not compression of the serialized trie syntax.

The option defaults to `false`. When enabled, the packer counts the UTF-8 bytes
of the definitions, header, and encoded trie, and uses the dictionary only if
the complete representation is smaller. With `direction: 'auto'`, both directions
are compared including their dictionaries. Packing takes additional time and
memory; dictionaries are stored in the output rather than bundled with unpack.

No new characters are reserved in input keys. Each dictionary chooses one-byte
punctuation tokens absent from that category's original word labels. Literal
punctuation stays supported; if no suitable tokens are available, packing falls
back to the existing format. The existing reserved characters still apply.

Dictionary output has a versioned header before the trie:

```text
category¦!1:TOKENS:FRAGMENT,FRAGMENT;TRIE
category¦:!1:TOKENS:FRAGMENT,FRAGMENT;TRIE   (suffix-first)
```

Tokens correspond to fragments in order. For example,
`true¦!1:#:ありがとう;a#,b#` decodes to the words `aありがとう` and `bありがとう`.
Definitions are literal strings, not recursive token expressions. A header
applies only to its category; marked and unmarked categories can be mixed.
Older unpackers cannot read dictionary-marked output. The updated unpacker
continues to accept the original format and suffix-first output.

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
are merged, preserving the existing behavior. Underscores are supported, including
names such as `_c`, `_d`, `_v`, `_g`, and `_n`: trie metadata is stored separately
from word fragments.

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
inputs throw a `TypeError`. Duplicate words within a packed category produce
only one membership in that category. Trie edges preserve complete Unicode
code points, so valid Unicode keys, including emoji, survive UTF-8 transport.

_efrt_ is built-for, and used heavily in [compromise](https://github.com/nlp-compromise/compromise), to expand the amount of data it can ship onto the client-side.
If you find another use for efrt, please [drop us a line](mailto:spencermountain@gmail.com)🎈

## Performance

_efrt_ is designed to pack data ahead of time and unpack it once into a plain
JavaScript object. Subsequent lookups use normal object property access.
Packing and unpacking time depend on the data, options, runtime, and device;
measure them on your own workload:

```js
var compressed = pack(skateboarders) // your dataset
console.time('unpack')
var trie = unpack(compressed)
console.timeEnd('unpack')

Object.prototype.hasOwnProperty.call(trie, 'tony hawk')
```

## Size

`efrt` can reduce data size depending on repeated prefixes, suffixes, fragments,
and the number of categories. Small or less repetitive inputs may grow.

For the repository's current test fixtures, comparing `JSON.stringify(array)`
with default `pack(array)` output in UTF-8 bytes, before gzip or Brotli and
excluding the decoder:

- 110 country names — `1,182 -> 865 bytes` _(26.8% smaller)_
- 785 male names — `6,860 -> 3,486 bytes` _(49.2% smaller)_

but there are some things to consider:

- more repeated word fragments give the packer more opportunities to share data
- compare JSON and packed data after the same gzip or Brotli compression used for delivery
- `direction: 'auto'` and `dictionary: true` can help some datasets, but choose by raw UTF-8 size rather than gzip or Brotli size

There is no fixed break-even key count. Include the decoder's download size
when comparing total transfer sizes, and measure unpacking time and memory on
your target devices.

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

If you only need to unpack, load the standalone decoder. The minified CommonJS
build is about **3.3 KB** before transport compression:

```js
const unpack = require('efrt/unpack') // node/cjs
```

```html
<script src="https://unpkg.com/efrt@latest/builds/efrt-unpack.min.js"></script>
<script>
  var trie = efrt(compressedStuff)
  Object.prototype.hasOwnProperty.call(trie, 'miles davis')
</script>
```

Thanks to [John Resig](https://johnresig.com/) for his fun [trie-compression post](https://johnresig.com/blog/javascript-trie-performance-analysis/) on his blog, and [Wiktor Jakubczyc](https://github.com/monolithpl) for his performance analysis work

## Development checks

Run `npm run verify` after installing development dependencies. It rebuilds the
bundles, runs lint and both test suites, and tests an actual npm tarball installed
offline in a temporary consumer project. The package check covers ESM, CommonJS,
standalone unpack, browser globals, and exported version consistency.

GitHub Actions runs these checks on Node 22, 24, and 26. Test commands use the
local `tap-dancer` reporter while preserving both test and reporter failures.
Use `npm test -- --raw` or `npm run testb -- --raw` for unformatted TAP output.

MIT
