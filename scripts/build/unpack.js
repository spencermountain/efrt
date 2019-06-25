require('shelljs/global')
const fs = require('fs')
const pkg = require('../../package.json')
const terser = require('terser')
//--do just half of the library now
const lib = {
  browserify: '"node_modules/.bin/browserify"',
  derequire: '"node_modules/.bin/derequire"',
  uglify: '"node_modules/.bin/uglifyjs"'
  // babili: '"node_modules/.bin/babili"'
}
//final build locations
const path = {
  unpack6: './builds/efrt-unpack.js',
  unpack5: './builds/efrt-unpack.es5.js',
  unpackmin: './builds/efrt-unpack.min.js'
}

// //es6 (browserify + derequire)
cmd = lib.browserify + ' "./src/unpack/index.js" --standalone unpack'
cmd += ' | ' + lib.derequire
cmd += ' >> ' + path.unpack6
exec(cmd)

//es5 (browserify + derequire)
cmd = lib.browserify + ' "./src/unpack/index.js" --standalone unpack'
cmd += ' -t [ babelify --presets [ @babel/preset-env ] ]'
cmd += ' | ' + lib.derequire
cmd += ' >> ' + path.unpack5
exec(cmd)

const banner =
  '/* efrt-unpack v' + pkg.version + '\n   github.com/nlp-compromise/efrt\n   MIT\n*/\n'

//unpacker min (uglify)
// cmd = lib.uglify + ' ' + path.unpack5 + ' --mangle --compress '
// cmd += ' >> ' + path.unpackmin
// exec(cmd)

const code = fs.readFileSync(path.unpack5).toString()

const result = terser.minify(code, {
  output: {
    beautify: false,
    preamble: banner
  },
  compress: {
    passes: 2
  }
})
fs.writeFileSync(path.unpackmin, result.code)

// exec('rollup -c');

exec('mv ./builds/efrt-unpack.min.js ./unpackLib/efrt-unpack.min.js')
