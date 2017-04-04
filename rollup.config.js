'use strict';
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

module.exports = {
  entry: './src/unpack/index.js',
  dest: './builds/efrt-unpack.es6.js',
  moduleName: 'unpack',
  format: 'cjs',
  plugins: [
    resolve({
      jsnext: true,
      main: true
    }),
    commonjs()
  ]
};
