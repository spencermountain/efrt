'use strict';
const unpack = require('./unpack');

module.exports = function(obj) {
  if (typeof obj === 'string') {
    obj = JSON.parse(obj); //weee!
  }
  let all = {};
  Object.keys(obj).forEach(function(cat) {
    let arr = unpack(obj[cat]);
    for (var i = 0; i < arr.length; i++) {
      all[arr[i]] = cat;
    }
  });
  return all;
};
