'use strict';
const unpack = require('./unpack');

module.exports = function(str) {
  //turn the weird string into a key-value object again
  let obj = str.split('|').reduce((h, s) => {
    let arr = s.split(':');
    h[arr[0]] = arr[1];
    return h;
  }, {});
  let all = {};
  Object.keys(obj).forEach(function(cat) {
    let arr = unpack(obj[cat]);
    //special case, for botched-boolean
    if (cat === 'true') {
      cat = true;
    }
    for (var i = 0; i < arr.length; i++) {
      let k = arr[i];
      if (all.hasOwnProperty(k) === true) {
        if (Array.isArray(all[k]) === false) {
          all[k] = [all[k], cat];
        } else {
          all[k].push(cat);
        }
      } else {
        all[k] = cat;
      }
    }
  });
  return all;
};
