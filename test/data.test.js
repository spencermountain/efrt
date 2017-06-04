'use strict';
const test = require('tape');
const names = require('./data/maleNames');
const countries = require('./data/countries');
const adjectives = require('./data/adjectives');
const efrt = require('./lib/efrt');

test('match-every-name:', function(t) {
  var str = efrt.pack(names);
  var ptrie = efrt.unpack(str);
  for (var i = 0; i < names.length; i++) {
    var has = ptrie.hasOwnProperty(names[i]);
    t.equal(has, true, "trie has '" + names[i] + "'");
  }
  t.equal(ptrie.hasOwnProperty('woodstock'), false, 'no-false-positive');
  t.end();
});

test('match-every-country:', function(t) {
  var str = efrt.pack(countries);
  var ptrie = efrt.unpack(str);
  for (var i = 0; i < countries.length; i++) {
    var has = ptrie.hasOwnProperty(countries[i]);
    t.equal(has, true, "trie has '" + countries[i] + "'");
  }
  t.equal(ptrie.hasOwnProperty('woodstock'), false, 'no-false-positive');
  t.end();
});

// test('match-every-adjective:', function(t) {
//   var str = efrt.pack(adjectives);
//   var ptrie = efrt.unpack(str);
//   for (var i = 0; i < adjectives.length; i++) {
//     var has = ptrie.has(adjectives[i]);
//     if (!has) {
//       //if not there, make sure it wasn't supposed to be there in the first place
//       t.ok(adjectives[i].match(/[0-9A-Z,;!]/), adjectives[i]);
//     }
//   }
//   t.equal(ptrie.has('woodstock'), false, 'no-false-positive');
//   t.end();
// });

test('test prefixes:', function(t) {
  var compressed = efrt.pack(countries);
  var ptrie = efrt.unpack(compressed);

  for (var i = 0; i < countries.length; i++) {
    let str = countries[i];
    for (let o = 1; o < str.length - 1; o++) {
      let partial = str.slice(0, o);
      var has = ptrie.hasOwnProperty(partial);
      t.equal(has, false, 'no-prefix-' + partial);
    }
  }
  t.end();
});
