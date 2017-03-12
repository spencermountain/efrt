'use strict';
const test = require('tape');
const names = require('./data/maleNames');
const countries = require('./data/countries');
const trieHard = require('../src/index');

test('cached-match-every-name:', function(t) {
  var str = trieHard.pack(names);
  var ptrie = trieHard.unpack(str);
  ptrie.cache();
  for (var i = 0; i < names.length; i++) {
    var has = ptrie.has(names[i]);
    t.equal(has, true, 'trie has \'' + names[i] + '\'');
  }
  t.equal(ptrie.has('woodstock'), false, 'no-false-positive');

  var len = ptrie.toArray().length;
  t.equal(len, names.length, 'array');

  t.end();
});

test('cached-match-every-country:', function(t) {
  var str = trieHard.pack(countries);
  var ptrie = trieHard.unpack(str);
  ptrie.cache();
  for (var i = 0; i < countries.length; i++) {
    var has = ptrie.has(countries[i]);
    t.equal(has, true, 'trie has \'' + countries[i] + '\'');
  }
  t.equal(ptrie.has('woodstock'), false, 'no-false-positive');

  var len = ptrie.toArray().length;
  t.equal(len, countries.length, 'all-words-in-array');

  t.end();
});

test('cached-no-prefixes:', function(t) {
  var compressed = trieHard.pack(countries);
  var ptrie = trieHard.unpack(compressed);
  ptrie.cache();
  for (var i = 0; i < countries.length; i++) {
    let str = countries[i];
    for(let o = 1; o < str.length - 1; o++) {
      var partial = str.slice(0, o);
      var has = ptrie.has(partial);
      t.equal(has, false, 'no-prefix-' + partial);
    }
  }
  t.end();
});
