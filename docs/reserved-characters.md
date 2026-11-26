## Reserved characters

Keys are lowercased. Digits, spaces, underscores, backslashes, and Unicode are
supported; case sensitivity and the punctuation `,;!:|¦` are not supported.
After lowercasing, keys are checked against:

```js
const specialChars = new RegExp('[A-Z,;!:|¦]')
```

Categories containing supported digit keys use the version marker `!2;`
immediately after `¦`, before any direction or dictionary header. In this format,
literal digits `0` through `9` are written as `\a` through `\j`, and a literal
backslash is written as `\\`. These are characters in the packed text, not
JavaScript string-literal escapes. Node references still use ordinary digits.

```js
pack(['101domain.com']) // String.raw`true¦!2;\b\a\bdomain.com`
unpack(String.raw`true¦!2;\b\a\bdomain.com`) // { '101domain.com': true }
```

Categories without digits keep their existing encoding, including literal
backslashes. Both formats can coexist in one packed string. Updated unpackers
read both; older unpackers cannot read `!2;` categories. Versioned dictionary
definitions use the same escapes, and expanded fragments are not unescaped again.
Unknown or incomplete escapes in versioned labels or definitions throw a
`SyntaxError`. Digits work with strict mode and all packing options; other
reserved punctuation remains unsupported.

For input validation, use `pack(data, { strict: true })`. It throws a `TypeError`
for empty or unsupported keys, non-string array or Set entries, or distinct keys that
become identical after lowercasing:

```js
pack(['apple!'], { strict: true }) // throws: unsupported key "apple!"
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
`"true"` decodes as boolean `true` (also used for arrays and Sets of words). Consequently,
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
