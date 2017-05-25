var unpack = require('../builds/efrt-unpack.js');
var test = require('tape');

test('unpack works:', function(t) {
  var str = 'denmark,o0scandanavia;h0ntar0;io';
  var p = unpack(str);
  t.equal(p.has('ohio'), true, 'has ohio');
  t.equal(p.has('ontario'), true, 'has ontario');
  t.equal(p.has('ontfario'), false, 'no ontfario');
  t.end();
});
