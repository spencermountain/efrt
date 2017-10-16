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
  'true',
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
  // '||',
  // '|',
  '\'',
  '&',
  // 'Math.PI',
  // 12e34,
  '#§$%',
  'π',
  'привет',
  // 'hasOwnProperty',
  'café',
  '$$$',
  // 1e2,
  '{}',
  '[]',
  'constructor',
  'prototype',
  ')&@)^',
  ' -@%@',
  '-constructor',
  // '#!^@#$',
  '..('
];

test('reserved words as keys:', function(t) {
  //basically h[val]=[]  - support reserved words
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
