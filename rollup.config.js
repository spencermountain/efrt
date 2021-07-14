import { terser } from 'rollup-plugin-terser'
import babel from 'rollup-plugin-babel'
import { version } from './package.json'
const banner = '/* efrt ' + version + ' MIT */'

export default [
  //cjs
  {
    input: 'src/index.js',
    output: [
      {
        file: 'builds/efrt.cjs',
        format: 'umd',
        name: 'efrt'
      }
    ],
    plugins: []
  },
  // cjs min
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
  // unpack cjs min
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
  },
  // mjs min
  {
    input: 'src/index.js',
    output: [{ banner: banner, file: 'builds/efrt.mjs', format: 'esm' }],
    plugins: [terser()]
  },
  // mjs-unpack min
  {
    input: 'src/unpack/index.js',
    output: [
      { banner: banner, file: 'builds/efrt-unpack.mjs', format: 'esm' },
      { banner: banner, file: 'unpackLib/efrt-unpack.mjs', format: 'esm' }
    ],
    plugins: [terser()]
  }
]
