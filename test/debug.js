'use strict';
//
const debug = (str) => {
  str = str.split(';').join('\n');
  console.log('\n---------------');
  console.log(str);
  console.log('---------------\n');
  return str;
};
module.exports = debug;
