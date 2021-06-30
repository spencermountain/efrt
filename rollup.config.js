import { terser } from 'rollup-plugin-terser'
import babel from 'rollup-plugin-babel'

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: 'builds/efrt.js',
        format: 'umd',
        name: 'efrt'
      }
    ],
    plugins: []
  },
  {
    input: 'src/index.js',
    output: [
      {
        file: 'builds/efrt.min.js',
        format: 'umd',
        name: 'efrt'
      }
    ],
    plugins: [
      babel({
        babelrc: false,
        presets: ['@babel/preset-env']
      }),
      terser()
    ]
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
    plugins: [
      babel({
        babelrc: false,
        presets: ['@babel/preset-env']
      }),
      terser()
    ]
  }
]
