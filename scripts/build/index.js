require('shelljs/global');
var fs = require('fs');

//final build locations
var path = {
  es5: './builds/efrt.js',
  es5min: './builds/efrt.min.js',
  unpack: './builds/efrt-unpack.js',
  unpack5: './builds/efrt-unpack.es5.js',
  unpackmin: './builds/efrt-unpack.min.js'
};

//cleanup. remove old builds
exec('rm -rf ./builds && mkdir builds');

var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
var banner = '/* efrt trie-compression v' + pkg.version + '  github.com/nlp-compromise/efrt  - MIT */';

//add a header, before our sourcecode
exec('echo "' + banner + '" > ' + path.es5);
exec('echo "' + banner + '" > ' + path.es5min);
exec('echo "' + banner + '" > ' + path.unpack);
exec('echo "' + banner + '" > ' + path.unpackmin);

require('./both');
require('./unpack');

// exec('rm ' + path.unpack);

var fileSize = function(src) {
  var stats = fs.statSync(src);
  return (stats['size'] / 1000.0).toFixed(2) + 'kb';
};

//print filesizes
console.log('\n');
console.log('    es5 ' + fileSize(path.es5));
console.log(' -  min ' + fileSize(path.es5min));
console.log(' -  unpack ' + fileSize(path.unpack));
console.log(' -  unpackmin ' + fileSize(path.unpackmin));
console.log('\n');
