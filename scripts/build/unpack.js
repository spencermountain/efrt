require('shelljs/global');
//--do just half of the library now
var lib = {
  browserify: '"node_modules/.bin/browserify"',
  derequire: '"node_modules/.bin/derequire"',
  uglify: '"node_modules/.bin/uglifyjs"',
// babili: '"node_modules/.bin/babili"'
};
//final build locations
var path = {
  unpack6: './builds/efrt-unpack.js',
  unpack5: './builds/efrt-unpack.es5.js',
  unpackmin: './builds/efrt-unpack.min.js'
};

//es6 (browserify + derequire)
cmd = lib.browserify + ' "./src/unpack/index.js" --standalone unpack';
cmd += ' | ' + lib.derequire;
cmd += ' >> ' + path.unpack6;
console.log(cmd);
exec(cmd);

//es5 (browserify + derequire)
cmd = lib.browserify + ' "./src/unpack/index.js" --standalone unpack';
cmd += ' -t [ babelify --presets [ es2015 stage-2 ] --plugins [transform-es3-property-literals transform-es3-member-expression-literals] ]';
cmd += ' | ' + lib.derequire;
cmd += ' >> ' + path.unpack5;
console.log(cmd);
exec(cmd);

//unpacker min (uglify)
cmd = lib.uglify + ' ' + path.unpack5 + ' --mangle --compress ';
cmd += ' >> ' + path.unpackmin;
console.log(cmd);
exec(cmd);
