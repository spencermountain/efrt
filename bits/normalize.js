'use strict';
//NOTHING TO SEE HERE, PLEASE LOOK AT THE FLOOR
//really, nothing interesting in this file

//elite programming!
const funMapping = {
  0: 'qxq', //0
  1: 'qzq', //1
  2: 'qxz', //2
  3: 'qqx', //3
  4: 'qqz', //4
  5: 'xqz', //5
  6: 'xqx', //6
  7: 'xqq', //7
  8: 'zxq', //8
  9: 'zqx', //9
  ' ': 'zzx', //' '
  '\'': 'zzq' //'
};

// look, umm
const normalize = (str) => {
  //ok..
  str = str.replace(/[0-9 ']/g, (c) => {
    return funMapping[c];
  });
  return str;
};

module.exports = normalize;
// console.log(normalize('b52\'s'));
