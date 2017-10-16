(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.unpack = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

var BASE = 36;

var seq = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var cache = seq.split('').reduce(function (h, c, i) {
  h[c] = i;
  return h;
}, {});

// 0, 1, 2, ..., A, B, C, ..., 00, 01, ... AA, AB, AC, ..., AAA, AAB, ...
var toAlphaCode = function toAlphaCode(n) {
  if (seq[n] !== undefined) {
    return seq[n];
  }
  var places = 1;
  var range = BASE;
  var s = '';

  for (; n >= range; n -= range, places++, range *= BASE) {}
  while (places--) {
    var d = n % BASE;
    s = String.fromCharCode((d < 10 ? 48 : 55) + d) + s;
    n = (n - d) / BASE;
  }
  return s;
};

var fromAlphaCode = function fromAlphaCode(s) {
  if (cache[s] !== undefined) {
    return cache[s];
  }
  var n = 0;
  var places = 1;
  var range = BASE;
  var pow = 1;

  for (; places < s.length; n += range, places++, range *= BASE) {}
  for (var i = s.length - 1; i >= 0; i--, pow *= BASE) {
    var d = s.charCodeAt(i) - 48;
    if (d > 10) {
      d -= 7;
    }
    n += d * pow;
  }
  return n;
};

module.exports = {
  toAlphaCode: toAlphaCode,
  fromAlphaCode: fromAlphaCode
};

},{}],2:[function(_dereq_,module,exports){
'use strict';

var unpack = _dereq_('./unpack');

module.exports = function (str) {
  //turn the weird string into a key-value object again
  var obj = str.split('|').reduce(function (h, s) {
    var arr = s.split('¦');
    h[arr[0]] = arr[1];
    return h;
  }, {});
  var all = {};
  Object.keys(obj).forEach(function (cat) {
    var arr = unpack(obj[cat]);
    //special case, for botched-boolean
    if (cat === 'true') {
      cat = true;
    }
    for (var i = 0; i < arr.length; i++) {
      var k = arr[i];
      if (all.hasOwnProperty(k) === true) {
        if (Array.isArray(all[k]) === false) {
          all[k] = [all[k], cat];
        } else {
          all[k].push(cat);
        }
      } else {
        all[k] = cat;
      }
    }
  });
  return all;
};

},{"./unpack":4}],3:[function(_dereq_,module,exports){
'use strict';

var encoding = _dereq_('../encoding');

//the symbols are at the top of the array.
module.exports = function (t) {
  //... process these lines
  var reSymbol = new RegExp('([0-9A-Z]+):([0-9A-Z]+)');
  for (var i = 0; i < t.nodes.length; i++) {
    var m = reSymbol.exec(t.nodes[i]);
    if (!m) {
      t.symCount = i;
      break;
    }
    t.syms[encoding.fromAlphaCode(m[1])] = encoding.fromAlphaCode(m[2]);
  }
  //remove from main node list
  t.nodes = t.nodes.slice(t.symCount, t.nodes.length);
};

},{"../encoding":1}],4:[function(_dereq_,module,exports){
'use strict';

var parseSymbols = _dereq_('./symbols');
var encoding = _dereq_('../encoding');

// References are either absolute (symbol) or relative (1 - based)
var indexFromRef = function indexFromRef(trie, ref, index) {
  var dnode = encoding.fromAlphaCode(ref);
  if (dnode < trie.symCount) {
    return trie.syms[dnode];
  }
  return index + dnode + 1 - trie.symCount;
};

var toArray = function toArray(trie) {
  var all = [];
  var crawl = function crawl(index, pref) {
    var node = trie.nodes[index];
    if (node[0] === '!') {
      all.push(pref);
      node = node.slice(1); //ok, we tried. remove it.
    }
    var matches = node.split(/([A-Z0-9,]+)/g);
    for (var i = 0; i < matches.length; i += 2) {
      var str = matches[i];
      var ref = matches[i + 1];
      if (!str) {
        continue;
      }

      var have = pref + str;
      //branch's end
      if (ref === ',' || ref === undefined) {
        all.push(have);
        continue;
      }
      var newIndex = indexFromRef(trie, ref, index);
      crawl(newIndex, have);
    }
  };
  crawl(0, '');
  return all;
};

//PackedTrie - Trie traversal of the Trie packed-string representation.
var unpack = function unpack(str) {
  var trie = {
    nodes: str.split(';'), //that's all ;)!
    syms: [],
    symCount: 0
  };
  //process symbols, if they have them
  if (str.match(':')) {
    parseSymbols(trie);
  }
  return toArray(trie);
};

module.exports = unpack;

},{"../encoding":1,"./symbols":3}]},{},[2])(2)
});(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.unpack = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

var BASE = 36;

var seq = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var cache = seq.split('').reduce(function (h, c, i) {
  h[c] = i;
  return h;
}, {});

// 0, 1, 2, ..., A, B, C, ..., 00, 01, ... AA, AB, AC, ..., AAA, AAB, ...
var toAlphaCode = function toAlphaCode(n) {
  if (seq[n] !== undefined) {
    return seq[n];
  }
  var places = 1;
  var range = BASE;
  var s = '';

  for (; n >= range; n -= range, places++, range *= BASE) {}
  while (places--) {
    var d = n % BASE;
    s = String.fromCharCode((d < 10 ? 48 : 55) + d) + s;
    n = (n - d) / BASE;
  }
  return s;
};

var fromAlphaCode = function fromAlphaCode(s) {
  if (cache[s] !== undefined) {
    return cache[s];
  }
  var n = 0;
  var places = 1;
  var range = BASE;
  var pow = 1;

  for (; places < s.length; n += range, places++, range *= BASE) {}
  for (var i = s.length - 1; i >= 0; i--, pow *= BASE) {
    var d = s.charCodeAt(i) - 48;
    if (d > 10) {
      d -= 7;
    }
    n += d * pow;
  }
  return n;
};

module.exports = {
  toAlphaCode: toAlphaCode,
  fromAlphaCode: fromAlphaCode
};

},{}],2:[function(_dereq_,module,exports){
'use strict';

var unpack = _dereq_('./unpack');

module.exports = function (str) {
  //turn the weird string into a key-value object again
  var obj = str.split('|').reduce(function (h, s) {
    var arr = s.split('¦');
    h[arr[0]] = arr[1];
    return h;
  }, {});
  var all = {};
  Object.keys(obj).forEach(function (cat) {
    var arr = unpack(obj[cat]);
    //special case, for botched-boolean
    if (cat === 'true') {
      cat = true;
    }
    for (var i = 0; i < arr.length; i++) {
      var k = arr[i];
      if (all.hasOwnProperty(k) === true) {
        if (Array.isArray(all[k]) === false) {
          all[k] = [all[k], cat];
        } else {
          all[k].push(cat);
        }
      } else {
        all[k] = cat;
      }
    }
  });
  return all;
};

},{"./unpack":4}],3:[function(_dereq_,module,exports){
'use strict';

var encoding = _dereq_('../encoding');

//the symbols are at the top of the array.
module.exports = function (t) {
  //... process these lines
  var reSymbol = new RegExp('([0-9A-Z]+):([0-9A-Z]+)');
  for (var i = 0; i < t.nodes.length; i++) {
    var m = reSymbol.exec(t.nodes[i]);
    if (!m) {
      t.symCount = i;
      break;
    }
    t.syms[encoding.fromAlphaCode(m[1])] = encoding.fromAlphaCode(m[2]);
  }
  //remove from main node list
  t.nodes = t.nodes.slice(t.symCount, t.nodes.length);
};

},{"../encoding":1}],4:[function(_dereq_,module,exports){
'use strict';

var parseSymbols = _dereq_('./symbols');
var encoding = _dereq_('../encoding');

// References are either absolute (symbol) or relative (1 - based)
var indexFromRef = function indexFromRef(trie, ref, index) {
  var dnode = encoding.fromAlphaCode(ref);
  if (dnode < trie.symCount) {
    return trie.syms[dnode];
  }
  return index + dnode + 1 - trie.symCount;
};

var toArray = function toArray(trie) {
  var all = [];
  var crawl = function crawl(index, pref) {
    var node = trie.nodes[index];
    if (node[0] === '!') {
      all.push(pref);
      node = node.slice(1); //ok, we tried. remove it.
    }
    var matches = node.split(/([A-Z0-9,]+)/g);
    for (var i = 0; i < matches.length; i += 2) {
      var str = matches[i];
      var ref = matches[i + 1];
      if (!str) {
        continue;
      }

      var have = pref + str;
      //branch's end
      if (ref === ',' || ref === undefined) {
        all.push(have);
        continue;
      }
      var newIndex = indexFromRef(trie, ref, index);
      crawl(newIndex, have);
    }
  };
  crawl(0, '');
  return all;
};

//PackedTrie - Trie traversal of the Trie packed-string representation.
var unpack = function unpack(str) {
  var trie = {
    nodes: str.split(';'), //that's all ;)!
    syms: [],
    symCount: 0
  };
  //process symbols, if they have them
  if (str.match(':')) {
    parseSymbols(trie);
  }
  return toArray(trie);
};

module.exports = unpack;

},{"../encoding":1,"./symbols":3}]},{},[2])(2)
});(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.unpack = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

var BASE = 36;

var seq = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var cache = seq.split('').reduce(function (h, c, i) {
  h[c] = i;
  return h;
}, {});

// 0, 1, 2, ..., A, B, C, ..., 00, 01, ... AA, AB, AC, ..., AAA, AAB, ...
var toAlphaCode = function toAlphaCode(n) {
  if (seq[n] !== undefined) {
    return seq[n];
  }
  var places = 1;
  var range = BASE;
  var s = '';

  for (; n >= range; n -= range, places++, range *= BASE) {}
  while (places--) {
    var d = n % BASE;
    s = String.fromCharCode((d < 10 ? 48 : 55) + d) + s;
    n = (n - d) / BASE;
  }
  return s;
};

var fromAlphaCode = function fromAlphaCode(s) {
  if (cache[s] !== undefined) {
    return cache[s];
  }
  var n = 0;
  var places = 1;
  var range = BASE;
  var pow = 1;

  for (; places < s.length; n += range, places++, range *= BASE) {}
  for (var i = s.length - 1; i >= 0; i--, pow *= BASE) {
    var d = s.charCodeAt(i) - 48;
    if (d > 10) {
      d -= 7;
    }
    n += d * pow;
  }
  return n;
};

module.exports = {
  toAlphaCode: toAlphaCode,
  fromAlphaCode: fromAlphaCode
};

},{}],2:[function(_dereq_,module,exports){
'use strict';

var unpack = _dereq_('./unpack');

module.exports = function (str) {
  //turn the weird string into a key-value object again
  var obj = str.split('|').reduce(function (h, s) {
    var arr = s.split('¦');
    h[arr[0]] = arr[1];
    return h;
  }, {});
  var all = {};
  Object.keys(obj).forEach(function (cat) {
    var arr = unpack(obj[cat]);
    //special case, for botched-boolean
    if (cat === 'true') {
      cat = true;
    }
    for (var i = 0; i < arr.length; i++) {
      var k = arr[i];
      if (all.hasOwnProperty(k) === true) {
        if (Array.isArray(all[k]) === false) {
          all[k] = [all[k], cat];
        } else {
          all[k].push(cat);
        }
      } else {
        all[k] = cat;
      }
    }
  });
  return all;
};

},{"./unpack":4}],3:[function(_dereq_,module,exports){
'use strict';

var encoding = _dereq_('../encoding');

//the symbols are at the top of the array.
module.exports = function (t) {
  //... process these lines
  var reSymbol = new RegExp('([0-9A-Z]+):([0-9A-Z]+)');
  for (var i = 0; i < t.nodes.length; i++) {
    var m = reSymbol.exec(t.nodes[i]);
    if (!m) {
      t.symCount = i;
      break;
    }
    t.syms[encoding.fromAlphaCode(m[1])] = encoding.fromAlphaCode(m[2]);
  }
  //remove from main node list
  t.nodes = t.nodes.slice(t.symCount, t.nodes.length);
};

},{"../encoding":1}],4:[function(_dereq_,module,exports){
'use strict';

var parseSymbols = _dereq_('./symbols');
var encoding = _dereq_('../encoding');

// References are either absolute (symbol) or relative (1 - based)
var indexFromRef = function indexFromRef(trie, ref, index) {
  var dnode = encoding.fromAlphaCode(ref);
  if (dnode < trie.symCount) {
    return trie.syms[dnode];
  }
  return index + dnode + 1 - trie.symCount;
};

var toArray = function toArray(trie) {
  var all = [];
  var crawl = function crawl(index, pref) {
    var node = trie.nodes[index];
    if (node[0] === '!') {
      all.push(pref);
      node = node.slice(1); //ok, we tried. remove it.
    }
    var matches = node.split(/([A-Z0-9,]+)/g);
    for (var i = 0; i < matches.length; i += 2) {
      var str = matches[i];
      var ref = matches[i + 1];
      if (!str) {
        continue;
      }

      var have = pref + str;
      //branch's end
      if (ref === ',' || ref === undefined) {
        all.push(have);
        continue;
      }
      var newIndex = indexFromRef(trie, ref, index);
      crawl(newIndex, have);
    }
  };
  crawl(0, '');
  return all;
};

//PackedTrie - Trie traversal of the Trie packed-string representation.
var unpack = function unpack(str) {
  var trie = {
    nodes: str.split(';'), //that's all ;)!
    syms: [],
    symCount: 0
  };
  //process symbols, if they have them
  if (str.match(':')) {
    parseSymbols(trie);
  }
  return toArray(trie);
};

module.exports = unpack;

},{"../encoding":1,"./symbols":3}]},{},[2])(2)
});(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.unpack = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

var BASE = 36;

var seq = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var cache = seq.split('').reduce(function (h, c, i) {
  h[c] = i;
  return h;
}, {});

// 0, 1, 2, ..., A, B, C, ..., 00, 01, ... AA, AB, AC, ..., AAA, AAB, ...
var toAlphaCode = function toAlphaCode(n) {
  if (seq[n] !== undefined) {
    return seq[n];
  }
  var places = 1;
  var range = BASE;
  var s = '';

  for (; n >= range; n -= range, places++, range *= BASE) {}
  while (places--) {
    var d = n % BASE;
    s = String.fromCharCode((d < 10 ? 48 : 55) + d) + s;
    n = (n - d) / BASE;
  }
  return s;
};

var fromAlphaCode = function fromAlphaCode(s) {
  if (cache[s] !== undefined) {
    return cache[s];
  }
  var n = 0;
  var places = 1;
  var range = BASE;
  var pow = 1;

  for (; places < s.length; n += range, places++, range *= BASE) {}
  for (var i = s.length - 1; i >= 0; i--, pow *= BASE) {
    var d = s.charCodeAt(i) - 48;
    if (d > 10) {
      d -= 7;
    }
    n += d * pow;
  }
  return n;
};

module.exports = {
  toAlphaCode: toAlphaCode,
  fromAlphaCode: fromAlphaCode
};

},{}],2:[function(_dereq_,module,exports){
'use strict';

var unpack = _dereq_('./unpack');

module.exports = function (str) {
  //turn the weird string into a key-value object again
  var obj = str.split('|').reduce(function (h, s) {
    var arr = s.split('¦');
    h[arr[0]] = arr[1];
    return h;
  }, {});
  var all = {};
  Object.keys(obj).forEach(function (cat) {
    var arr = unpack(obj[cat]);
    //special case, for botched-boolean
    if (cat === 'true') {
      cat = true;
    }
    for (var i = 0; i < arr.length; i++) {
      var k = arr[i];
      if (all.hasOwnProperty(k) === true) {
        if (Array.isArray(all[k]) === false) {
          all[k] = [all[k], cat];
        } else {
          all[k].push(cat);
        }
      } else {
        all[k] = cat;
      }
    }
  });
  return all;
};

},{"./unpack":4}],3:[function(_dereq_,module,exports){
'use strict';

var encoding = _dereq_('../encoding');

//the symbols are at the top of the array.
module.exports = function (t) {
  //... process these lines
  var reSymbol = new RegExp('([0-9A-Z]+):([0-9A-Z]+)');
  for (var i = 0; i < t.nodes.length; i++) {
    var m = reSymbol.exec(t.nodes[i]);
    if (!m) {
      t.symCount = i;
      break;
    }
    t.syms[encoding.fromAlphaCode(m[1])] = encoding.fromAlphaCode(m[2]);
  }
  //remove from main node list
  t.nodes = t.nodes.slice(t.symCount, t.nodes.length);
};

},{"../encoding":1}],4:[function(_dereq_,module,exports){
'use strict';

var parseSymbols = _dereq_('./symbols');
var encoding = _dereq_('../encoding');

// References are either absolute (symbol) or relative (1 - based)
var indexFromRef = function indexFromRef(trie, ref, index) {
  var dnode = encoding.fromAlphaCode(ref);
  if (dnode < trie.symCount) {
    return trie.syms[dnode];
  }
  return index + dnode + 1 - trie.symCount;
};

var toArray = function toArray(trie) {
  var all = [];
  var crawl = function crawl(index, pref) {
    var node = trie.nodes[index];
    if (node[0] === '!') {
      all.push(pref);
      node = node.slice(1); //ok, we tried. remove it.
    }
    var matches = node.split(/([A-Z0-9,]+)/g);
    for (var i = 0; i < matches.length; i += 2) {
      var str = matches[i];
      var ref = matches[i + 1];
      if (!str) {
        continue;
      }

      var have = pref + str;
      //branch's end
      if (ref === ',' || ref === undefined) {
        all.push(have);
        continue;
      }
      var newIndex = indexFromRef(trie, ref, index);
      crawl(newIndex, have);
    }
  };
  crawl(0, '');
  return all;
};

//PackedTrie - Trie traversal of the Trie packed-string representation.
var unpack = function unpack(str) {
  var trie = {
    nodes: str.split(';'), //that's all ;)!
    syms: [],
    symCount: 0
  };
  //process symbols, if they have them
  if (str.match(':')) {
    parseSymbols(trie);
  }
  return toArray(trie);
};

module.exports = unpack;

},{"../encoding":1,"./symbols":3}]},{},[2])(2)
});(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.unpack = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

var BASE = 36;

var seq = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var cache = seq.split('').reduce(function (h, c, i) {
  h[c] = i;
  return h;
}, {});

// 0, 1, 2, ..., A, B, C, ..., 00, 01, ... AA, AB, AC, ..., AAA, AAB, ...
var toAlphaCode = function toAlphaCode(n) {
  if (seq[n] !== undefined) {
    return seq[n];
  }
  var places = 1;
  var range = BASE;
  var s = '';

  for (; n >= range; n -= range, places++, range *= BASE) {}
  while (places--) {
    var d = n % BASE;
    s = String.fromCharCode((d < 10 ? 48 : 55) + d) + s;
    n = (n - d) / BASE;
  }
  return s;
};

var fromAlphaCode = function fromAlphaCode(s) {
  if (cache[s] !== undefined) {
    return cache[s];
  }
  var n = 0;
  var places = 1;
  var range = BASE;
  var pow = 1;

  for (; places < s.length; n += range, places++, range *= BASE) {}
  for (var i = s.length - 1; i >= 0; i--, pow *= BASE) {
    var d = s.charCodeAt(i) - 48;
    if (d > 10) {
      d -= 7;
    }
    n += d * pow;
  }
  return n;
};

module.exports = {
  toAlphaCode: toAlphaCode,
  fromAlphaCode: fromAlphaCode
};

},{}],2:[function(_dereq_,module,exports){
'use strict';

var unpack = _dereq_('./unpack');

module.exports = function (str) {
  //turn the weird string into a key-value object again
  var obj = str.split('|').reduce(function (h, s) {
    var arr = s.split('¦');
    h[arr[0]] = arr[1];
    return h;
  }, {});
  var all = {};
  Object.keys(obj).forEach(function (cat) {
    var arr = unpack(obj[cat]);
    //special case, for botched-boolean
    if (cat === 'true') {
      cat = true;
    }
    for (var i = 0; i < arr.length; i++) {
      var k = arr[i];
      if (all.hasOwnProperty(k) === true) {
        if (Array.isArray(all[k]) === false) {
          all[k] = [all[k], cat];
        } else {
          all[k].push(cat);
        }
      } else {
        all[k] = cat;
      }
    }
  });
  return all;
};

},{"./unpack":4}],3:[function(_dereq_,module,exports){
'use strict';

var encoding = _dereq_('../encoding');

//the symbols are at the top of the array.
module.exports = function (t) {
  //... process these lines
  var reSymbol = new RegExp('([0-9A-Z]+):([0-9A-Z]+)');
  for (var i = 0; i < t.nodes.length; i++) {
    var m = reSymbol.exec(t.nodes[i]);
    if (!m) {
      t.symCount = i;
      break;
    }
    t.syms[encoding.fromAlphaCode(m[1])] = encoding.fromAlphaCode(m[2]);
  }
  //remove from main node list
  t.nodes = t.nodes.slice(t.symCount, t.nodes.length);
};

},{"../encoding":1}],4:[function(_dereq_,module,exports){
'use strict';

var parseSymbols = _dereq_('./symbols');
var encoding = _dereq_('../encoding');

// References are either absolute (symbol) or relative (1 - based)
var indexFromRef = function indexFromRef(trie, ref, index) {
  var dnode = encoding.fromAlphaCode(ref);
  if (dnode < trie.symCount) {
    return trie.syms[dnode];
  }
  return index + dnode + 1 - trie.symCount;
};

var toArray = function toArray(trie) {
  var all = [];
  var crawl = function crawl(index, pref) {
    var node = trie.nodes[index];
    if (node[0] === '!') {
      all.push(pref);
      node = node.slice(1); //ok, we tried. remove it.
    }
    var matches = node.split(/([A-Z0-9,]+)/g);
    for (var i = 0; i < matches.length; i += 2) {
      var str = matches[i];
      var ref = matches[i + 1];
      if (!str) {
        continue;
      }

      var have = pref + str;
      //branch's end
      if (ref === ',' || ref === undefined) {
        all.push(have);
        continue;
      }
      var newIndex = indexFromRef(trie, ref, index);
      crawl(newIndex, have);
    }
  };
  crawl(0, '');
  return all;
};

//PackedTrie - Trie traversal of the Trie packed-string representation.
var unpack = function unpack(str) {
  var trie = {
    nodes: str.split(';'), //that's all ;)!
    syms: [],
    symCount: 0
  };
  //process symbols, if they have them
  if (str.match(':')) {
    parseSymbols(trie);
  }
  return toArray(trie);
};

module.exports = unpack;

},{"../encoding":1,"./symbols":3}]},{},[2])(2)
});