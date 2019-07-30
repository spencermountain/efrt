import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import { terser } from 'rollup-plugin-terser'
import resolve from 'rollup-plugin-node-resolve'

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: 'builds/efrt.mjs',
        format: 'esm'
      }
    ],
    plugins: [resolve(), json(), commonjs()]
  },
  {
    input: 'src/index.js',
    output: [
      {
        file: 'builds/efrt.js',
        format: 'umd',
        name: 'efrt'
      }
    ],
    plugins: [resolve(), json(), commonjs()]
  },
  {
    input: 'src/index.js',
    output: [
      {
        file: 'builds/efrt.min.js',
        format: 'umd',
        sourcemap: true,
        name: 'efrt'
      }
    ],
    plugins: [resolve(), json(), commonjs(), terser()]
  },
  {
    input: 'src/unpack/index.js',
    output: [
      {
        file: 'builds/efrt-unpack.min.js',
        format: 'umd',
        name: 'efrt'
      },
      {
        file: 'unpackLib/efrt-unpack.min.js',
        format: 'umd',
        name: 'efrt'
      }
    ],
    plugins: [resolve(), json(), commonjs(), terser()]
  }
]
