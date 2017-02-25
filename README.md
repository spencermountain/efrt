# trie-hard
work-in-progress prefix/suffix trie optimised for compression of words

based on [mckoss/lookups](https://github.com/mckoss/lookups) by [Mike Koss](https://github.com/mckoss)

intended to compress a wordlist/dictionary into a compact form, so that filesize/http-bandwidth is low.

the compressed form can still be queried, so unpacking it is unnecessary.
