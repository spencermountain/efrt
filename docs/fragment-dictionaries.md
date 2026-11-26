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
category¦!2;:!1:TOKENS:FRAGMENT,FRAGMENT;TRIE   (digit encoding, suffix-first)
```

Tokens correspond to fragments in order. For example,
`true¦!1:#:ありがとう;a#,b#` decodes to the words `aありがとう` and `bありがとう`.
Definitions are literal strings, not recursive token expressions. A header
applies only to its category; marked and unmarked categories can be mixed.
Older unpackers cannot read dictionary-marked output. The updated unpacker
continues to accept the original format and suffix-first output.
