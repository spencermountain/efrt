'use strict';
var test = require('tape');
const efrt = require('./lib/efrt');

test('Ptrie has everything:', function(t) {
  var arr = ['cool', 'coolish', 'cool hat', 'cooledomingo'];
  var str = efrt.pack(arr);
  t.equal(typeof str, 'string', 'packed-string');

  var ptrie = efrt.unpack(str);
  for (var i = 0; i < arr.length; i++) {
    var has = ptrie.hasOwnProperty(arr[i]);
    t.equal(has, true, "trie has '" + arr[i] + "'");
  }
  t.equal(ptrie.hasOwnProperty('farmington'), false, 'no-false-positive');
  t.end();
});
