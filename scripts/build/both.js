require('shelljs/global');

var lib = {
  browserify: '"node_modules/.bin/browserify"',
  derequire: '"node_modules/.bin/derequire"',
  uglify: '"node_modules/.bin/uglifyjs"'
};

//final build locations
var path = {
  es5: './builds/efrt.js',
  es5min: './builds/efrt.min.js'
};

//es5 -main (browserify + derequire)
cmd = lib.browserify + ' "./src/index.js" --standalone efrt';
cmd += ' -t [ babelify --presets [ es2015 ] ]';
cmd += ' | ' + lib.derequire;
cmd += ' >> ' + path.es5;
exec(cmd);

//es5.min (uglify)
cmd = lib.uglify + ' ' + path.es5 + ' --mangle --compress ';
cmd += ' >> ' + path.es5min;
exec(cmd);
