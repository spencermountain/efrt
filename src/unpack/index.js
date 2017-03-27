'use strict';
const Ptrie = require('./ptrie');

const unpack = (str) => {
  return new Ptrie(str);
};
module.exports = unpack;
