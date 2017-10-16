var test = require('tape');
const efrt = require('./lib/efrt');

var reserved = [
  'abstract',
  'boolean',
  'break',
  'byte',
  'case',
  'catch',
  'char',
  'class',
  'const',
  'constructor',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'double',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'final',
  'finally',
  'float',
  'for',
  'function',
  'goto',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'int',
  'interface',
  'let',
  'long',
  'native',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'prototype',
  'public',
  'return',
  'short',
  'static',
  'super',
  'switch',
  'synchronized',
  'this',
  'throw',
  'throws',
  'transient',
  // 'true',
  'try',
  'typeof',
  'var',
  'void',
  'volatile',
  'while',
  'with',
  'yeild',
  // '__prototype__',
  '&&',
  '\'',
  '&',
  '#§$%',
  'π',
  'привет',
  // 'hasOwnProperty',
  'café',
  '$$$',
  '{}',
  '[]',
  'constructor',
  'prototype',
  ')&@)^',
  ' -@%@',
  '-constructor',
  '..('
];

//support reserved words
test('reserved words as keys:', function(t) {
  var asKeys = reserved.reduce((h, str) => {
    Object.defineProperty(h, str, {
      writable: true,
      enumerable: true,
      configurable: true,
      value: 'HardWord'
    });
    return h;
  }, {});
  var str = efrt.pack(asKeys);
  t.equal(typeof str, 'string', 'packed-string');

  var unpacked = efrt.unpack(str);
  reserved.forEach((key) => {
    t.equal(unpacked.hasOwnProperty(key), true, 'has ' + key);
  });
  t.end();
});

//support reserved words
test('reserved words as values:', function(t) {
  var asValues = reserved.reduce((h, w) => {
    h['word' + w] = w;
    return h;
  }, {});
  var str = efrt.pack(asValues);
  t.equal(typeof str, 'string', 'packed-string');

  var unpacked = efrt.unpack(str);
  reserved.forEach((word) => {
    t.equal(unpacked['word' + word], word, 'has ' + word);
  });
  t.end();
});
