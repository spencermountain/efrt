'use strict'
const test = require('tape')
const names = require('./data/maleNames')
const countries = require('./data/countries')
const efrt = require('./lib/efrt')

test('cached-match-every-name:', function(t) {
  const str = efrt.pack(names)
  const ptrie = efrt.unpack(str)
  for (let i = 0; i < names.length; i++) {
    const has = ptrie.hasOwnProperty(names[i])
    t.equal(has, true, "trie has '" + names[i] + "'")
  }
  t.equal(ptrie.hasOwnProperty('woodstock'), false, 'no-false-positive')

  const len = Object.keys(ptrie).length
  t.equal(len, names.length, 'array')

  t.end()
})

test('cached-match-every-country:', function(t) {
  const str = efrt.pack(countries)
  const ptrie = efrt.unpack(str)
  for (let i = 0; i < countries.length; i++) {
    const has = ptrie.hasOwnProperty(countries[i])
    t.equal(has, true, "trie has '" + countries[i] + "'")
  }
  t.equal(ptrie.hasOwnProperty('woodstock'), false, 'no-false-positive')

  const len = Object.keys(ptrie).length
  t.equal(len, countries.length, 'all-words-in-array')

  t.end()
})

test('cached-no-prefixes:', function(t) {
  const compressed = efrt.pack(countries)
  const ptrie = efrt.unpack(compressed)
  for (let i = 0; i < countries.length; i++) {
    const str = countries[i]
    for (let o = 1; o < str.length - 1; o++) {
      const partial = str.slice(0, o)
      const has = ptrie.hasOwnProperty(partial)
      t.equal(has, false, 'no-prefix-' + partial)
    }
  }
  t.end()
})
