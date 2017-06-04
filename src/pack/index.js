'use strict';
const Trie = require('./trie');

const handleFormats = function(input) {
  //null
  if (input === null || input === undefined) {
    return {};
  }
  //string
  if (typeof input === 'string') {
    return input.split(/ +/g).reduce(function(h, str) {
      h[str] = true;
      return h;
    }, {});
  }
  //array
  if (Object.prototype.toString.call(input) === '[object Array]') {
    return input.reduce(function(h, str) {
      h[str] = true;
      return h;
    }, {});
  }
  //object
  return input;
};

//turn an array into a compressed string
const pack = function(obj) {
  obj = handleFormats(obj);
  //pivot into categories:
  let flat = Object.keys(obj).reduce(function(h, k) {
    let val = obj[k];
    h[val] = h[val] || [];
    h[val].push(k);
    return h;
  }, {});
  Object.keys(flat).forEach(function(k) {
    let t = new Trie(flat[k]);
    flat[k] = t.pack();
  });
  flat = JSON.stringify(flat, null, 0);
  return flat;
};
module.exports = pack;
