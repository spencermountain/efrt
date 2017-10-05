require('shelljs/global');
var fs = require('fs');
var path = require('path');

//final build locations
var paths = {
  es5: './builds/efrt.js',
  es5min: './builds/efrt.min.js',
  unpack: './builds/efrt-unpack.js',
  unpack5: './builds/efrt-unpack.es5.js',
  unpackmin: './builds/efrt-unpack.min.js',
  unpackes6: './builds/efrt-unpack.es6.js',
};

//cleanup. remove old builds
exec('rm -rf ../builds && mkdir builds');

var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
var banner = '/* efrt trie-compression v' + pkg.version + '  github.com/nlp-compromise/efrt  - MIT */';

//add a header, before our sourcecode
exec('echo "' + banner + '" > ' + paths.es5);
exec('echo "' + banner + '" > ' + paths.es5min);
exec('echo "' + banner + '" > ' + paths.unpack);
exec('echo "' + banner + '" > ' + paths.unpackmin);

require('./both');
require('./unpack');

// exec('rm ' + path.unpack);

var fileSize = function(src) {
  var stats = fs.statSync(path.resolve(src, '../../'));
  return (stats['size'] / 1000.0).toFixed(2) + 'kb';
};

//print filesizes
console.log('\n');
console.log('    es5 ' + fileSize(paths.es5));
console.log(' -  min ' + fileSize(paths.es5min));
console.log(' -  unpack ' + fileSize(paths.unpack));
console.log(' -  unpackes6 ' + fileSize(paths.unpackmin));
console.log(' -  unpackmin ' + fileSize(paths.unpackmin));
console.log('\n');
