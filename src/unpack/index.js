'use strict';
const Ptrie = require('./ptrie');
// const Ptrie = require('./ptrie_old');

const unpack = (str) => {
  return new Ptrie(str);
};
module.exports = unpack;
