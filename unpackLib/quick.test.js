var unpack = require('./efrt-unpack.min.js');
var test = require('tape');

test('unpack works:', function(t) {
  var str = 'true¦denmark,o0scandanavia;h0ntar0;io';
  var p = unpack(str);
  t.equal(p.hasOwnProperty('ohio'), true, 'has ohio');
  t.equal(p.hasOwnProperty('ontario'), true, 'has ontario');
  t.equal(p.hasOwnProperty('ontfario'), false, 'no ontfario');
  t.end();
});
