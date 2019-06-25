require('shelljs/global')
const fs = require('fs')
const pkg = require('../../package.json')
const terser = require('terser')

const lib = {
  browserify: '"node_modules/.bin/browserify"',
  derequire: '"node_modules/.bin/derequire"',
  uglify: '"node_modules/.bin/uglifyjs"'
}

//final build locations
const path = {
  es5: './builds/efrt.js',
  es5min: './builds/efrt.min.js'
}

//es5 -main (browserify + derequire)
cmd = lib.browserify + ' "./src/index.js" --standalone efrt'
cmd += ' -t [ babelify --presets [ @babel/preset-env ] ]'
cmd += ' | ' + lib.derequire
cmd += ' >> ' + path.es5
exec(cmd)

const banner = '/* efrt v' + pkg.version + '\n   github.com/nlp-compromise/efrt\n   MIT\n*/\n'

//es5.min (uglify)
// cmd = lib.uglify + ' ' + path.es5 + ' --mangle --compress '
// cmd += ' >> ' + path.es5min
// exec(cmd)

const code = fs.readFileSync(path.es5).toString()

const result = terser.minify(code, {
  output: {
    beautify: false,
    preamble: banner
  },
  compress: {
    passes: 2
  }
})
fs.writeFileSync(path.es5min, result.code)

console.log('done!')
