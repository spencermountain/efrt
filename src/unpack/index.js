'use strict';
const Ptrie = require('./ptrie');

module.exports = function(str) {
  return new Ptrie(str);
};
