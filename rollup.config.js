import { terser } from 'rollup-plugin-terser'
import { version } from './package.json'
const banner = '/* efrt ' + version + ' MIT */'

export default [
  //cjs
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
      terser()
    ]
  },
  // mjs min
  {
    input: 'src/index.js',
    output: [{ banner: banner, file: 'builds/efrt.mjs', format: 'esm' }],
    plugins: [terser()]
  },
  // unpack cjs min
  {
    input: 'src/unpack/index.js',
    output: [
      {
        file: 'builds/efrt-unpack.min.js',
        format: 'umd',
        name: 'efrt'
      }
    ],
    plugins: [
      terser()
    ]
  },

  // unpack mjs min
  {
    input: 'src/unpack/index.js',
    output: [{ banner: banner, file: 'builds/efrt-unpack.mjs', format: 'esm' }],
    plugins: [terser()]
  }
]
