'use strict';
const config = require('./config');

const seq = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const cache = seq.split('').reduce((h, c, i) => {
  h[c] = i;
  return h;
}, {});
// console.log(cache);

// 0, 1, 2, ..., A, B, C, ..., 00, 01, ... AA, AB, AC, ..., AAA, AAB, ...
const toAlphaCode = function(n) {
  if (seq[n] !== undefined) {
    return seq[n];
  }
  let places = 1;
  let range = config.BASE;
  let s = '';

  for (; n >= range; n -= range, places++, range *= config.BASE) {
  }
  while (places--) {
    let d = n % config.BASE;
    s = String.fromCharCode((d < 10 ? 48 : 55) + d) + s;
    n = (n - d) / config.BASE;
  }
  return s;
};


const fromAlphaCode = function(s) {
  if (cache[s] !== undefined) {
    return cache[s];
  }
  let n = 0;
  let places = 1;
  let range = config.BASE;
  let pow = 1;

  for (; places < s.length; n += range, places++, range *= config.BASE) {
  }
  for (let i = s.length - 1; i >= 0; i--, pow *= config.BASE) {
    let d = s.charCodeAt(i) - 48;
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
};

// let out = fromAlphaCode('A');
// console.log(out);
// console.log(fromAlphaCode(out));
// console.log(fromAlphaCode('R'));
