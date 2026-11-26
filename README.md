<div align="center">
  <div><b>efrt</b></div>
  <div>compression of key-value data</div>
  <div>
    <img width="300" height="8" alt="image" src="https://github.com/user-attachments/assets/a8454327-add3-4486-ad7d-c24be50f9d8d" />
  </div>
  <a href="https://npmjs.org/package/efrt">
    <img src="https://img.shields.io/npm/v/efrt.svg?style=flat-square" />
  </a>
  <a href="https://bundlephobia.com/result?p=efrt">
    <img src="https://badgen.net/bundlejs/min/efrt" />
  </a>
  <div align="center">
    <code>npm install efrt</code>
  </div>
</div>
<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

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

<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

<h1 align="center">Yep,</h1>

**efrt** packs category-type data into a _[compressed prefix trie](https://en.wikipedia.org/wiki/Trie)_ format, sharing repeated prefixes and suffixes within each category.

By doing this work ahead of time, **efrt** can reduce the data you ship to the client-side.

The current minified browser builds are about **12.3 KB** for the whole library
and **3.9 KB** for unpack only, before gzip or Brotli (1 KB = 1,000 bytes).

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

if you pass it an array or Set of strings, it creates an object with `true` values.
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

Sets use the same packing options and validation as arrays, and the input Set
is left unchanged:

```js
const packed = pack(new Set(['Apple', 'pear']), { strict: true })
unpack(packed) // { apple: true, pear: true }
const words = new Set(Object.keys(unpack(packed)))
```

<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

## Usage

```ts
// ESM
import unpack from 'efrt/unpack'
// CommonJS (.cts)
import efrt = require('efrt')
import unpack = require('efrt/unpack')
const result = unpack(efrt.pack(['apple', 'pear']))

// Typescript
import { pack, unpack } from 'efrt'
import type { PackInput, PackOptions, Unpacked } from 'efrt'

const data: PackInput = { apple: ['fruit', 'food'], pear: 'fruit' }
const options: PackOptions = { strict: true, direction: 'auto', dictionary: true }
const packed: string = pack(data, options)
const result: Unpacked = unpack(packed)
```

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
build is about **3.7 KB** before transport compression:

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

TypeScript declarations are included for both `efrt` and `efrt/unpack`, with ESM
and CommonJS support. No separate `@types` package is needed.

<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

## Details

### Packing direction

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

The default is `direction: 'prefix'`, preserving existing output for keys without digits.
Use `direction: 'suffix'` to force suffix-first packing. These options also work
with `strict: true`. Keys are lowercased before reversing, and Unicode code
points stay intact.

Suffix-first categories have a single `:` immediately after `¦`, for example
`true¦:elppa` decodes to `{ apple: true }`. Prefix-first categories have no direction marker;
both directions can appear in the same packed string. The updated unpacker reads
both old and new output, but older unpackers cannot read suffix-marked data.

### Reserved characters

Keys are lowercased. Digits, spaces, underscores, backslashes, and Unicode are
supported; case sensitivity and the punctuation `,;!:|¦` are not supported.
After lowercasing, keys are checked against:

```js
const specialChars = new RegExp('[A-Z,;!:|¦]')
```

see more details in [Docs/Reserved-characters](./docs/reserved-characters.md)

### Fragment dictionaries

Use `pack(data, { dictionary: true, direction: 'auto' })` to learn a small
dictionary of repeated word fragments independently for each category. There
is no built-in language list.

see more details in [Docs/Fragment-dictionaries](./docs/fragment-dictionaries.md)

<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

## Speed

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

---

_efrt_ is built-for, and used heavily in [compromise](https://github.com/nlp-compromise/compromise), to expand the amount of data it can ship onto the client-side.
If you find another use for efrt, please [drop us a line](mailto:spencermountain@gmail.com)🎈

Thanks to [John Resig](https://johnresig.com/) for his fun [trie-compression post](https://johnresig.com/blog/javascript-trie-performance-analysis/) on his blog, and [Wiktor Jakubczyc](https://github.com/monolithpl) for his performance analysis work

MIT
