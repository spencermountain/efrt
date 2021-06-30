import sh from 'shelljs'
import path from 'path'
const eslint = 'node_modules/.bin/eslint'
//run linter
console.log('linting..')
const cmd = eslint + ' -c .eslintrc --color ' + path.join(__dirname, '../src/**/*.js')

sh.exec(cmd, {
  async: true
})
