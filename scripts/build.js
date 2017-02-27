require('shelljs/global');
config.silent = true;
var fs = require('fs');

var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
var banner = '/* trie-hard v' + pkg.version + '\n   github.com/nlp-compromise/trie-hard\n   MIT\n*/\n';

//use paths, so libs don't need a -g
var lib = {
  browserify: '"node_modules/.bin/browserify"',
  derequire: '"node_modules/.bin/derequire"',
  uglify: '"node_modules/.bin/uglifyjs"',
  babili: '"node_modules/.bin/babili"'
};

//final build locations
var path = {
  es5: './builds/trie-hard.js',
  es5min: './builds/trie-hard.min.js',
  unpack: './builds/trie-hard-unpack.js',
  unpackmin: './builds/trie-hard-unpack.min.js'
};

//cleanup. remove old builds
exec('rm -rf ./builds && mkdir builds');

//add a header, before our sourcecode
exec('echo ' + banner + ' > ' + path.es5);
exec('echo ' + banner + ' > ' + path.es5min);
exec('echo ' + banner + ' > ' + path.unpack);
exec('echo ' + banner + ' > ' + path.unpackmin);

//es5 main (browserify + derequire)
cmd = lib.browserify + ' "./src/index.js" --standalone trieHard';
cmd += ' -t [ babelify --presets [ es2015 stage-2 ] --plugins [transform-es3-property-literals transform-es3-member-expression-literals] ]';
cmd += ' | ' + lib.derequire;
cmd += ' >> ' + path.es5;
exec(cmd);

//es5 min (uglify)
cmd = lib.uglify + ' ' + path.es5 + ' --mangle --compress ';
cmd += ' >> ' + path.es5min;
exec(cmd);


//--do just half of the library now
//unpacker es5 (browserify + derequire)
cmd = lib.browserify + ' "./src/unpack/index.js" --standalone unpack';
cmd += ' -t [ babelify --presets [ es2015 stage-2 ] --plugins [transform-es3-property-literals transform-es3-member-expression-literals] ]';
cmd += ' | ' + lib.derequire;
cmd += ' >> ' + path.unpack;
exec(cmd);
//unpacker min (uglify)
cmd = lib.uglify + ' ' + path.unpack + ' --mangle --compress ';
cmd += ' >> ' + path.unpackmin;
exec(cmd);

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
