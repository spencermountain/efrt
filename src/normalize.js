'use strict';

//programming!
const numbers = [
  'qxq', //0
  'qzq', //1
  'qxz', //2
  'qqx', //3
  'qqz', //4
  'xqz', //5
  'xqx', //6
  'xqq', //7
  'zxq', //8
  'zqx', //9
];

// oh soo dirty.
const normalize = (str) => {
  str = str.replace(/ /g, 'zzz');
  str = str.replace(/[0-9]/g, (c) => {
    return numbers[c];
  });
  return str;
};

module.exports = normalize;
// console.log(normalize('b52'));
