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

var Ptrie = _dereq_('./ptrie');

module.exports = function (str) {
  return new Ptrie(str);
};

},{"./ptrie":5}],3:[function(_dereq_,module,exports){
'use strict';

var encoding = _dereq_('../encoding');
var isPrefix = _dereq_('./prefix');
var unravel = _dereq_('./unravel');

var methods = {
  // Return largest matching string in the dictionary (or '')
  has: function has(want) {
    //fail-fast
    if (!want) {
      return false;
    }
    //then, try cache-lookup
    if (this._cache) {
      if (this._cache.hasOwnProperty(want) === true) {
        return this._cache[want];
      }
      return false;
    }
    var self = this;
    var crawl = function crawl(index, prefix) {
      var node = self.nodes[index];
      //the '!' means a prefix-alone is a good match
      if (node[0] === '!') {
        //try to match the prefix (the last branch)
        if (prefix === want) {
          return true;
        }
        node = node.slice(1); //ok, we tried. remove it.
      }
      //each possible match on this line is something like 'me,me2,me4'.
      //try each one
      var matches = node.split(/([A-Z0-9,]+)/g);
      for (var i = 0; i < matches.length; i += 2) {
        var str = matches[i];
        var ref = matches[i + 1];
        if (!str) {
          continue;
        }
        var have = prefix + str;
        //we're at the branch's end, so try to match it
        if (ref === ',' || ref === undefined) {
          if (have === want) {
            return true;
          }
          continue;
        }
        //ok, not a match.
        //well, should we keep going on this branch?
        //if we do, we ignore all the others here.
        if (isPrefix(have, want)) {
          index = self.indexFromRef(ref, index);
          return crawl(index, have);
        }
        //nah, lets try the next branch..
        continue;
      }

      return false;
    };
    return crawl(0, '');
  },

  // References are either absolute (symbol) or relative (1 - based)
  indexFromRef: function indexFromRef(ref, index) {
    var dnode = encoding.fromAlphaCode(ref);
    if (dnode < this.symCount) {
      return this.syms[dnode];
    }
    return index + dnode + 1 - this.symCount;
  },

  toArray: function toArray() {
    return Object.keys(this.toObject());
  },

  toObject: function toObject() {
    if (this._cache) {
      return this._cache;
    }
    return unravel(this);
  },

  cache: function cache() {
    this._cache = unravel(this);
    this.nodes = null;
    this.syms = null;
  }
};
module.exports = methods;

},{"../encoding":1,"./prefix":4,"./unravel":7}],4:[function(_dereq_,module,exports){
'use strict';
//are we on the right path with this string?

module.exports = function (str, want) {
  //allow perfect equals
  if (str === want) {
    return true;
  }
  //compare lengths
  var len = str.length;
  if (len >= want.length) {
    return false;
  }
  //quick slice
  if (len === 1) {
    return str === want[0];
  }
  return want.slice(0, len) === str;
};
// console.log(module.exports('harvar', 'harvard'));

},{}],5:[function(_dereq_,module,exports){
'use strict';

var parseSymbols = _dereq_('./symbols');
var methods = _dereq_('./methods');

//PackedTrie - Trie traversal of the Trie packed-string representation.
var PackedTrie = function PackedTrie(str) {
  this.nodes = str.split(';'); //that's all ;)!
  this.syms = [];
  this.symCount = 0;
  this._cache = null;
  //process symbols, if they have them
  if (str.match(':')) {
    parseSymbols(this);
  }
};

Object.keys(methods).forEach(function (k) {
  PackedTrie.prototype[k] = methods[k];
});

module.exports = PackedTrie;

},{"./methods":3,"./symbols":6}],6:[function(_dereq_,module,exports){
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

},{"../encoding":1}],7:[function(_dereq_,module,exports){
'use strict';
//spin-out all words from this trie

module.exports = function (trie) {
  var all = {};
  var crawl = function crawl(index, pref) {
    var node = trie.nodes[index];
    if (node[0] === '!') {
      all[pref] = true;
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
        all[have] = true;
        continue;
      }
      var newIndex = trie.indexFromRef(ref, index);
      crawl(newIndex, have);
    }
  };
  crawl(0, '');
  return all;
};

},{}]},{},[2])(2)
});