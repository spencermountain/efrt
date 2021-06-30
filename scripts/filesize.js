import fs from 'fs'
import path from 'path'
console.log('\n\n----\n')
const buildsDir = path.join(__dirname, '../builds')
const doFile = function (file) {
  const abs = path.join(buildsDir, file)
  const stats = fs.statSync(abs)
  const size = (stats['size'] / 1000.0).toFixed(1)
  console.log('    ' + file + '  : ' + size + ' kb')
  console.log('\n')
}
doFile('./efrt.min.js')
doFile('./efrt-unpack.min.js')
