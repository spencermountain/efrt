'use strict';
const config = require('./config');

// 0, 1, 2, ..., A, B, C, ..., 00, 01, ... AA, AB, AC, ..., AAA, AAB, ...
const toAlphaCode = function(n) {
  var places,
    range,
    s = '',
    d;

  for (places = 1, range = config.BASE;
    n >= range;
    n -= range, places++, range *= config.BASE) {
  }

  while (places--) {
    d = n % config.BASE;
    s = String.fromCharCode((d < 10 ? 48 : 55) + d) + s;
    n = (n - d) / config.BASE;
  }
  return s;
};


const fromAlphaCode = function(s) {
  var n = 0,
    places,
    range,
    pow,
    i,
    d;

  for (places = 1, range = config.BASE;
    places < s.length;
    n += range, places++, range *= config.BASE) {
  }

  for (i = s.length - 1, pow = 1; i >= 0; i--, pow *= config.BASE) {
    d = s.charCodeAt(i) - 48;
    if (d > 10) {
      d -= 7;
    }
    n += d * pow;
  }
  return n;
};

/* Sort elements and remove duplicates from array (modified in place) */
const unique = function(a) {
  a.sort();
  for (let i = 1; i < a.length; i++) {
    if (a[i - 1] === a[i]) {
      a.splice(i, 1);
    }
  }
};

const commonPrefix = function(w1, w2) {
  var len = Math.min(w1.length, w2.length);
  while (len > 0) {
    var prefix = w1.slice(0, len);
    if (prefix === w2.slice(0, len)) {
      return prefix;
    }
    len -= 1;
  }
  return '';
};


module.exports = {
  toAlphaCode: toAlphaCode,
  fromAlphaCode: fromAlphaCode,
  unique: unique,
  commonPrefix: commonPrefix
}
