(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.gentrie = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

module.exports = {
  NODE_SEP: ';',
  STRING_SEP: ',',
  TERMINAL_PREFIX: '!',
  BASE: 36
};

},{}],2:[function(_dereq_,module,exports){
'use strict';

var config = _dereq_('./config');

var seq = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var cache = seq.split('').reduce(function (h, c, i) {
  h[c] = i;
  return h;
}, {});
// console.log(cache);

// 0, 1, 2, ..., A, B, C, ..., 00, 01, ... AA, AB, AC, ..., AAA, AAB, ...
var toAlphaCode = function toAlphaCode(n) {
  if (seq[n] !== undefined) {
    return seq[n];
  }
  var places = 1;
  var range = config.BASE;
  var s = '';

  for (; n >= range; n -= range, places++, range *= config.BASE) {}
  while (places--) {
    var d = n % config.BASE;
    s = String.fromCharCode((d < 10 ? 48 : 55) + d) + s;
    n = (n - d) / config.BASE;
  }
  return s;
};

var fromAlphaCode = function fromAlphaCode(s) {
  if (cache[s] !== undefined) {
    return cache[s];
  }
  var n = 0;
  var places = 1;
  var range = config.BASE;
  var pow = 1;

  for (; places < s.length; n += range, places++, range *= config.BASE) {}
  for (var i = s.length - 1; i >= 0; i--, pow *= config.BASE) {
    var d = s.charCodeAt(i) - 48;
    if (d > 10) {
      d -= 7;
    }
    n += d * pow;
  }
  return n;
};

/* Sort elements and remove duplicates from array (modified in place) */
var unique = function unique(a) {
  a.sort();
  for (var i = 1; i < a.length; i++) {
    if (a[i - 1] === a[i]) {
      a.splice(i, 1);
    }
  }
};

var commonPrefix = function commonPrefix(w1, w2) {
  var len = Math.min(w1.length, w2.length);
  while (len > 0) {
    var prefix = w1.slice(0, len);
    if (prefix === w2.slice(0, len)) {
      return prefix;
    }
    len -= 1;
  }
  return '';
};

module.exports = {
  toAlphaCode: toAlphaCode,
  fromAlphaCode: fromAlphaCode,
  unique: unique,
  commonPrefix: commonPrefix
};

// let out = fromAlphaCode('A');
// console.log(out);
// console.log(fromAlphaCode(out));
// console.log(fromAlphaCode('R'));

},{"./config":1}],3:[function(_dereq_,module,exports){
'use strict';

module.exports = {
  pack: _dereq_('./pack/index'),
  unpack: _dereq_('./unpack/index')
};

},{"./pack/index":5,"./unpack/index":8}],4:[function(_dereq_,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Histogram = function () {
  function Histogram() {
    _classCallCheck(this, Histogram);

    this.counts = {};
  }

  _createClass(Histogram, [{
    key: 'init',
    value: function init(sym) {
      if (this.counts[sym] === undefined) {
        this.counts[sym] = 0;
      }
    }
  }, {
    key: 'add',
    value: function add(sym, n) {
      if (n === undefined) {
        n = 1;
      }
      this.init(sym);
      this.counts[sym] += n;
    }
  }, {
    key: 'change',
    value: function change(symNew, symOld, n) {
      if (n === undefined) {
        n = 1;
      }
      this.add(symOld, -n);
      this.add(symNew, n);
    }
  }, {
    key: 'countOf',
    value: function countOf(sym) {
      this.init(sym);
      return this.counts[sym];
    }
  }, {
    key: 'highest',
    value: function highest(top) {
      var sorted = [];
      var keys = Object.keys(this.counts);
      for (var i = 0; i < keys.length; i++) {
        var sym = keys[i];
        sorted.push([sym, this.counts[sym]]);
      }
      sorted.sort(function (a, b) {
        return b[1] - a[1];
      });
      if (top) {
        sorted = sorted.slice(0, top);
      }
      return sorted;
    }
  }]);

  return Histogram;
}();

module.exports = Histogram;

},{}],5:[function(_dereq_,module,exports){
'use strict';

var Trie = _dereq_('./trie');

//turn an array into a compressed string
var pack = function pack(arr) {
  var t = new Trie(arr);
  return t.pack();
};
module.exports = pack;

},{"./trie":7}],6:[function(_dereq_,module,exports){
'use strict';

var Histogram = _dereq_('./histogram');
var config = _dereq_('../config');
var fns = _dereq_('../fns');
// Return packed representation of Trie as a string.

// Return packed representation of Trie as a string.
//
// Each node of the Trie is output on a single line.
//
// For example Trie("the them there thesis this"):
// {
//    "th": {
//      "is": 1,
//      "e": {
//        "": 1,
//        "m": 1,
//        "re": 1,
//        "sis": 1
//      }
//    }
//  }
//
// Would be reperesented as:
//
// th0
// e0is
// !m,re,sis
//
// The line begins with a '!' iff it is a terminal node of the Trie.
// For each string property in a node, the string is listed, along
// with a (relative!) line number of the node that string references.
// Terminal strings (those without child node references) are
// separated by ',' characters.


var nodeLine = function nodeLine(self, node) {
  var line = '',
      sep = '';

  if (self.isTerminal(node)) {
    line += config.TERMINAL_PREFIX;
  }

  var props = self.nodeProps(node);
  for (var i = 0; i < props.length; i++) {
    var prop = props[i];
    if (typeof node[prop] === 'number') {
      line += sep + prop;
      sep = config.STRING_SEP;
      continue;
    }
    if (self.syms[node[prop]._n]) {
      line += sep + prop + self.syms[node[prop]._n];
      sep = '';
      continue;
    }
    var ref = fns.toAlphaCode(node._n - node[prop]._n - 1 + self.symCount);
    // Large reference to smaller string suffix -> duplicate suffix
    if (node[prop]._g && ref.length >= node[prop]._g.length && node[node[prop]._g] === 1) {
      ref = node[prop]._g;
      line += sep + prop + ref;
      sep = config.STRING_SEP;
      continue;
    }
    line += sep + prop + ref;
    sep = '';
  }
  return line;
};

var analyzeRefs = function analyzeRefs(self, node) {
  if (self.visited(node)) {
    return;
  }
  var props = self.nodeProps(node, true);
  for (var i = 0; i < props.length; i++) {
    var prop = props[i];
    var ref = node._n - node[prop]._n - 1;
    // Count the number of single-character relative refs
    if (ref < config.BASE) {
      self.histRel.add(ref);
    }
    // Count the number of characters saved by converting an absolute
    // reference to a one-character symbol.
    self.histAbs.add(node[prop]._n, fns.toAlphaCode(ref).length - 1);
    analyzeRefs(self, node[prop]);
  }
};

var symbolCount = function symbolCount(self) {
  self.histAbs = self.histAbs.highest(config.BASE);
  var savings = [];
  savings[-1] = 0;
  var best = 0,
      sCount = 0;
  var defSize = 3 + fns.toAlphaCode(self.nodeCount).length;
  for (var sym = 0; sym < config.BASE; sym++) {
    if (self.histAbs[sym] === undefined) {
      break;
    }
    savings[sym] = self.histAbs[sym][1] - defSize - self.histRel.countOf(config.BASE - sym - 1) + savings[sym - 1];
    if (savings[sym] >= best) {
      best = savings[sym];
      sCount = sym + 1;
    }
  }
  return sCount;
};

var numberNodes = function numberNodes(self, node) {
  // Topological sort into nodes array
  if (node._n !== undefined) {
    return;
  }
  var props = self.nodeProps(node, true);
  for (var i = 0; i < props.length; i++) {
    numberNodes(self, node[props[i]]); //recursive
  }
  node._n = self.pos++;
  self.nodes.unshift(node);
};

var pack = function pack(self) {
  self.nodes = [];
  self.nodeCount = 0;
  self.syms = {};
  self.symCount = 0;
  self.pos = 0;
  // Make sure we've combined all the common suffixes
  self.optimize();

  self.histAbs = new Histogram();
  self.histRel = new Histogram();

  numberNodes(self, self.root);
  self.nodeCount = self.nodes.length;

  self.prepDFS();
  analyzeRefs(self, self.root);
  self.symCount = symbolCount(self);
  for (var sym = 0; sym < self.symCount; sym++) {
    self.syms[self.histAbs[sym][0]] = fns.toAlphaCode(sym);
  }
  for (var i = 0; i < self.nodeCount; i++) {
    self.nodes[i] = nodeLine(self, self.nodes[i]);
  }
  // Prepend symbols
  for (var _sym = self.symCount - 1; _sym >= 0; _sym--) {
    self.nodes.unshift(fns.toAlphaCode(_sym) + ':' + fns.toAlphaCode(self.nodeCount - self.histAbs[_sym][0] - 1));
  }

  return self.nodes.join(config.NODE_SEP);
};

module.exports = pack;

},{"../config":1,"../fns":2,"./histogram":4}],7:[function(_dereq_,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fns = _dereq_('../fns');
var _pack = _dereq_('./pack');
// const pack = require('./packer');
/*
  org.startpad.trie - A JavaScript implementation of a Trie search datastructure.

  Usage:

      trie = new Trie(dictionary-string);
      bool = trie.isWord(word);

  To use a packed (compressed) version of the trie stored as a string:

      compressed = trie.pack();
      ptrie = new PackedTrie(compressed);
      bool = ptrie.isWord(word)

  Node structure:

    Each node of the Trie is an Object that can contain the following properties:

      '' - If present (with value == 1), the node is a Terminal Node - the prefix
          leading to this node is a word in the dictionary.
      numeric properties (value == 1) - the property name is a terminal string
          so that the prefix + string is a word in the dictionary.
      Object properties - the property name is one or more characters to be consumed
          from the prefix of the test string, with the remainder to be checked in
          the child node.
      '_c': A unique name for the node (starting from 1), used in combining Suffixes.
      '_n': Created when packing the Trie, the sequential node number
          (in pre-order traversal).
      '_d': The number of times a node is shared (it's in-degree from other nodes).
      '_v': Visited in DFS.
      '_g': For singleton nodes, the name of it's single property.
 */
// let ptrie = namespace.lookup('org.startpad.trie.packed');
//
// ns.extend({
//   'Trie': Trie,
//   'Histogram': Histogram
// });

// Create a Trie data structure for searching for membership of strings
// in a dictionary in a very space efficient way.

var Trie = function () {
  function Trie(words) {
    _classCallCheck(this, Trie);

    this.root = {};
    this.lastWord = '';
    this.suffixes = {};
    this.suffixCounts = {};
    this.cNext = 1;
    this.wordCount = 0;
    this.insertWords(words);
    this.vCur = 0;
  }

  // Insert words from one big string, or from an array.


  _createClass(Trie, [{
    key: 'insertWords',
    value: function insertWords(words) {
      if (words === undefined) {
        return;
      }
      if (typeof words === 'string') {
        words = words.split(/[^a-zA-Z]+/);
      }
      for (var i = 0; i < words.length; i++) {
        words[i] = words[i].toLowerCase();
      }
      fns.unique(words);
      for (var _i = 0; _i < words.length; _i++) {
        this.insert(words[_i]);
      }
    }
  }, {
    key: 'insert',
    value: function insert(word) {
      this._insert(word, this.root);
      var lastWord = this.lastWord;
      this.lastWord = word;

      var prefix = fns.commonPrefix(word, lastWord);
      if (prefix === lastWord) {
        return;
      }

      var freeze = this.uniqueNode(lastWord, word, this.root);
      if (freeze) {
        this.combineSuffixNode(freeze);
      }
    }
  }, {
    key: '_insert',
    value: function _insert(word, node) {
      var prefix = void 0,
          next = void 0;

      // Duplicate word entry - ignore
      if (word.length === 0) {
        return;
      }

      // Do any existing props share a common prefix?
      var keys = Object.keys(node);
      for (var i = 0; i < keys.length; i++) {
        var prop = keys[i];
        prefix = fns.commonPrefix(word, prop);
        if (prefix.length === 0) {
          continue;
        }
        // Prop is a proper prefix - recurse to child node
        if (prop === prefix && _typeof(node[prop]) === 'object') {
          this._insert(word.slice(prefix.length), node[prop]);
          return;
        }
        // Duplicate terminal string - ignore
        if (prop === word && typeof node[prop] === 'number') {
          return;
        }
        next = {};
        next[prop.slice(prefix.length)] = node[prop];
        this.addTerminal(next, word = word.slice(prefix.length));
        delete node[prop];
        node[prefix] = next;
        this.wordCount++;
        return;
      }

      // No shared prefix.  Enter the word here as a terminal string.
      this.addTerminal(node, word);
      this.wordCount++;
    }

    // Add a terminal string to node.
    // If 2 characters or less, just add with value == 1.
    // If more than 2 characters, point to shared node
    // Note - don't prematurely share suffixes - these
    // terminals may become split and joined with other
    // nodes in this part of the tree.

  }, {
    key: 'addTerminal',
    value: function addTerminal(node, prop) {
      if (prop.length <= 1) {
        node[prop] = 1;
        return;
      }
      var next = {};
      node[prop[0]] = next;
      this.addTerminal(next, prop.slice(1));
    }

    // Well ordered list of properties in a node (string or object properties)
    // Use nodesOnly==true to return only properties of child nodes (not
    // terminal strings.

  }, {
    key: 'nodeProps',
    value: function nodeProps(node, nodesOnly) {
      var props = [];
      for (var prop in node) {
        if (prop !== '' && prop[0] !== '_') {
          if (!nodesOnly || _typeof(node[prop]) === 'object') {
            props.push(prop);
          }
        }
      }
      props.sort();
      return props;
    }
  }, {
    key: 'optimize',
    value: function optimize() {
      this.combineSuffixNode(this.root);
      this.prepDFS();
      this.countDegree(this.root);
      this.prepDFS();
      this.collapseChains(this.root);
    }

    // Convert Trie to a DAWG by sharing identical nodes

  }, {
    key: 'combineSuffixNode',
    value: function combineSuffixNode(node) {
      // Frozen node - can't change.
      if (node._c) {
        return node;
      }
      // Make sure all children are combined and generate unique node
      // signature for this node.
      var sig = [];
      if (this.isTerminal(node)) {
        sig.push('!');
      }
      var props = this.nodeProps(node);
      for (var i = 0; i < props.length; i++) {
        var prop = props[i];
        if (_typeof(node[prop]) === 'object') {
          node[prop] = this.combineSuffixNode(node[prop]);
          sig.push(prop);
          sig.push(node[prop]._c);
        } else {
          sig.push(prop);
        }
      }
      sig = sig.join('-');

      var shared = this.suffixes[sig];
      if (shared) {
        return shared;
      }
      this.suffixes[sig] = node;
      node._c = this.cNext++;
      return node;
    }
  }, {
    key: 'prepDFS',
    value: function prepDFS() {
      this.vCur++;
    }
  }, {
    key: 'visited',
    value: function visited(node) {
      if (node._v === this.vCur) {
        return true;
      }
      node._v = this.vCur;
      return false;
    }
  }, {
    key: 'countDegree',
    value: function countDegree(node) {
      if (node._d === undefined) {
        node._d = 0;
      }
      node._d++;
      if (this.visited(node)) {
        return;
      }
      var props = this.nodeProps(node, true);
      for (var i = 0; i < props.length; i++) {
        this.countDegree(node[props[i]]);
      }
    }

    // Remove intermediate singleton nodes by hoisting into their parent

  }, {
    key: 'collapseChains',
    value: function collapseChains(node) {
      var prop = void 0,
          props = void 0,
          child = void 0,
          i = void 0;
      if (this.visited(node)) {
        return;
      }
      props = this.nodeProps(node);
      for (i = 0; i < props.length; i++) {
        prop = props[i];
        child = node[prop];
        if ((typeof child === 'undefined' ? 'undefined' : _typeof(child)) !== 'object') {
          continue;
        }
        this.collapseChains(child);
        // Hoist the singleton child's single property to the parent
        if (child._g !== undefined && (child._d === 1 || child._g.length === 1)) {
          delete node[prop];
          prop += child._g;
          node[prop] = child[child._g];
        }
      }
      // Identify singleton nodes
      if (props.length === 1 && !this.isTerminal(node)) {
        node._g = prop;
      }
    }
  }, {
    key: 'isWord',
    value: function isWord(word) {
      return this.isFragment(word, this.root);
    }
  }, {
    key: 'isTerminal',
    value: function isTerminal(node) {
      return !!node[''];
    }
  }, {
    key: 'isFragment',
    value: function isFragment(word, node) {
      if (word.length === 0) {
        return this.isTerminal(node);
      }

      if (node[word] === 1) {
        return true;
      }

      // Find a prefix of word reference to a child
      var props = this.nodeProps(node, true);
      for (var i = 0; i < props.length; i++) {
        var prop = props[i];
        if (prop === word.slice(0, prop.length)) {
          return this.isFragment(word.slice(prop.length), node[prop]);
        }
      }

      return false;
    }

    // Find highest node in Trie that is on the path to word
    // and that is NOT on the path to other.

  }, {
    key: 'uniqueNode',
    value: function uniqueNode(word, other, node) {
      var props = this.nodeProps(node, true);
      for (var i = 0; i < props.length; i++) {
        var prop = props[i];
        if (prop === word.slice(0, prop.length)) {
          if (prop !== other.slice(0, prop.length)) {
            return node[prop];
          }
          return this.uniqueNode(word.slice(prop.length), other.slice(prop.length), node[prop]);
        }
      }
      return undefined;
    }
  }, {
    key: 'pack',
    value: function pack() {
      return _pack(this);
    }
  }]);

  return Trie;
}();

module.exports = Trie;

},{"../fns":2,"./pack":6}],8:[function(_dereq_,module,exports){
'use strict';

var Ptrie = _dereq_('./ptrie');

var unpack = function unpack(str) {
  return new Ptrie(str);
};
module.exports = unpack;

},{"./ptrie":9}],9:[function(_dereq_,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var config = _dereq_('../config');
var fns = _dereq_('../fns');

// const reNodePart = new RegExp('([^A-Z0-9,]+)([A-Z0-9,]+|$)', 'g'); //( , is STRING_SEP)

//are we on the right path with this string?
var isPrefix = function isPrefix(str, want) {
  var len = str.length;
  if (len >= want.length) {
    return false;
  }
  if (len === 1) {
    return str === want[0];
  }
  return want.slice(0, len) === str;
};
// console.log(isPrefix('harvar', 'harvard'));

/*
  PackedTrie - Trie traversal of the Trie packed-string representation.
*/

// Implement isWord given a packed representation of a Trie.

var PackedTrie = function () {
  function PackedTrie(str) {
    _classCallCheck(this, PackedTrie);

    this.nodes = str.split(config.NODE_SEP);
    this.syms = [];
    this.symCount = 0;
    //some tries dont even have symbols
    if (str.match(':')) {
      this.initSymbols();
    }
  }

  _createClass(PackedTrie, [{
    key: 'initSymbols',
    value: function initSymbols() {
      //the symbols are at the top of the array.
      //... process these lines, if they exist
      var reSymbol = new RegExp('([0-9A-Z]+):([0-9A-Z]+)');
      for (var i = 0; i < this.nodes.length; i++) {
        var m = reSymbol.exec(this.nodes[i]);
        if (!m) {
          this.symCount = i;
          break;
        }
        this.syms[fns.fromAlphaCode(m[1])] = fns.fromAlphaCode(m[2]);
      }
      //remove from main node list
      this.nodes = this.nodes.slice(this.symCount, this.nodes.length);
    }

    // Return largest matching string in the dictionary (or '')

  }, {
    key: 'has',
    value: function has(want) {
      var _this = this;

      var crawl = function crawl(inode, prefix) {
        var node = _this.nodes[inode];
        // console.log(node);
        //the '!' means it includes a prefix
        if (node[0] === '!') {
          node = node.slice(1); //remove it
        }
        if (node === want) {
          return true;
        }

        var matches = node.split(/([A-Z0-9,]+)/g);
        // console.log(matches);
        for (var i = 0; i < matches.length; i += 2) {
          var str = matches[i];
          var ref = matches[i + 1];
          var have = prefix + str;
          if (have === want) {
            return true;
          }
          // Done or no possible future match from str
          if (!isPrefix(have, want)) {
            continue;
          }
          //we're at the end of this branch
          if (ref === ',' || ref === undefined) {
            return false;
          }
          //otherwise, do the next one
          inode = _this.inodeFromRef(ref, inode);
          return crawl(inode, have);
        }
        return false;
      };
      return crawl(0, '');
      // return found;
    }

    // References are either absolute (symbol) or relative (1 - based)

  }, {
    key: 'inodeFromRef',
    value: function inodeFromRef(ref, inode) {
      var dnode = fns.fromAlphaCode(ref);
      if (dnode < this.symCount) {
        return this.syms[dnode];
      }
      return inode + dnode + 1 - this.symCount;
    }
  }]);

  return PackedTrie;
}();

module.exports = PackedTrie;

},{"../config":1,"../fns":2}]},{},[3])(3)
});