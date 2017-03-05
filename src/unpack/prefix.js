'use strict';

//are we on the right path with this string?
const isPrefix = function(str, want) {
  //allow perfect equals
  if (str === want) {
    return true;
  }
  //compare lengths
  let len = str.length;
  if (len >= want.length) {
    return false;
  }
  //quick slice
  if (len === 1) {
    return str === want[0];
  }
  return want.slice(0, len) === str;
};
module.exports = isPrefix;
// console.log(isPrefix('harvar', 'harvard'));
