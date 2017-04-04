'use strict';
const Ptrie = require('./ptrie');

module.exports = (str) => {
  return new Ptrie(str);
};
