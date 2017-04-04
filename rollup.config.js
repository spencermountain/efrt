'use strict';
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const pkg = require('./package.json');

module.exports = {
  entry: './src/unpack/index.js',
  dest: './builds/efrt-unpack.es6.js',
  moduleName: 'unpack',
  format: 'cjs',
  banner: '/* nlp-compromise/efrt v' + pkg.version + ' \n usage: unpack(myPackedString).has(word)\n by @spencermountain MIT\n*/',
  plugins: [
    resolve({
      jsnext: true,
      main: true
    }),
    commonjs()
  ]
};
