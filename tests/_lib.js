import * as build from '../builds/efrt.js'
import * as src from '../src/index.js'

let lib = src
if (process.env.TESTENV === 'prod') {
  console.log('== production build test 🚀 ==')
  lib = build
}
export default lib
