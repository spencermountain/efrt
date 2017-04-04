/* efrt trie-compression v0.0.6  github.com/nlp-compromise/efrt  - MIT */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.efrt = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
module.exports = {
  NODE_SEP: ';',
  STRING_SEP: ',',
  TERMINAL_PREFIX: '!',
  //characters banned from entering the trie
  NOT_ALLOWED: new RegExp('[0-9A-Z,;!]'),
  BASE: 36,
};

},{}],2:[function(_dereq_,module,exports){
'use strict';
const BASE = 36;

const seq = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const cache = seq.split('').reduce(function(h, c, i) {
  h[c] = i;
  return h;
}, {});

// 0, 1, 2, ..., A, B, C, ..., 00, 01, ... AA, AB, AC, ..., AAA, AAB, ...
const toAlphaCode = function(n) {
  if (seq[n] !== undefined) {
    return seq[n];
  }
  let places = 1;
  let range = BASE;
  let s = '';

  for (; n >= range; n -= range, places++, range *= BASE) {
  }
  while (places--) {
    const d = n % BASE;
    s = String.fromCharCode((d < 10 ? 48 : 55) + d) + s;
    n = (n - d) / BASE;
  }
  return s;
};


const fromAlphaCode = function(s) {
  if (cache[s] !== undefined) {
    return cache[s];
  }
  let n = 0;
  let places = 1;
  let range = BASE;
  let pow = 1;

  for (; places < s.length; n += range, places++, range *= BASE) {
  }
  for (let i = s.length - 1; i >= 0; i--, pow *= BASE) {
    let d = s.charCodeAt(i) - 48;
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

},{}],3:[function(_dereq_,module,exports){
(function (global){
'use strict';
const efrt = {
  pack: _dereq_('./pack/index'),
  unpack: _dereq_('./unpack/index')
};

//and then all-the-exports...
if (typeof self !== 'undefined') {
  self.efrt = efrt; // Web Worker
} else if (typeof window !== 'undefined') {
  window.efrt = efrt; // Browser
} else if (typeof global !== 'undefined') {
  global.efrt = efrt; // NodeJS
}
//don't forget amd!
if (typeof define === 'function' && define.amd) {
  define(efrt);
}
//then for some reason, do this too!
if (typeof module !== 'undefined') {
  module.exports = efrt;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./pack/index":6,"./unpack/index":10}],4:[function(_dereq_,module,exports){
'use strict';

const commonPrefix = function(w1, w2) {
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

/* Sort elements and remove duplicates from array (modified in place) */
const unique = function(a) {
  a.sort();
  for (let i = 1; i < a.length; i++) {
    if (a[i - 1] === a[i]) {
      a.splice(i, 1);
    }
  }
};

module.exports = {
  commonPrefix: commonPrefix,
  unique: unique
};

},{}],5:[function(_dereq_,module,exports){
'use strict';

class Histogram {
  constructor() {
    this.counts = {};
  }
  init(sym) {
    if (this.counts[sym] === undefined) {
      this.counts[sym] = 0;
    }
  }
  add(sym, n) {
    if (n === undefined) {
      n = 1;
    }
    this.init(sym);
    this.counts[sym] += n;
  }
  change(symNew, symOld, n) {
    if (n === undefined) {
      n = 1;
    }
    this.add(symOld, -n);
    this.add(symNew, n);
  }
  countOf(sym) {
    this.init(sym);
    return this.counts[sym];
  }
  highest(top) {
    let sorted = [];
    let keys = Object.keys(this.counts);
    for (let i = 0; i < keys.length; i++) {
      let sym = keys[i];
      sorted.push([sym, this.counts[sym]]);
    }
    sorted.sort(function(a, b) {
      return b[1] - a[1];
    });
    if (top) {
      sorted = sorted.slice(0, top);
    }
    return sorted;
  }
}
module.exports = Histogram;

},{}],6:[function(_dereq_,module,exports){
'use strict';
const Trie = _dereq_('./trie');

//turn an array into a compressed string
const pack = function(arr) {
  let t = new Trie(arr);
  return t.pack();
};
module.exports = pack;

},{"./trie":9}],7:[function(_dereq_,module,exports){
const fns = _dereq_('./fns');
const pack = _dereq_('./pack');
const config = _dereq_('../config');

module.exports = {
  // Insert words from one big string, or from an array.
  insertWords: function(words) {
    if (words === undefined) {
      return;
    }
    if (typeof words === 'string') {
      words = words.split(/[^a-zA-Z]+/);
    }
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i].toLowerCase();
    }
    fns.unique(words);
    for (let i = 0; i < words.length; i++) {
      if (words[i].match(config.NOT_ALLOWED) === null) {
        this.insert(words[i]);
      }
    }
  },

  insert: function(word) {
    this._insert(word, this.root);
    let lastWord = this.lastWord;
    this.lastWord = word;

    let prefix = fns.commonPrefix(word, lastWord);
    if (prefix === lastWord) {
      return;
    }

    let freeze = this.uniqueNode(lastWord, word, this.root);
    if (freeze) {
      this.combineSuffixNode(freeze);
    }
  },

  _insert: function(word, node) {
    let prefix,
      next;

    // Duplicate word entry - ignore
    if (word.length === 0) {
      return;
    }

    // Do any existing props share a common prefix?
    let keys = Object.keys(node);
    for(let i = 0; i < keys.length; i++) {
      let prop = keys[i];
      prefix = fns.commonPrefix(word, prop);
      if (prefix.length === 0) {
        continue;
      }
      // Prop is a proper prefix - recurse to child node
      if (prop === prefix && typeof node[prop] === 'object') {
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
  },

  // Add a terminal string to node.
  // If 2 characters or less, just add with value == 1.
  // If more than 2 characters, point to shared node
  // Note - don't prematurely share suffixes - these
  // terminals may become split and joined with other
  // nodes in this part of the tree.
  addTerminal: function(node, prop) {
    if (prop.length <= 1) {
      node[prop] = 1;
      return;
    }
    let next = {};
    node[prop[0]] = next;
    this.addTerminal(next, prop.slice(1));
  },

  // Well ordered list of properties in a node (string or object properties)
  // Use nodesOnly==true to return only properties of child nodes (not
  // terminal strings.
  nodeProps: function(node, nodesOnly) {
    let props = [];
    for (let prop in node) {
      if (prop !== '' && prop[0] !== '_') {
        if (!nodesOnly || typeof node[prop] === 'object') {
          props.push(prop);
        }
      }
    }
    props.sort();
    return props;
  },

  optimize: function() {
    this.combineSuffixNode(this.root);
    this.prepDFS();
    this.countDegree(this.root);
    this.prepDFS();
    this.collapseChains(this.root);
  },

  // Convert Trie to a DAWG by sharing identical nodes
  combineSuffixNode: function(node) {
    // Frozen node - can't change.
    if (node._c) {
      return node;
    }
    // Make sure all children are combined and generate unique node
    // signature for this node.
    let sig = [];
    if (this.isTerminal(node)) {
      sig.push('!');
    }
    let props = this.nodeProps(node);
    for (let i = 0; i < props.length; i++) {
      let prop = props[i];
      if (typeof node[prop] === 'object') {
        node[prop] = this.combineSuffixNode(node[prop]);
        sig.push(prop);
        sig.push(node[prop]._c);
      } else {
        sig.push(prop);
      }
    }
    sig = sig.join('-');

    let shared = this.suffixes[sig];
    if (shared) {
      return shared;
    }
    this.suffixes[sig] = node;
    node._c = this.cNext++;
    return node;
  },

  prepDFS: function() {
    this.vCur++;
  },

  visited: function(node) {
    if (node._v === this.vCur) {
      return true;
    }
    node._v = this.vCur;
    return false;
  },

  countDegree: function(node) {
    if (node._d === undefined) {
      node._d = 0;
    }
    node._d++;
    if (this.visited(node)) {
      return;
    }
    let props = this.nodeProps(node, true);
    for (let i = 0; i < props.length; i++) {
      this.countDegree(node[props[i]]);
    }
  },

  // Remove intermediate singleton nodes by hoisting into their parent
  collapseChains: function(node) {
    let prop,
      props,
      child,
      i;
    if (this.visited(node)) {
      return;
    }
    props = this.nodeProps(node);
    for (i = 0; i < props.length; i++) {
      prop = props[i];
      child = node[prop];
      if (typeof child !== 'object') {
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
  },

  has: function(word) {
    return this.isFragment(word, this.root);
  },

  isTerminal: function(node) {
    return !!node[''];
  },

  isFragment(word, node) {
    if (word.length === 0) {
      return this.isTerminal(node);
    }

    if (node[word] === 1) {
      return true;
    }

    // Find a prefix of word reference to a child
    let props = this.nodeProps(node, true);
    for (let i = 0; i < props.length; i++) {
      let prop = props[i];
      if (prop === word.slice(0, prop.length)) {
        return this.isFragment(word.slice(prop.length), node[prop]);
      }
    }

    return false;
  },

  // Find highest node in Trie that is on the path to word
  // and that is NOT on the path to other.
  uniqueNode: function(word, other, node) {
    let props = this.nodeProps(node, true);
    for (let i = 0; i < props.length; i++) {
      let prop = props[i];
      if (prop === word.slice(0, prop.length)) {
        if (prop !== other.slice(0, prop.length)) {
          return node[prop];
        }
        return this.uniqueNode(word.slice(prop.length),
          other.slice(prop.length),
          node[prop]);
      }
    }
    return undefined;
  },

  pack: function() {
    return pack(this);
  }
};

},{"../config":1,"./fns":4,"./pack":8}],8:[function(_dereq_,module,exports){
'use strict';
const Histogram = _dereq_('./histogram');
const config = _dereq_('../config');
const encoding = _dereq_('../encoding');

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


const nodeLine = function(self, node) {
  let line = '',
    sep = '';

  if (self.isTerminal(node)) {
    line += config.TERMINAL_PREFIX;
  }

  const props = self.nodeProps(node);
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
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
    let ref = encoding.toAlphaCode(node._n - node[prop]._n - 1 + self.symCount);
    // Large reference to smaller string suffix -> duplicate suffix
    if (node[prop]._g && ref.length >= node[prop]._g.length &&
      node[node[prop]._g] === 1) {
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

const analyzeRefs = function(self, node) {
  if (self.visited(node)) {
    return;
  }
  const props = self.nodeProps(node, true);
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    const ref = node._n - node[prop]._n - 1;
    // Count the number of single-character relative refs
    if (ref < config.BASE) {
      self.histRel.add(ref);
    }
    // Count the number of characters saved by converting an absolute
    // reference to a one-character symbol.
    self.histAbs.add(node[prop]._n, encoding.toAlphaCode(ref).length - 1);
    analyzeRefs(self, node[prop]);
  }
};

const symbolCount = function(self) {
  self.histAbs = self.histAbs.highest(config.BASE);
  let savings = [];
  savings[-1] = 0;
  let best = 0,
    sCount = 0;
  let defSize = 3 + encoding.toAlphaCode(self.nodeCount).length;
  for (let sym = 0; sym < config.BASE; sym++) {
    if (self.histAbs[sym] === undefined) {
      break;
    }
    savings[sym] = self.histAbs[sym][1] - defSize -
    self.histRel.countOf(config.BASE - sym - 1) +
    savings[sym - 1];
    if (savings[sym] >= best) {
      best = savings[sym];
      sCount = sym + 1;
    }
  }
  return sCount;
};

const numberNodes = function(self, node) { // Topological sort into nodes array
  if (node._n !== undefined) {
    return;
  }
  let props = self.nodeProps(node, true);
  for (let i = 0; i < props.length; i++) {
    numberNodes(self, node[props[i]]); //recursive
  }
  node._n = self.pos++;
  self.nodes.unshift(node);
};

const pack = function(self) {
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
  for (let sym = 0; sym < self.symCount; sym++) {
    self.syms[self.histAbs[sym][0]] = encoding.toAlphaCode(sym);
  }
  for (let i = 0; i < self.nodeCount; i++) {
    self.nodes[i] = nodeLine(self, self.nodes[i]);
  }
  // Prepend symbols
  for (let sym = self.symCount - 1; sym >= 0; sym--) {
    self.nodes.unshift(encoding.toAlphaCode(sym) + ':' + encoding.toAlphaCode(self.nodeCount - self.histAbs[sym][0] - 1));
  }

  return self.nodes.join(config.NODE_SEP);
};

module.exports = pack;

},{"../config":1,"../encoding":2,"./histogram":5}],9:[function(_dereq_,module,exports){
'use strict';
const methods = _dereq_('./methods');
/*
 A JavaScript implementation of a Trie search datastructure.
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
const Trie = function(words) {
  this.root = {};
  this.lastWord = '';
  this.suffixes = {};
  this.suffixCounts = {};
  this.cNext = 1;
  this.wordCount = 0;
  this.insertWords(words);
  this.vCur = 0;
};
Object.keys(methods).forEach(function(k) {
  Trie.prototype[k] = methods[k];
});
module.exports = Trie;

},{"./methods":7}],10:[function(_dereq_,module,exports){
'use strict';
const Ptrie = _dereq_('./ptrie');

module.exports = function(str) {
  return new Ptrie(str);
};

},{"./ptrie":13}],11:[function(_dereq_,module,exports){
'use strict';
const encoding = _dereq_('../encoding');
const isPrefix = _dereq_('./prefix');
const unravel = _dereq_('./unravel');

const methods = {
  // Return largest matching string in the dictionary (or '')
  has: function(want) {
    //fail-fast
    if (!want) {
      return false;
    }
    //then, try cache-lookup
    if (this._cache) {
      return this._cache[want] || false;
    }
    let self = this;
    const crawl = function(index, prefix) {
      let node = self.nodes[index];
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
      const matches = node.split(/([A-Z0-9,]+)/g);
      for (let i = 0; i < matches.length; i += 2) {
        const str = matches[i];
        const ref = matches[i + 1];
        if (!str) {
          continue;
        }
        const have = prefix + str;
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
  indexFromRef: function(ref, index) {
    const dnode = encoding.fromAlphaCode(ref);
    if (dnode < this.symCount) {
      return this.syms[dnode];
    }
    return index + dnode + 1 - this.symCount;
  },

  toArray: function() {
    return Object.keys(this.toObject());
  },

  toObject: function() {
    if (this._cache) {
      return this._cache;
    }
    return unravel(this);
  },

  cache: function() {
    this._cache = unravel(this);
    this.nodes = null;
    this.syms = null;
  }
};
module.exports = methods;

},{"../encoding":2,"./prefix":12,"./unravel":15}],12:[function(_dereq_,module,exports){
'use strict';
//are we on the right path with this string?
module.exports = function(str, want) {
  //allow perfect equals
  if (str === want) {
    return true;
  }
  //compare lengths
  let len = str.length;
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

},{}],13:[function(_dereq_,module,exports){
'use strict';
const parseSymbols = _dereq_('./symbols');
const methods = _dereq_('./methods');

//PackedTrie - Trie traversal of the Trie packed-string representation.
const PackedTrie = function(str) {
  this.nodes = str.split(';'); //that's all ;)!
  this.syms = [];
  this.symCount = 0;
  this._cache = null;
  //process symbols, if they have them
  if (str.match(':')) {
    parseSymbols(this);
  }
};

Object.keys(methods).forEach(function(k) {
  PackedTrie.prototype[k] = methods[k];
});

module.exports = PackedTrie;

},{"./methods":11,"./symbols":14}],14:[function(_dereq_,module,exports){
'use strict';
const encoding = _dereq_('../encoding');

//the symbols are at the top of the array.
module.exports = function(t) {
  //... process these lines
  const reSymbol = new RegExp('([0-9A-Z]+):([0-9A-Z]+)');
  for(let i = 0; i < t.nodes.length; i++) {
    const m = reSymbol.exec(t.nodes[i]);
    if (!m) {
      t.symCount = i;
      break;
    }
    t.syms[encoding.fromAlphaCode(m[1])] = encoding.fromAlphaCode(m[2]);
  }
  //remove from main node list
  t.nodes = t.nodes.slice(t.symCount, t.nodes.length);
};

},{"../encoding":2}],15:[function(_dereq_,module,exports){
'use strict';
//spin-out all words from this trie
module.exports = function(trie) {
  let all = {};
  const crawl = function(index, pref) {
    let node = trie.nodes[index];
    if (node[0] === '!') {
      all[pref] = true;
      node = node.slice(1); //ok, we tried. remove it.
    }
    let matches = node.split(/([A-Z0-9,]+)/g);
    for (let i = 0; i < matches.length; i += 2) {
      let str = matches[i];
      let ref = matches[i + 1];
      if (!str) {
        continue;
      }

      let have = pref + str;
      //branch's end
      if (ref === ',' || ref === undefined) {
        all[have] = true;
        continue;
      }
      let newIndex = trie.indexFromRef(ref, index);
      crawl(newIndex, have);
    }
  };
  crawl(0, '');
  return all;
};

},{}]},{},[3])(3)
});(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.efrt = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
module.exports = {
  NODE_SEP: ';',
  STRING_SEP: ',',
  TERMINAL_PREFIX: '!',
  //characters banned from entering the trie
  NOT_ALLOWED: new RegExp('[0-9A-Z,;!]'),
  BASE: 36,
};

},{}],2:[function(_dereq_,module,exports){
'use strict';
const BASE = 36;

const seq = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const cache = seq.split('').reduce(function(h, c, i) {
  h[c] = i;
  return h;
}, {});

// 0, 1, 2, ..., A, B, C, ..., 00, 01, ... AA, AB, AC, ..., AAA, AAB, ...
const toAlphaCode = function(n) {
  if (seq[n] !== undefined) {
    return seq[n];
  }
  let places = 1;
  let range = BASE;
  let s = '';

  for (; n >= range; n -= range, places++, range *= BASE) {
  }
  while (places--) {
    const d = n % BASE;
    s = String.fromCharCode((d < 10 ? 48 : 55) + d) + s;
    n = (n - d) / BASE;
  }
  return s;
};


const fromAlphaCode = function(s) {
  if (cache[s] !== undefined) {
    return cache[s];
  }
  let n = 0;
  let places = 1;
  let range = BASE;
  let pow = 1;

  for (; places < s.length; n += range, places++, range *= BASE) {
  }
  for (let i = s.length - 1; i >= 0; i--, pow *= BASE) {
    let d = s.charCodeAt(i) - 48;
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

},{}],3:[function(_dereq_,module,exports){
(function (global){
'use strict';
const efrt = {
  pack: _dereq_('./pack/index'),
  unpack: _dereq_('./unpack/index')
};

//and then all-the-exports...
if (typeof self !== 'undefined') {
  self.efrt = efrt; // Web Worker
} else if (typeof window !== 'undefined') {
  window.efrt = efrt; // Browser
} else if (typeof global !== 'undefined') {
  global.efrt = efrt; // NodeJS
}
//don't forget amd!
if (typeof define === 'function' && define.amd) {
  define(efrt);
}
//then for some reason, do this too!
if (typeof module !== 'undefined') {
  module.exports = efrt;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./pack/index":6,"./unpack/index":10}],4:[function(_dereq_,module,exports){
'use strict';

const commonPrefix = function(w1, w2) {
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

/* Sort elements and remove duplicates from array (modified in place) */
const unique = function(a) {
  a.sort();
  for (let i = 1; i < a.length; i++) {
    if (a[i - 1] === a[i]) {
      a.splice(i, 1);
    }
  }
};

module.exports = {
  commonPrefix: commonPrefix,
  unique: unique
};

},{}],5:[function(_dereq_,module,exports){
'use strict';

class Histogram {
  constructor() {
    this.counts = {};
  }
  init(sym) {
    if (this.counts[sym] === undefined) {
      this.counts[sym] = 0;
    }
  }
  add(sym, n) {
    if (n === undefined) {
      n = 1;
    }
    this.init(sym);
    this.counts[sym] += n;
  }
  change(symNew, symOld, n) {
    if (n === undefined) {
      n = 1;
    }
    this.add(symOld, -n);
    this.add(symNew, n);
  }
  countOf(sym) {
    this.init(sym);
    return this.counts[sym];
  }
  highest(top) {
    let sorted = [];
    let keys = Object.keys(this.counts);
    for (let i = 0; i < keys.length; i++) {
      let sym = keys[i];
      sorted.push([sym, this.counts[sym]]);
    }
    sorted.sort(function(a, b) {
      return b[1] - a[1];
    });
    if (top) {
      sorted = sorted.slice(0, top);
    }
    return sorted;
  }
}
module.exports = Histogram;

},{}],6:[function(_dereq_,module,exports){
'use strict';
const Trie = _dereq_('./trie');

//turn an array into a compressed string
const pack = function(arr) {
  let t = new Trie(arr);
  return t.pack();
};
module.exports = pack;

},{"./trie":9}],7:[function(_dereq_,module,exports){
const fns = _dereq_('./fns');
const pack = _dereq_('./pack');
const config = _dereq_('../config');

module.exports = {
  // Insert words from one big string, or from an array.
  insertWords: function(words) {
    if (words === undefined) {
      return;
    }
    if (typeof words === 'string') {
      words = words.split(/[^a-zA-Z]+/);
    }
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i].toLowerCase();
    }
    fns.unique(words);
    for (let i = 0; i < words.length; i++) {
      if (words[i].match(config.NOT_ALLOWED) === null) {
        this.insert(words[i]);
      }
    }
  },

  insert: function(word) {
    this._insert(word, this.root);
    let lastWord = this.lastWord;
    this.lastWord = word;

    let prefix = fns.commonPrefix(word, lastWord);
    if (prefix === lastWord) {
      return;
    }

    let freeze = this.uniqueNode(lastWord, word, this.root);
    if (freeze) {
      this.combineSuffixNode(freeze);
    }
  },

  _insert: function(word, node) {
    let prefix,
      next;

    // Duplicate word entry - ignore
    if (word.length === 0) {
      return;
    }

    // Do any existing props share a common prefix?
    let keys = Object.keys(node);
    for(let i = 0; i < keys.length; i++) {
      let prop = keys[i];
      prefix = fns.commonPrefix(word, prop);
      if (prefix.length === 0) {
        continue;
      }
      // Prop is a proper prefix - recurse to child node
      if (prop === prefix && typeof node[prop] === 'object') {
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
  },

  // Add a terminal string to node.
  // If 2 characters or less, just add with value == 1.
  // If more than 2 characters, point to shared node
  // Note - don't prematurely share suffixes - these
  // terminals may become split and joined with other
  // nodes in this part of the tree.
  addTerminal: function(node, prop) {
    if (prop.length <= 1) {
      node[prop] = 1;
      return;
    }
    let next = {};
    node[prop[0]] = next;
    this.addTerminal(next, prop.slice(1));
  },

  // Well ordered list of properties in a node (string or object properties)
  // Use nodesOnly==true to return only properties of child nodes (not
  // terminal strings.
  nodeProps: function(node, nodesOnly) {
    let props = [];
    for (let prop in node) {
      if (prop !== '' && prop[0] !== '_') {
        if (!nodesOnly || typeof node[prop] === 'object') {
          props.push(prop);
        }
      }
    }
    props.sort();
    return props;
  },

  optimize: function() {
    this.combineSuffixNode(this.root);
    this.prepDFS();
    this.countDegree(this.root);
    this.prepDFS();
    this.collapseChains(this.root);
  },

  // Convert Trie to a DAWG by sharing identical nodes
  combineSuffixNode: function(node) {
    // Frozen node - can't change.
    if (node._c) {
      return node;
    }
    // Make sure all children are combined and generate unique node
    // signature for this node.
    let sig = [];
    if (this.isTerminal(node)) {
      sig.push('!');
    }
    let props = this.nodeProps(node);
    for (let i = 0; i < props.length; i++) {
      let prop = props[i];
      if (typeof node[prop] === 'object') {
        node[prop] = this.combineSuffixNode(node[prop]);
        sig.push(prop);
        sig.push(node[prop]._c);
      } else {
        sig.push(prop);
      }
    }
    sig = sig.join('-');

    let shared = this.suffixes[sig];
    if (shared) {
      return shared;
    }
    this.suffixes[sig] = node;
    node._c = this.cNext++;
    return node;
  },

  prepDFS: function() {
    this.vCur++;
  },

  visited: function(node) {
    if (node._v === this.vCur) {
      return true;
    }
    node._v = this.vCur;
    return false;
  },

  countDegree: function(node) {
    if (node._d === undefined) {
      node._d = 0;
    }
    node._d++;
    if (this.visited(node)) {
      return;
    }
    let props = this.nodeProps(node, true);
    for (let i = 0; i < props.length; i++) {
      this.countDegree(node[props[i]]);
    }
  },

  // Remove intermediate singleton nodes by hoisting into their parent
  collapseChains: function(node) {
    let prop,
      props,
      child,
      i;
    if (this.visited(node)) {
      return;
    }
    props = this.nodeProps(node);
    for (i = 0; i < props.length; i++) {
      prop = props[i];
      child = node[prop];
      if (typeof child !== 'object') {
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
  },

  has: function(word) {
    return this.isFragment(word, this.root);
  },

  isTerminal: function(node) {
    return !!node[''];
  },

  isFragment(word, node) {
    if (word.length === 0) {
      return this.isTerminal(node);
    }

    if (node[word] === 1) {
      return true;
    }

    // Find a prefix of word reference to a child
    let props = this.nodeProps(node, true);
    for (let i = 0; i < props.length; i++) {
      let prop = props[i];
      if (prop === word.slice(0, prop.length)) {
        return this.isFragment(word.slice(prop.length), node[prop]);
      }
    }

    return false;
  },

  // Find highest node in Trie that is on the path to word
  // and that is NOT on the path to other.
  uniqueNode: function(word, other, node) {
    let props = this.nodeProps(node, true);
    for (let i = 0; i < props.length; i++) {
      let prop = props[i];
      if (prop === word.slice(0, prop.length)) {
        if (prop !== other.slice(0, prop.length)) {
          return node[prop];
        }
        return this.uniqueNode(word.slice(prop.length),
          other.slice(prop.length),
          node[prop]);
      }
    }
    return undefined;
  },

  pack: function() {
    return pack(this);
  }
};

},{"../config":1,"./fns":4,"./pack":8}],8:[function(_dereq_,module,exports){
'use strict';
const Histogram = _dereq_('./histogram');
const config = _dereq_('../config');
const encoding = _dereq_('../encoding');

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


const nodeLine = function(self, node) {
  let line = '',
    sep = '';

  if (self.isTerminal(node)) {
    line += config.TERMINAL_PREFIX;
  }

  const props = self.nodeProps(node);
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
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
    let ref = encoding.toAlphaCode(node._n - node[prop]._n - 1 + self.symCount);
    // Large reference to smaller string suffix -> duplicate suffix
    if (node[prop]._g && ref.length >= node[prop]._g.length &&
      node[node[prop]._g] === 1) {
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

const analyzeRefs = function(self, node) {
  if (self.visited(node)) {
    return;
  }
  const props = self.nodeProps(node, true);
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    const ref = node._n - node[prop]._n - 1;
    // Count the number of single-character relative refs
    if (ref < config.BASE) {
      self.histRel.add(ref);
    }
    // Count the number of characters saved by converting an absolute
    // reference to a one-character symbol.
    self.histAbs.add(node[prop]._n, encoding.toAlphaCode(ref).length - 1);
    analyzeRefs(self, node[prop]);
  }
};

const symbolCount = function(self) {
  self.histAbs = self.histAbs.highest(config.BASE);
  let savings = [];
  savings[-1] = 0;
  let best = 0,
    sCount = 0;
  let defSize = 3 + encoding.toAlphaCode(self.nodeCount).length;
  for (let sym = 0; sym < config.BASE; sym++) {
    if (self.histAbs[sym] === undefined) {
      break;
    }
    savings[sym] = self.histAbs[sym][1] - defSize -
    self.histRel.countOf(config.BASE - sym - 1) +
    savings[sym - 1];
    if (savings[sym] >= best) {
      best = savings[sym];
      sCount = sym + 1;
    }
  }
  return sCount;
};

const numberNodes = function(self, node) { // Topological sort into nodes array
  if (node._n !== undefined) {
    return;
  }
  let props = self.nodeProps(node, true);
  for (let i = 0; i < props.length; i++) {
    numberNodes(self, node[props[i]]); //recursive
  }
  node._n = self.pos++;
  self.nodes.unshift(node);
};

const pack = function(self) {
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
  for (let sym = 0; sym < self.symCount; sym++) {
    self.syms[self.histAbs[sym][0]] = encoding.toAlphaCode(sym);
  }
  for (let i = 0; i < self.nodeCount; i++) {
    self.nodes[i] = nodeLine(self, self.nodes[i]);
  }
  // Prepend symbols
  for (let sym = self.symCount - 1; sym >= 0; sym--) {
    self.nodes.unshift(encoding.toAlphaCode(sym) + ':' + encoding.toAlphaCode(self.nodeCount - self.histAbs[sym][0] - 1));
  }

  return self.nodes.join(config.NODE_SEP);
};

module.exports = pack;

},{"../config":1,"../encoding":2,"./histogram":5}],9:[function(_dereq_,module,exports){
'use strict';
const methods = _dereq_('./methods');
/*
 A JavaScript implementation of a Trie search datastructure.
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
const Trie = function(words) {
  this.root = {};
  this.lastWord = '';
  this.suffixes = {};
  this.suffixCounts = {};
  this.cNext = 1;
  this.wordCount = 0;
  this.insertWords(words);
  this.vCur = 0;
};
Object.keys(methods).forEach(function(k) {
  Trie.prototype[k] = methods[k];
});
module.exports = Trie;

},{"./methods":7}],10:[function(_dereq_,module,exports){
'use strict';
const Ptrie = _dereq_('./ptrie');

module.exports = function(str) {
  return new Ptrie(str);
};

},{"./ptrie":13}],11:[function(_dereq_,module,exports){
'use strict';
const encoding = _dereq_('../encoding');
const isPrefix = _dereq_('./prefix');
const unravel = _dereq_('./unravel');

const methods = {
  // Return largest matching string in the dictionary (or '')
  has: function(want) {
    //fail-fast
    if (!want) {
      return false;
    }
    //then, try cache-lookup
    if (this._cache) {
      return this._cache[want] || false;
    }
    let self = this;
    const crawl = function(index, prefix) {
      let node = self.nodes[index];
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
      const matches = node.split(/([A-Z0-9,]+)/g);
      for (let i = 0; i < matches.length; i += 2) {
        const str = matches[i];
        const ref = matches[i + 1];
        if (!str) {
          continue;
        }
        const have = prefix + str;
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
  indexFromRef: function(ref, index) {
    const dnode = encoding.fromAlphaCode(ref);
    if (dnode < this.symCount) {
      return this.syms[dnode];
    }
    return index + dnode + 1 - this.symCount;
  },

  toArray: function() {
    return Object.keys(this.toObject());
  },

  toObject: function() {
    if (this._cache) {
      return this._cache;
    }
    return unravel(this);
  },

  cache: function() {
    this._cache = unravel(this);
    this.nodes = null;
    this.syms = null;
  }
};
module.exports = methods;

},{"../encoding":2,"./prefix":12,"./unravel":15}],12:[function(_dereq_,module,exports){
'use strict';
//are we on the right path with this string?
module.exports = function(str, want) {
  //allow perfect equals
  if (str === want) {
    return true;
  }
  //compare lengths
  let len = str.length;
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

},{}],13:[function(_dereq_,module,exports){
'use strict';
const parseSymbols = _dereq_('./symbols');
const methods = _dereq_('./methods');

//PackedTrie - Trie traversal of the Trie packed-string representation.
const PackedTrie = function(str) {
  this.nodes = str.split(';'); //that's all ;)!
  this.syms = [];
  this.symCount = 0;
  this._cache = null;
  //process symbols, if they have them
  if (str.match(':')) {
    parseSymbols(this);
  }
};

Object.keys(methods).forEach(function(k) {
  PackedTrie.prototype[k] = methods[k];
});

module.exports = PackedTrie;

},{"./methods":11,"./symbols":14}],14:[function(_dereq_,module,exports){
'use strict';
const encoding = _dereq_('../encoding');

//the symbols are at the top of the array.
module.exports = function(t) {
  //... process these lines
  const reSymbol = new RegExp('([0-9A-Z]+):([0-9A-Z]+)');
  for(let i = 0; i < t.nodes.length; i++) {
    const m = reSymbol.exec(t.nodes[i]);
    if (!m) {
      t.symCount = i;
      break;
    }
    t.syms[encoding.fromAlphaCode(m[1])] = encoding.fromAlphaCode(m[2]);
  }
  //remove from main node list
  t.nodes = t.nodes.slice(t.symCount, t.nodes.length);
};

},{"../encoding":2}],15:[function(_dereq_,module,exports){
'use strict';
//spin-out all words from this trie
module.exports = function(trie) {
  let all = {};
  const crawl = function(index, pref) {
    let node = trie.nodes[index];
    if (node[0] === '!') {
      all[pref] = true;
      node = node.slice(1); //ok, we tried. remove it.
    }
    let matches = node.split(/([A-Z0-9,]+)/g);
    for (let i = 0; i < matches.length; i += 2) {
      let str = matches[i];
      let ref = matches[i + 1];
      if (!str) {
        continue;
      }

      let have = pref + str;
      //branch's end
      if (ref === ',' || ref === undefined) {
        all[have] = true;
        continue;
      }
      let newIndex = trie.indexFromRef(ref, index);
      crawl(newIndex, have);
    }
  };
  crawl(0, '');
  return all;
};

},{}]},{},[3])(3)
});(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.efrt = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
module.exports = {
  NODE_SEP: ';',
  STRING_SEP: ',',
  TERMINAL_PREFIX: '!',
  //characters banned from entering the trie
  NOT_ALLOWED: new RegExp('[0-9A-Z,;!]'),
  BASE: 36,
};

},{}],2:[function(_dereq_,module,exports){
'use strict';
const BASE = 36;

const seq = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const cache = seq.split('').reduce(function(h, c, i) {
  h[c] = i;
  return h;
}, {});

// 0, 1, 2, ..., A, B, C, ..., 00, 01, ... AA, AB, AC, ..., AAA, AAB, ...
const toAlphaCode = function(n) {
  if (seq[n] !== undefined) {
    return seq[n];
  }
  let places = 1;
  let range = BASE;
  let s = '';

  for (; n >= range; n -= range, places++, range *= BASE) {
  }
  while (places--) {
    const d = n % BASE;
    s = String.fromCharCode((d < 10 ? 48 : 55) + d) + s;
    n = (n - d) / BASE;
  }
  return s;
};


const fromAlphaCode = function(s) {
  if (cache[s] !== undefined) {
    return cache[s];
  }
  let n = 0;
  let places = 1;
  let range = BASE;
  let pow = 1;

  for (; places < s.length; n += range, places++, range *= BASE) {
  }
  for (let i = s.length - 1; i >= 0; i--, pow *= BASE) {
    let d = s.charCodeAt(i) - 48;
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

},{}],3:[function(_dereq_,module,exports){
(function (global){
'use strict';
const efrt = {
  pack: _dereq_('./pack/index'),
  unpack: _dereq_('./unpack/index')
};

//and then all-the-exports...
if (typeof self !== 'undefined') {
  self.efrt = efrt; // Web Worker
} else if (typeof window !== 'undefined') {
  window.efrt = efrt; // Browser
} else if (typeof global !== 'undefined') {
  global.efrt = efrt; // NodeJS
}
//don't forget amd!
if (typeof define === 'function' && define.amd) {
  define(efrt);
}
//then for some reason, do this too!
if (typeof module !== 'undefined') {
  module.exports = efrt;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./pack/index":6,"./unpack/index":10}],4:[function(_dereq_,module,exports){
'use strict';

const commonPrefix = function(w1, w2) {
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

/* Sort elements and remove duplicates from array (modified in place) */
const unique = function(a) {
  a.sort();
  for (let i = 1; i < a.length; i++) {
    if (a[i - 1] === a[i]) {
      a.splice(i, 1);
    }
  }
};

module.exports = {
  commonPrefix: commonPrefix,
  unique: unique
};

},{}],5:[function(_dereq_,module,exports){
'use strict';

class Histogram {
  constructor() {
    this.counts = {};
  }
  init(sym) {
    if (this.counts[sym] === undefined) {
      this.counts[sym] = 0;
    }
  }
  add(sym, n) {
    if (n === undefined) {
      n = 1;
    }
    this.init(sym);
    this.counts[sym] += n;
  }
  change(symNew, symOld, n) {
    if (n === undefined) {
      n = 1;
    }
    this.add(symOld, -n);
    this.add(symNew, n);
  }
  countOf(sym) {
    this.init(sym);
    return this.counts[sym];
  }
  highest(top) {
    let sorted = [];
    let keys = Object.keys(this.counts);
    for (let i = 0; i < keys.length; i++) {
      let sym = keys[i];
      sorted.push([sym, this.counts[sym]]);
    }
    sorted.sort(function(a, b) {
      return b[1] - a[1];
    });
    if (top) {
      sorted = sorted.slice(0, top);
    }
    return sorted;
  }
}
module.exports = Histogram;

},{}],6:[function(_dereq_,module,exports){
'use strict';
const Trie = _dereq_('./trie');

//turn an array into a compressed string
const pack = function(arr) {
  let t = new Trie(arr);
  return t.pack();
};
module.exports = pack;

},{"./trie":9}],7:[function(_dereq_,module,exports){
const fns = _dereq_('./fns');
const pack = _dereq_('./pack');
const config = _dereq_('../config');

module.exports = {
  // Insert words from one big string, or from an array.
  insertWords: function(words) {
    if (words === undefined) {
      return;
    }
    if (typeof words === 'string') {
      words = words.split(/[^a-zA-Z]+/);
    }
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i].toLowerCase();
    }
    fns.unique(words);
    for (let i = 0; i < words.length; i++) {
      if (words[i].match(config.NOT_ALLOWED) === null) {
        this.insert(words[i]);
      }
    }
  },

  insert: function(word) {
    this._insert(word, this.root);
    let lastWord = this.lastWord;
    this.lastWord = word;

    let prefix = fns.commonPrefix(word, lastWord);
    if (prefix === lastWord) {
      return;
    }

    let freeze = this.uniqueNode(lastWord, word, this.root);
    if (freeze) {
      this.combineSuffixNode(freeze);
    }
  },

  _insert: function(word, node) {
    let prefix,
      next;

    // Duplicate word entry - ignore
    if (word.length === 0) {
      return;
    }

    // Do any existing props share a common prefix?
    let keys = Object.keys(node);
    for(let i = 0; i < keys.length; i++) {
      let prop = keys[i];
      prefix = fns.commonPrefix(word, prop);
      if (prefix.length === 0) {
        continue;
      }
      // Prop is a proper prefix - recurse to child node
      if (prop === prefix && typeof node[prop] === 'object') {
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
  },

  // Add a terminal string to node.
  // If 2 characters or less, just add with value == 1.
  // If more than 2 characters, point to shared node
  // Note - don't prematurely share suffixes - these
  // terminals may become split and joined with other
  // nodes in this part of the tree.
  addTerminal: function(node, prop) {
    if (prop.length <= 1) {
      node[prop] = 1;
      return;
    }
    let next = {};
    node[prop[0]] = next;
    this.addTerminal(next, prop.slice(1));
  },

  // Well ordered list of properties in a node (string or object properties)
  // Use nodesOnly==true to return only properties of child nodes (not
  // terminal strings.
  nodeProps: function(node, nodesOnly) {
    let props = [];
    for (let prop in node) {
      if (prop !== '' && prop[0] !== '_') {
        if (!nodesOnly || typeof node[prop] === 'object') {
          props.push(prop);
        }
      }
    }
    props.sort();
    return props;
  },

  optimize: function() {
    this.combineSuffixNode(this.root);
    this.prepDFS();
    this.countDegree(this.root);
    this.prepDFS();
    this.collapseChains(this.root);
  },

  // Convert Trie to a DAWG by sharing identical nodes
  combineSuffixNode: function(node) {
    // Frozen node - can't change.
    if (node._c) {
      return node;
    }
    // Make sure all children are combined and generate unique node
    // signature for this node.
    let sig = [];
    if (this.isTerminal(node)) {
      sig.push('!');
    }
    let props = this.nodeProps(node);
    for (let i = 0; i < props.length; i++) {
      let prop = props[i];
      if (typeof node[prop] === 'object') {
        node[prop] = this.combineSuffixNode(node[prop]);
        sig.push(prop);
        sig.push(node[prop]._c);
      } else {
        sig.push(prop);
      }
    }
    sig = sig.join('-');

    let shared = this.suffixes[sig];
    if (shared) {
      return shared;
    }
    this.suffixes[sig] = node;
    node._c = this.cNext++;
    return node;
  },

  prepDFS: function() {
    this.vCur++;
  },

  visited: function(node) {
    if (node._v === this.vCur) {
      return true;
    }
    node._v = this.vCur;
    return false;
  },

  countDegree: function(node) {
    if (node._d === undefined) {
      node._d = 0;
    }
    node._d++;
    if (this.visited(node)) {
      return;
    }
    let props = this.nodeProps(node, true);
    for (let i = 0; i < props.length; i++) {
      this.countDegree(node[props[i]]);
    }
  },

  // Remove intermediate singleton nodes by hoisting into their parent
  collapseChains: function(node) {
    let prop,
      props,
      child,
      i;
    if (this.visited(node)) {
      return;
    }
    props = this.nodeProps(node);
    for (i = 0; i < props.length; i++) {
      prop = props[i];
      child = node[prop];
      if (typeof child !== 'object') {
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
  },

  has: function(word) {
    return this.isFragment(word, this.root);
  },

  isTerminal: function(node) {
    return !!node[''];
  },

  isFragment(word, node) {
    if (word.length === 0) {
      return this.isTerminal(node);
    }

    if (node[word] === 1) {
      return true;
    }

    // Find a prefix of word reference to a child
    let props = this.nodeProps(node, true);
    for (let i = 0; i < props.length; i++) {
      let prop = props[i];
      if (prop === word.slice(0, prop.length)) {
        return this.isFragment(word.slice(prop.length), node[prop]);
      }
    }

    return false;
  },

  // Find highest node in Trie that is on the path to word
  // and that is NOT on the path to other.
  uniqueNode: function(word, other, node) {
    let props = this.nodeProps(node, true);
    for (let i = 0; i < props.length; i++) {
      let prop = props[i];
      if (prop === word.slice(0, prop.length)) {
        if (prop !== other.slice(0, prop.length)) {
          return node[prop];
        }
        return this.uniqueNode(word.slice(prop.length),
          other.slice(prop.length),
          node[prop]);
      }
    }
    return undefined;
  },

  pack: function() {
    return pack(this);
  }
};

},{"../config":1,"./fns":4,"./pack":8}],8:[function(_dereq_,module,exports){
'use strict';
const Histogram = _dereq_('./histogram');
const config = _dereq_('../config');
const encoding = _dereq_('../encoding');

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


const nodeLine = function(self, node) {
  let line = '',
    sep = '';

  if (self.isTerminal(node)) {
    line += config.TERMINAL_PREFIX;
  }

  const props = self.nodeProps(node);
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
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
    let ref = encoding.toAlphaCode(node._n - node[prop]._n - 1 + self.symCount);
    // Large reference to smaller string suffix -> duplicate suffix
    if (node[prop]._g && ref.length >= node[prop]._g.length &&
      node[node[prop]._g] === 1) {
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

const analyzeRefs = function(self, node) {
  if (self.visited(node)) {
    return;
  }
  const props = self.nodeProps(node, true);
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    const ref = node._n - node[prop]._n - 1;
    // Count the number of single-character relative refs
    if (ref < config.BASE) {
      self.histRel.add(ref);
    }
    // Count the number of characters saved by converting an absolute
    // reference to a one-character symbol.
    self.histAbs.add(node[prop]._n, encoding.toAlphaCode(ref).length - 1);
    analyzeRefs(self, node[prop]);
  }
};

const symbolCount = function(self) {
  self.histAbs = self.histAbs.highest(config.BASE);
  let savings = [];
  savings[-1] = 0;
  let best = 0,
    sCount = 0;
  let defSize = 3 + encoding.toAlphaCode(self.nodeCount).length;
  for (let sym = 0; sym < config.BASE; sym++) {
    if (self.histAbs[sym] === undefined) {
      break;
    }
    savings[sym] = self.histAbs[sym][1] - defSize -
    self.histRel.countOf(config.BASE - sym - 1) +
    savings[sym - 1];
    if (savings[sym] >= best) {
      best = savings[sym];
      sCount = sym + 1;
    }
  }
  return sCount;
};

const numberNodes = function(self, node) { // Topological sort into nodes array
  if (node._n !== undefined) {
    return;
  }
  let props = self.nodeProps(node, true);
  for (let i = 0; i < props.length; i++) {
    numberNodes(self, node[props[i]]); //recursive
  }
  node._n = self.pos++;
  self.nodes.unshift(node);
};

const pack = function(self) {
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
  for (let sym = 0; sym < self.symCount; sym++) {
    self.syms[self.histAbs[sym][0]] = encoding.toAlphaCode(sym);
  }
  for (let i = 0; i < self.nodeCount; i++) {
    self.nodes[i] = nodeLine(self, self.nodes[i]);
  }
  // Prepend symbols
  for (let sym = self.symCount - 1; sym >= 0; sym--) {
    self.nodes.unshift(encoding.toAlphaCode(sym) + ':' + encoding.toAlphaCode(self.nodeCount - self.histAbs[sym][0] - 1));
  }

  return self.nodes.join(config.NODE_SEP);
};

module.exports = pack;

},{"../config":1,"../encoding":2,"./histogram":5}],9:[function(_dereq_,module,exports){
'use strict';
const methods = _dereq_('./methods');
/*
 A JavaScript implementation of a Trie search datastructure.
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
const Trie = function(words) {
  this.root = {};
  this.lastWord = '';
  this.suffixes = {};
  this.suffixCounts = {};
  this.cNext = 1;
  this.wordCount = 0;
  this.insertWords(words);
  this.vCur = 0;
};
Object.keys(methods).forEach(function(k) {
  Trie.prototype[k] = methods[k];
});
module.exports = Trie;

},{"./methods":7}],10:[function(_dereq_,module,exports){
'use strict';
const Ptrie = _dereq_('./ptrie');

module.exports = function(str) {
  return new Ptrie(str);
};

},{"./ptrie":13}],11:[function(_dereq_,module,exports){
'use strict';
const encoding = _dereq_('../encoding');
const isPrefix = _dereq_('./prefix');
const unravel = _dereq_('./unravel');

const methods = {
  // Return largest matching string in the dictionary (or '')
  has: function(want) {
    //fail-fast
    if (!want) {
      return false;
    }
    //then, try cache-lookup
    if (this._cache) {
      return this._cache[want] || false;
    }
    let self = this;
    const crawl = function(index, prefix) {
      let node = self.nodes[index];
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
      const matches = node.split(/([A-Z0-9,]+)/g);
      for (let i = 0; i < matches.length; i += 2) {
        const str = matches[i];
        const ref = matches[i + 1];
        if (!str) {
          continue;
        }
        const have = prefix + str;
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
  indexFromRef: function(ref, index) {
    const dnode = encoding.fromAlphaCode(ref);
    if (dnode < this.symCount) {
      return this.syms[dnode];
    }
    return index + dnode + 1 - this.symCount;
  },

  toArray: function() {
    return Object.keys(this.toObject());
  },

  toObject: function() {
    if (this._cache) {
      return this._cache;
    }
    return unravel(this);
  },

  cache: function() {
    this._cache = unravel(this);
    this.nodes = null;
    this.syms = null;
  }
};
module.exports = methods;

},{"../encoding":2,"./prefix":12,"./unravel":15}],12:[function(_dereq_,module,exports){
'use strict';
//are we on the right path with this string?
module.exports = function(str, want) {
  //allow perfect equals
  if (str === want) {
    return true;
  }
  //compare lengths
  let len = str.length;
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

},{}],13:[function(_dereq_,module,exports){
'use strict';
const parseSymbols = _dereq_('./symbols');
const methods = _dereq_('./methods');

//PackedTrie - Trie traversal of the Trie packed-string representation.
const PackedTrie = function(str) {
  this.nodes = str.split(';'); //that's all ;)!
  this.syms = [];
  this.symCount = 0;
  this._cache = null;
  //process symbols, if they have them
  if (str.match(':')) {
    parseSymbols(this);
  }
};

Object.keys(methods).forEach(function(k) {
  PackedTrie.prototype[k] = methods[k];
});

module.exports = PackedTrie;

},{"./methods":11,"./symbols":14}],14:[function(_dereq_,module,exports){
'use strict';
const encoding = _dereq_('../encoding');

//the symbols are at the top of the array.
module.exports = function(t) {
  //... process these lines
  const reSymbol = new RegExp('([0-9A-Z]+):([0-9A-Z]+)');
  for(let i = 0; i < t.nodes.length; i++) {
    const m = reSymbol.exec(t.nodes[i]);
    if (!m) {
      t.symCount = i;
      break;
    }
    t.syms[encoding.fromAlphaCode(m[1])] = encoding.fromAlphaCode(m[2]);
  }
  //remove from main node list
  t.nodes = t.nodes.slice(t.symCount, t.nodes.length);
};

},{"../encoding":2}],15:[function(_dereq_,module,exports){
'use strict';
//spin-out all words from this trie
module.exports = function(trie) {
  let all = {};
  const crawl = function(index, pref) {
    let node = trie.nodes[index];
    if (node[0] === '!') {
      all[pref] = true;
      node = node.slice(1); //ok, we tried. remove it.
    }
    let matches = node.split(/([A-Z0-9,]+)/g);
    for (let i = 0; i < matches.length; i += 2) {
      let str = matches[i];
      let ref = matches[i + 1];
      if (!str) {
        continue;
      }

      let have = pref + str;
      //branch's end
      if (ref === ',' || ref === undefined) {
        all[have] = true;
        continue;
      }
      let newIndex = trie.indexFromRef(ref, index);
      crawl(newIndex, have);
    }
  };
  crawl(0, '');
  return all;
};

},{}]},{},[3])(3)
});(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.efrt = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
module.exports = {
  NODE_SEP: ';',
  STRING_SEP: ',',
  TERMINAL_PREFIX: '!',
  //characters banned from entering the trie
  NOT_ALLOWED: new RegExp('[0-9A-Z,;!]'),
  BASE: 36,
};

},{}],2:[function(_dereq_,module,exports){
'use strict';
const BASE = 36;

const seq = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const cache = seq.split('').reduce(function(h, c, i) {
  h[c] = i;
  return h;
}, {});

// 0, 1, 2, ..., A, B, C, ..., 00, 01, ... AA, AB, AC, ..., AAA, AAB, ...
const toAlphaCode = function(n) {
  if (seq[n] !== undefined) {
    return seq[n];
  }
  let places = 1;
  let range = BASE;
  let s = '';

  for (; n >= range; n -= range, places++, range *= BASE) {
  }
  while (places--) {
    const d = n % BASE;
    s = String.fromCharCode((d < 10 ? 48 : 55) + d) + s;
    n = (n - d) / BASE;
  }
  return s;
};


const fromAlphaCode = function(s) {
  if (cache[s] !== undefined) {
    return cache[s];
  }
  let n = 0;
  let places = 1;
  let range = BASE;
  let pow = 1;

  for (; places < s.length; n += range, places++, range *= BASE) {
  }
  for (let i = s.length - 1; i >= 0; i--, pow *= BASE) {
    let d = s.charCodeAt(i) - 48;
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

},{}],3:[function(_dereq_,module,exports){
(function (global){
'use strict';
const efrt = {
  pack: _dereq_('./pack/index'),
  unpack: _dereq_('./unpack/index')
};

//and then all-the-exports...
if (typeof self !== 'undefined') {
  self.efrt = efrt; // Web Worker
} else if (typeof window !== 'undefined') {
  window.efrt = efrt; // Browser
} else if (typeof global !== 'undefined') {
  global.efrt = efrt; // NodeJS
}
//don't forget amd!
if (typeof define === 'function' && define.amd) {
  define(efrt);
}
//then for some reason, do this too!
if (typeof module !== 'undefined') {
  module.exports = efrt;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./pack/index":6,"./unpack/index":10}],4:[function(_dereq_,module,exports){
'use strict';

const commonPrefix = function(w1, w2) {
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

/* Sort elements and remove duplicates from array (modified in place) */
const unique = function(a) {
  a.sort();
  for (let i = 1; i < a.length; i++) {
    if (a[i - 1] === a[i]) {
      a.splice(i, 1);
    }
  }
};

module.exports = {
  commonPrefix: commonPrefix,
  unique: unique
};

},{}],5:[function(_dereq_,module,exports){
'use strict';

class Histogram {
  constructor() {
    this.counts = {};
  }
  init(sym) {
    if (this.counts[sym] === undefined) {
      this.counts[sym] = 0;
    }
  }
  add(sym, n) {
    if (n === undefined) {
      n = 1;
    }
    this.init(sym);
    this.counts[sym] += n;
  }
  change(symNew, symOld, n) {
    if (n === undefined) {
      n = 1;
    }
    this.add(symOld, -n);
    this.add(symNew, n);
  }
  countOf(sym) {
    this.init(sym);
    return this.counts[sym];
  }
  highest(top) {
    let sorted = [];
    let keys = Object.keys(this.counts);
    for (let i = 0; i < keys.length; i++) {
      let sym = keys[i];
      sorted.push([sym, this.counts[sym]]);
    }
    sorted.sort(function(a, b) {
      return b[1] - a[1];
    });
    if (top) {
      sorted = sorted.slice(0, top);
    }
    return sorted;
  }
}
module.exports = Histogram;

},{}],6:[function(_dereq_,module,exports){
'use strict';
const Trie = _dereq_('./trie');

//turn an array into a compressed string
const pack = function(arr) {
  let t = new Trie(arr);
  return t.pack();
};
module.exports = pack;

},{"./trie":9}],7:[function(_dereq_,module,exports){
const fns = _dereq_('./fns');
const pack = _dereq_('./pack');
const config = _dereq_('../config');

module.exports = {
  // Insert words from one big string, or from an array.
  insertWords: function(words) {
    if (words === undefined) {
      return;
    }
    if (typeof words === 'string') {
      words = words.split(/[^a-zA-Z]+/);
    }
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i].toLowerCase();
    }
    fns.unique(words);
    for (let i = 0; i < words.length; i++) {
      if (words[i].match(config.NOT_ALLOWED) === null) {
        this.insert(words[i]);
      }
    }
  },

  insert: function(word) {
    this._insert(word, this.root);
    let lastWord = this.lastWord;
    this.lastWord = word;

    let prefix = fns.commonPrefix(word, lastWord);
    if (prefix === lastWord) {
      return;
    }

    let freeze = this.uniqueNode(lastWord, word, this.root);
    if (freeze) {
      this.combineSuffixNode(freeze);
    }
  },

  _insert: function(word, node) {
    let prefix,
      next;

    // Duplicate word entry - ignore
    if (word.length === 0) {
      return;
    }

    // Do any existing props share a common prefix?
    let keys = Object.keys(node);
    for(let i = 0; i < keys.length; i++) {
      let prop = keys[i];
      prefix = fns.commonPrefix(word, prop);
      if (prefix.length === 0) {
        continue;
      }
      // Prop is a proper prefix - recurse to child node
      if (prop === prefix && typeof node[prop] === 'object') {
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
  },

  // Add a terminal string to node.
  // If 2 characters or less, just add with value == 1.
  // If more than 2 characters, point to shared node
  // Note - don't prematurely share suffixes - these
  // terminals may become split and joined with other
  // nodes in this part of the tree.
  addTerminal: function(node, prop) {
    if (prop.length <= 1) {
      node[prop] = 1;
      return;
    }
    let next = {};
    node[prop[0]] = next;
    this.addTerminal(next, prop.slice(1));
  },

  // Well ordered list of properties in a node (string or object properties)
  // Use nodesOnly==true to return only properties of child nodes (not
  // terminal strings.
  nodeProps: function(node, nodesOnly) {
    let props = [];
    for (let prop in node) {
      if (prop !== '' && prop[0] !== '_') {
        if (!nodesOnly || typeof node[prop] === 'object') {
          props.push(prop);
        }
      }
    }
    props.sort();
    return props;
  },

  optimize: function() {
    this.combineSuffixNode(this.root);
    this.prepDFS();
    this.countDegree(this.root);
    this.prepDFS();
    this.collapseChains(this.root);
  },

  // Convert Trie to a DAWG by sharing identical nodes
  combineSuffixNode: function(node) {
    // Frozen node - can't change.
    if (node._c) {
      return node;
    }
    // Make sure all children are combined and generate unique node
    // signature for this node.
    let sig = [];
    if (this.isTerminal(node)) {
      sig.push('!');
    }
    let props = this.nodeProps(node);
    for (let i = 0; i < props.length; i++) {
      let prop = props[i];
      if (typeof node[prop] === 'object') {
        node[prop] = this.combineSuffixNode(node[prop]);
        sig.push(prop);
        sig.push(node[prop]._c);
      } else {
        sig.push(prop);
      }
    }
    sig = sig.join('-');

    let shared = this.suffixes[sig];
    if (shared) {
      return shared;
    }
    this.suffixes[sig] = node;
    node._c = this.cNext++;
    return node;
  },

  prepDFS: function() {
    this.vCur++;
  },

  visited: function(node) {
    if (node._v === this.vCur) {
      return true;
    }
    node._v = this.vCur;
    return false;
  },

  countDegree: function(node) {
    if (node._d === undefined) {
      node._d = 0;
    }
    node._d++;
    if (this.visited(node)) {
      return;
    }
    let props = this.nodeProps(node, true);
    for (let i = 0; i < props.length; i++) {
      this.countDegree(node[props[i]]);
    }
  },

  // Remove intermediate singleton nodes by hoisting into their parent
  collapseChains: function(node) {
    let prop,
      props,
      child,
      i;
    if (this.visited(node)) {
      return;
    }
    props = this.nodeProps(node);
    for (i = 0; i < props.length; i++) {
      prop = props[i];
      child = node[prop];
      if (typeof child !== 'object') {
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
  },

  has: function(word) {
    return this.isFragment(word, this.root);
  },

  isTerminal: function(node) {
    return !!node[''];
  },

  isFragment(word, node) {
    if (word.length === 0) {
      return this.isTerminal(node);
    }

    if (node[word] === 1) {
      return true;
    }

    // Find a prefix of word reference to a child
    let props = this.nodeProps(node, true);
    for (let i = 0; i < props.length; i++) {
      let prop = props[i];
      if (prop === word.slice(0, prop.length)) {
        return this.isFragment(word.slice(prop.length), node[prop]);
      }
    }

    return false;
  },

  // Find highest node in Trie that is on the path to word
  // and that is NOT on the path to other.
  uniqueNode: function(word, other, node) {
    let props = this.nodeProps(node, true);
    for (let i = 0; i < props.length; i++) {
      let prop = props[i];
      if (prop === word.slice(0, prop.length)) {
        if (prop !== other.slice(0, prop.length)) {
          return node[prop];
        }
        return this.uniqueNode(word.slice(prop.length),
          other.slice(prop.length),
          node[prop]);
      }
    }
    return undefined;
  },

  pack: function() {
    return pack(this);
  }
};

},{"../config":1,"./fns":4,"./pack":8}],8:[function(_dereq_,module,exports){
'use strict';
const Histogram = _dereq_('./histogram');
const config = _dereq_('../config');
const encoding = _dereq_('../encoding');

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


const nodeLine = function(self, node) {
  let line = '',
    sep = '';

  if (self.isTerminal(node)) {
    line += config.TERMINAL_PREFIX;
  }

  const props = self.nodeProps(node);
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
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
    let ref = encoding.toAlphaCode(node._n - node[prop]._n - 1 + self.symCount);
    // Large reference to smaller string suffix -> duplicate suffix
    if (node[prop]._g && ref.length >= node[prop]._g.length &&
      node[node[prop]._g] === 1) {
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

const analyzeRefs = function(self, node) {
  if (self.visited(node)) {
    return;
  }
  const props = self.nodeProps(node, true);
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    const ref = node._n - node[prop]._n - 1;
    // Count the number of single-character relative refs
    if (ref < config.BASE) {
      self.histRel.add(ref);
    }
    // Count the number of characters saved by converting an absolute
    // reference to a one-character symbol.
    self.histAbs.add(node[prop]._n, encoding.toAlphaCode(ref).length - 1);
    analyzeRefs(self, node[prop]);
  }
};

const symbolCount = function(self) {
  self.histAbs = self.histAbs.highest(config.BASE);
  let savings = [];
  savings[-1] = 0;
  let best = 0,
    sCount = 0;
  let defSize = 3 + encoding.toAlphaCode(self.nodeCount).length;
  for (let sym = 0; sym < config.BASE; sym++) {
    if (self.histAbs[sym] === undefined) {
      break;
    }
    savings[sym] = self.histAbs[sym][1] - defSize -
    self.histRel.countOf(config.BASE - sym - 1) +
    savings[sym - 1];
    if (savings[sym] >= best) {
      best = savings[sym];
      sCount = sym + 1;
    }
  }
  return sCount;
};

const numberNodes = function(self, node) { // Topological sort into nodes array
  if (node._n !== undefined) {
    return;
  }
  let props = self.nodeProps(node, true);
  for (let i = 0; i < props.length; i++) {
    numberNodes(self, node[props[i]]); //recursive
  }
  node._n = self.pos++;
  self.nodes.unshift(node);
};

const pack = function(self) {
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
  for (let sym = 0; sym < self.symCount; sym++) {
    self.syms[self.histAbs[sym][0]] = encoding.toAlphaCode(sym);
  }
  for (let i = 0; i < self.nodeCount; i++) {
    self.nodes[i] = nodeLine(self, self.nodes[i]);
  }
  // Prepend symbols
  for (let sym = self.symCount - 1; sym >= 0; sym--) {
    self.nodes.unshift(encoding.toAlphaCode(sym) + ':' + encoding.toAlphaCode(self.nodeCount - self.histAbs[sym][0] - 1));
  }

  return self.nodes.join(config.NODE_SEP);
};

module.exports = pack;

},{"../config":1,"../encoding":2,"./histogram":5}],9:[function(_dereq_,module,exports){
'use strict';
const methods = _dereq_('./methods');
/*
 A JavaScript implementation of a Trie search datastructure.
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
const Trie = function(words) {
  this.root = {};
  this.lastWord = '';
  this.suffixes = {};
  this.suffixCounts = {};
  this.cNext = 1;
  this.wordCount = 0;
  this.insertWords(words);
  this.vCur = 0;
};
Object.keys(methods).forEach(function(k) {
  Trie.prototype[k] = methods[k];
});
module.exports = Trie;

},{"./methods":7}],10:[function(_dereq_,module,exports){
'use strict';
const Ptrie = _dereq_('./ptrie');

module.exports = function(str) {
  return new Ptrie(str);
};

},{"./ptrie":13}],11:[function(_dereq_,module,exports){
'use strict';
const encoding = _dereq_('../encoding');
const isPrefix = _dereq_('./prefix');
const unravel = _dereq_('./unravel');

const methods = {
  // Return largest matching string in the dictionary (or '')
  has: function(want) {
    //fail-fast
    if (!want) {
      return false;
    }
    //then, try cache-lookup
    if (this._cache) {
      return this._cache[want] || false;
    }
    let self = this;
    const crawl = function(index, prefix) {
      let node = self.nodes[index];
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
      const matches = node.split(/([A-Z0-9,]+)/g);
      for (let i = 0; i < matches.length; i += 2) {
        const str = matches[i];
        const ref = matches[i + 1];
        if (!str) {
          continue;
        }
        const have = prefix + str;
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
  indexFromRef: function(ref, index) {
    const dnode = encoding.fromAlphaCode(ref);
    if (dnode < this.symCount) {
      return this.syms[dnode];
    }
    return index + dnode + 1 - this.symCount;
  },

  toArray: function() {
    return Object.keys(this.toObject());
  },

  toObject: function() {
    if (this._cache) {
      return this._cache;
    }
    return unravel(this);
  },

  cache: function() {
    this._cache = unravel(this);
    this.nodes = null;
    this.syms = null;
  }
};
module.exports = methods;

},{"../encoding":2,"./prefix":12,"./unravel":15}],12:[function(_dereq_,module,exports){
'use strict';
//are we on the right path with this string?
module.exports = function(str, want) {
  //allow perfect equals
  if (str === want) {
    return true;
  }
  //compare lengths
  let len = str.length;
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

},{}],13:[function(_dereq_,module,exports){
'use strict';
const parseSymbols = _dereq_('./symbols');
const methods = _dereq_('./methods');

//PackedTrie - Trie traversal of the Trie packed-string representation.
const PackedTrie = function(str) {
  this.nodes = str.split(';'); //that's all ;)!
  this.syms = [];
  this.symCount = 0;
  this._cache = null;
  //process symbols, if they have them
  if (str.match(':')) {
    parseSymbols(this);
  }
};

Object.keys(methods).forEach(function(k) {
  PackedTrie.prototype[k] = methods[k];
});

module.exports = PackedTrie;

},{"./methods":11,"./symbols":14}],14:[function(_dereq_,module,exports){
'use strict';
const encoding = _dereq_('../encoding');

//the symbols are at the top of the array.
module.exports = function(t) {
  //... process these lines
  const reSymbol = new RegExp('([0-9A-Z]+):([0-9A-Z]+)');
  for(let i = 0; i < t.nodes.length; i++) {
    const m = reSymbol.exec(t.nodes[i]);
    if (!m) {
      t.symCount = i;
      break;
    }
    t.syms[encoding.fromAlphaCode(m[1])] = encoding.fromAlphaCode(m[2]);
  }
  //remove from main node list
  t.nodes = t.nodes.slice(t.symCount, t.nodes.length);
};

},{"../encoding":2}],15:[function(_dereq_,module,exports){
'use strict';
//spin-out all words from this trie
module.exports = function(trie) {
  let all = {};
  const crawl = function(index, pref) {
    let node = trie.nodes[index];
    if (node[0] === '!') {
      all[pref] = true;
      node = node.slice(1); //ok, we tried. remove it.
    }
    let matches = node.split(/([A-Z0-9,]+)/g);
    for (let i = 0; i < matches.length; i += 2) {
      let str = matches[i];
      let ref = matches[i + 1];
      if (!str) {
        continue;
      }

      let have = pref + str;
      //branch's end
      if (ref === ',' || ref === undefined) {
        all[have] = true;
        continue;
      }
      let newIndex = trie.indexFromRef(ref, index);
      crawl(newIndex, have);
    }
  };
  crawl(0, '');
  return all;
};

},{}]},{},[3])(3)
});(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.efrt = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
module.exports = {
  NODE_SEP: ';',
  STRING_SEP: ',',
  TERMINAL_PREFIX: '!',
  //characters banned from entering the trie
  NOT_ALLOWED: new RegExp('[0-9A-Z,;!]'),
  BASE: 36,
};

},{}],2:[function(_dereq_,module,exports){
'use strict';
const BASE = 36;

const seq = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const cache = seq.split('').reduce(function(h, c, i) {
  h[c] = i;
  return h;
}, {});

// 0, 1, 2, ..., A, B, C, ..., 00, 01, ... AA, AB, AC, ..., AAA, AAB, ...
const toAlphaCode = function(n) {
  if (seq[n] !== undefined) {
    return seq[n];
  }
  let places = 1;
  let range = BASE;
  let s = '';

  for (; n >= range; n -= range, places++, range *= BASE) {
  }
  while (places--) {
    const d = n % BASE;
    s = String.fromCharCode((d < 10 ? 48 : 55) + d) + s;
    n = (n - d) / BASE;
  }
  return s;
};


const fromAlphaCode = function(s) {
  if (cache[s] !== undefined) {
    return cache[s];
  }
  let n = 0;
  let places = 1;
  let range = BASE;
  let pow = 1;

  for (; places < s.length; n += range, places++, range *= BASE) {
  }
  for (let i = s.length - 1; i >= 0; i--, pow *= BASE) {
    let d = s.charCodeAt(i) - 48;
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

},{}],3:[function(_dereq_,module,exports){
(function (global){
'use strict';
const efrt = {
  pack: _dereq_('./pack/index'),
  unpack: _dereq_('./unpack/index')
};

//and then all-the-exports...
if (typeof self !== 'undefined') {
  self.efrt = efrt; // Web Worker
} else if (typeof window !== 'undefined') {
  window.efrt = efrt; // Browser
} else if (typeof global !== 'undefined') {
  global.efrt = efrt; // NodeJS
}
//don't forget amd!
if (typeof define === 'function' && define.amd) {
  define(efrt);
}
//then for some reason, do this too!
if (typeof module !== 'undefined') {
  module.exports = efrt;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./pack/index":6,"./unpack/index":10}],4:[function(_dereq_,module,exports){
'use strict';

const commonPrefix = function(w1, w2) {
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

/* Sort elements and remove duplicates from array (modified in place) */
const unique = function(a) {
  a.sort();
  for (let i = 1; i < a.length; i++) {
    if (a[i - 1] === a[i]) {
      a.splice(i, 1);
    }
  }
};

module.exports = {
  commonPrefix: commonPrefix,
  unique: unique
};

},{}],5:[function(_dereq_,module,exports){
'use strict';

class Histogram {
  constructor() {
    this.counts = {};
  }
  init(sym) {
    if (this.counts[sym] === undefined) {
      this.counts[sym] = 0;
    }
  }
  add(sym, n) {
    if (n === undefined) {
      n = 1;
    }
    this.init(sym);
    this.counts[sym] += n;
  }
  change(symNew, symOld, n) {
    if (n === undefined) {
      n = 1;
    }
    this.add(symOld, -n);
    this.add(symNew, n);
  }
  countOf(sym) {
    this.init(sym);
    return this.counts[sym];
  }
  highest(top) {
    let sorted = [];
    let keys = Object.keys(this.counts);
    for (let i = 0; i < keys.length; i++) {
      let sym = keys[i];
      sorted.push([sym, this.counts[sym]]);
    }
    sorted.sort(function(a, b) {
      return b[1] - a[1];
    });
    if (top) {
      sorted = sorted.slice(0, top);
    }
    return sorted;
  }
}
module.exports = Histogram;

},{}],6:[function(_dereq_,module,exports){
'use strict';
const Trie = _dereq_('./trie');

//turn an array into a compressed string
const pack = function(arr) {
  let t = new Trie(arr);
  return t.pack();
};
module.exports = pack;

},{"./trie":9}],7:[function(_dereq_,module,exports){
const fns = _dereq_('./fns');
const pack = _dereq_('./pack');
const config = _dereq_('../config');

module.exports = {
  // Insert words from one big string, or from an array.
  insertWords: function(words) {
    if (words === undefined) {
      return;
    }
    if (typeof words === 'string') {
      words = words.split(/[^a-zA-Z]+/);
    }
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i].toLowerCase();
    }
    fns.unique(words);
    for (let i = 0; i < words.length; i++) {
      if (words[i].match(config.NOT_ALLOWED) === null) {
        this.insert(words[i]);
      }
    }
  },

  insert: function(word) {
    this._insert(word, this.root);
    let lastWord = this.lastWord;
    this.lastWord = word;

    let prefix = fns.commonPrefix(word, lastWord);
    if (prefix === lastWord) {
      return;
    }

    let freeze = this.uniqueNode(lastWord, word, this.root);
    if (freeze) {
      this.combineSuffixNode(freeze);
    }
  },

  _insert: function(word, node) {
    let prefix,
      next;

    // Duplicate word entry - ignore
    if (word.length === 0) {
      return;
    }

    // Do any existing props share a common prefix?
    let keys = Object.keys(node);
    for(let i = 0; i < keys.length; i++) {
      let prop = keys[i];
      prefix = fns.commonPrefix(word, prop);
      if (prefix.length === 0) {
        continue;
      }
      // Prop is a proper prefix - recurse to child node
      if (prop === prefix && typeof node[prop] === 'object') {
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
  },

  // Add a terminal string to node.
  // If 2 characters or less, just add with value == 1.
  // If more than 2 characters, point to shared node
  // Note - don't prematurely share suffixes - these
  // terminals may become split and joined with other
  // nodes in this part of the tree.
  addTerminal: function(node, prop) {
    if (prop.length <= 1) {
      node[prop] = 1;
      return;
    }
    let next = {};
    node[prop[0]] = next;
    this.addTerminal(next, prop.slice(1));
  },

  // Well ordered list of properties in a node (string or object properties)
  // Use nodesOnly==true to return only properties of child nodes (not
  // terminal strings.
  nodeProps: function(node, nodesOnly) {
    let props = [];
    for (let prop in node) {
      if (prop !== '' && prop[0] !== '_') {
        if (!nodesOnly || typeof node[prop] === 'object') {
          props.push(prop);
        }
      }
    }
    props.sort();
    return props;
  },

  optimize: function() {
    this.combineSuffixNode(this.root);
    this.prepDFS();
    this.countDegree(this.root);
    this.prepDFS();
    this.collapseChains(this.root);
  },

  // Convert Trie to a DAWG by sharing identical nodes
  combineSuffixNode: function(node) {
    // Frozen node - can't change.
    if (node._c) {
      return node;
    }
    // Make sure all children are combined and generate unique node
    // signature for this node.
    let sig = [];
    if (this.isTerminal(node)) {
      sig.push('!');
    }
    let props = this.nodeProps(node);
    for (let i = 0; i < props.length; i++) {
      let prop = props[i];
      if (typeof node[prop] === 'object') {
        node[prop] = this.combineSuffixNode(node[prop]);
        sig.push(prop);
        sig.push(node[prop]._c);
      } else {
        sig.push(prop);
      }
    }
    sig = sig.join('-');

    let shared = this.suffixes[sig];
    if (shared) {
      return shared;
    }
    this.suffixes[sig] = node;
    node._c = this.cNext++;
    return node;
  },

  prepDFS: function() {
    this.vCur++;
  },

  visited: function(node) {
    if (node._v === this.vCur) {
      return true;
    }
    node._v = this.vCur;
    return false;
  },

  countDegree: function(node) {
    if (node._d === undefined) {
      node._d = 0;
    }
    node._d++;
    if (this.visited(node)) {
      return;
    }
    let props = this.nodeProps(node, true);
    for (let i = 0; i < props.length; i++) {
      this.countDegree(node[props[i]]);
    }
  },

  // Remove intermediate singleton nodes by hoisting into their parent
  collapseChains: function(node) {
    let prop,
      props,
      child,
      i;
    if (this.visited(node)) {
      return;
    }
    props = this.nodeProps(node);
    for (i = 0; i < props.length; i++) {
      prop = props[i];
      child = node[prop];
      if (typeof child !== 'object') {
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
  },

  has: function(word) {
    return this.isFragment(word, this.root);
  },

  isTerminal: function(node) {
    return !!node[''];
  },

  isFragment(word, node) {
    if (word.length === 0) {
      return this.isTerminal(node);
    }

    if (node[word] === 1) {
      return true;
    }

    // Find a prefix of word reference to a child
    let props = this.nodeProps(node, true);
    for (let i = 0; i < props.length; i++) {
      let prop = props[i];
      if (prop === word.slice(0, prop.length)) {
        return this.isFragment(word.slice(prop.length), node[prop]);
      }
    }

    return false;
  },

  // Find highest node in Trie that is on the path to word
  // and that is NOT on the path to other.
  uniqueNode: function(word, other, node) {
    let props = this.nodeProps(node, true);
    for (let i = 0; i < props.length; i++) {
      let prop = props[i];
      if (prop === word.slice(0, prop.length)) {
        if (prop !== other.slice(0, prop.length)) {
          return node[prop];
        }
        return this.uniqueNode(word.slice(prop.length),
          other.slice(prop.length),
          node[prop]);
      }
    }
    return undefined;
  },

  pack: function() {
    return pack(this);
  }
};

},{"../config":1,"./fns":4,"./pack":8}],8:[function(_dereq_,module,exports){
'use strict';
const Histogram = _dereq_('./histogram');
const config = _dereq_('../config');
const encoding = _dereq_('../encoding');

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


const nodeLine = function(self, node) {
  let line = '',
    sep = '';

  if (self.isTerminal(node)) {
    line += config.TERMINAL_PREFIX;
  }

  const props = self.nodeProps(node);
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
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
    let ref = encoding.toAlphaCode(node._n - node[prop]._n - 1 + self.symCount);
    // Large reference to smaller string suffix -> duplicate suffix
    if (node[prop]._g && ref.length >= node[prop]._g.length &&
      node[node[prop]._g] === 1) {
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

const analyzeRefs = function(self, node) {
  if (self.visited(node)) {
    return;
  }
  const props = self.nodeProps(node, true);
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    const ref = node._n - node[prop]._n - 1;
    // Count the number of single-character relative refs
    if (ref < config.BASE) {
      self.histRel.add(ref);
    }
    // Count the number of characters saved by converting an absolute
    // reference to a one-character symbol.
    self.histAbs.add(node[prop]._n, encoding.toAlphaCode(ref).length - 1);
    analyzeRefs(self, node[prop]);
  }
};

const symbolCount = function(self) {
  self.histAbs = self.histAbs.highest(config.BASE);
  let savings = [];
  savings[-1] = 0;
  let best = 0,
    sCount = 0;
  let defSize = 3 + encoding.toAlphaCode(self.nodeCount).length;
  for (let sym = 0; sym < config.BASE; sym++) {
    if (self.histAbs[sym] === undefined) {
      break;
    }
    savings[sym] = self.histAbs[sym][1] - defSize -
    self.histRel.countOf(config.BASE - sym - 1) +
    savings[sym - 1];
    if (savings[sym] >= best) {
      best = savings[sym];
      sCount = sym + 1;
    }
  }
  return sCount;
};

const numberNodes = function(self, node) { // Topological sort into nodes array
  if (node._n !== undefined) {
    return;
  }
  let props = self.nodeProps(node, true);
  for (let i = 0; i < props.length; i++) {
    numberNodes(self, node[props[i]]); //recursive
  }
  node._n = self.pos++;
  self.nodes.unshift(node);
};

const pack = function(self) {
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
  for (let sym = 0; sym < self.symCount; sym++) {
    self.syms[self.histAbs[sym][0]] = encoding.toAlphaCode(sym);
  }
  for (let i = 0; i < self.nodeCount; i++) {
    self.nodes[i] = nodeLine(self, self.nodes[i]);
  }
  // Prepend symbols
  for (let sym = self.symCount - 1; sym >= 0; sym--) {
    self.nodes.unshift(encoding.toAlphaCode(sym) + ':' + encoding.toAlphaCode(self.nodeCount - self.histAbs[sym][0] - 1));
  }

  return self.nodes.join(config.NODE_SEP);
};

module.exports = pack;

},{"../config":1,"../encoding":2,"./histogram":5}],9:[function(_dereq_,module,exports){
'use strict';
const methods = _dereq_('./methods');
/*
 A JavaScript implementation of a Trie search datastructure.
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
const Trie = function(words) {
  this.root = {};
  this.lastWord = '';
  this.suffixes = {};
  this.suffixCounts = {};
  this.cNext = 1;
  this.wordCount = 0;
  this.insertWords(words);
  this.vCur = 0;
};
Object.keys(methods).forEach(function(k) {
  Trie.prototype[k] = methods[k];
});
module.exports = Trie;

},{"./methods":7}],10:[function(_dereq_,module,exports){
'use strict';
const Ptrie = _dereq_('./ptrie');

module.exports = function(str) {
  return new Ptrie(str);
};

},{"./ptrie":13}],11:[function(_dereq_,module,exports){
'use strict';
const encoding = _dereq_('../encoding');
const isPrefix = _dereq_('./prefix');
const unravel = _dereq_('./unravel');

const methods = {
  // Return largest matching string in the dictionary (or '')
  has: function(want) {
    //fail-fast
    if (!want) {
      return false;
    }
    //then, try cache-lookup
    if (this._cache) {
      return this._cache[want] || false;
    }
    let self = this;
    const crawl = function(index, prefix) {
      let node = self.nodes[index];
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
      const matches = node.split(/([A-Z0-9,]+)/g);
      for (let i = 0; i < matches.length; i += 2) {
        const str = matches[i];
        const ref = matches[i + 1];
        if (!str) {
          continue;
        }
        const have = prefix + str;
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
  indexFromRef: function(ref, index) {
    const dnode = encoding.fromAlphaCode(ref);
    if (dnode < this.symCount) {
      return this.syms[dnode];
    }
    return index + dnode + 1 - this.symCount;
  },

  toArray: function() {
    return Object.keys(this.toObject());
  },

  toObject: function() {
    if (this._cache) {
      return this._cache;
    }
    return unravel(this);
  },

  cache: function() {
    this._cache = unravel(this);
    this.nodes = null;
    this.syms = null;
  }
};
module.exports = methods;

},{"../encoding":2,"./prefix":12,"./unravel":15}],12:[function(_dereq_,module,exports){
'use strict';
//are we on the right path with this string?
module.exports = function(str, want) {
  //allow perfect equals
  if (str === want) {
    return true;
  }
  //compare lengths
  let len = str.length;
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

},{}],13:[function(_dereq_,module,exports){
'use strict';
const parseSymbols = _dereq_('./symbols');
const methods = _dereq_('./methods');

//PackedTrie - Trie traversal of the Trie packed-string representation.
const PackedTrie = function(str) {
  this.nodes = str.split(';'); //that's all ;)!
  this.syms = [];
  this.symCount = 0;
  this._cache = null;
  //process symbols, if they have them
  if (str.match(':')) {
    parseSymbols(this);
  }
};

Object.keys(methods).forEach(function(k) {
  PackedTrie.prototype[k] = methods[k];
});

module.exports = PackedTrie;

},{"./methods":11,"./symbols":14}],14:[function(_dereq_,module,exports){
'use strict';
const encoding = _dereq_('../encoding');

//the symbols are at the top of the array.
module.exports = function(t) {
  //... process these lines
  const reSymbol = new RegExp('([0-9A-Z]+):([0-9A-Z]+)');
  for(let i = 0; i < t.nodes.length; i++) {
    const m = reSymbol.exec(t.nodes[i]);
    if (!m) {
      t.symCount = i;
      break;
    }
    t.syms[encoding.fromAlphaCode(m[1])] = encoding.fromAlphaCode(m[2]);
  }
  //remove from main node list
  t.nodes = t.nodes.slice(t.symCount, t.nodes.length);
};

},{"../encoding":2}],15:[function(_dereq_,module,exports){
'use strict';
//spin-out all words from this trie
module.exports = function(trie) {
  let all = {};
  const crawl = function(index, pref) {
    let node = trie.nodes[index];
    if (node[0] === '!') {
      all[pref] = true;
      node = node.slice(1); //ok, we tried. remove it.
    }
    let matches = node.split(/([A-Z0-9,]+)/g);
    for (let i = 0; i < matches.length; i += 2) {
      let str = matches[i];
      let ref = matches[i + 1];
      if (!str) {
        continue;
      }

      let have = pref + str;
      //branch's end
      if (ref === ',' || ref === undefined) {
        all[have] = true;
        continue;
      }
      let newIndex = trie.indexFromRef(ref, index);
      crawl(newIndex, have);
    }
  };
  crawl(0, '');
  return all;
};

},{}]},{},[3])(3)
});(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.efrt = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
module.exports = {
  NODE_SEP: ';',
  STRING_SEP: ',',
  TERMINAL_PREFIX: '!',
  //characters banned from entering the trie
  NOT_ALLOWED: new RegExp('[0-9A-Z,;!]'),
  BASE: 36,
};

},{}],2:[function(_dereq_,module,exports){
'use strict';
const BASE = 36;

const seq = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const cache = seq.split('').reduce(function(h, c, i) {
  h[c] = i;
  return h;
}, {});

// 0, 1, 2, ..., A, B, C, ..., 00, 01, ... AA, AB, AC, ..., AAA, AAB, ...
const toAlphaCode = function(n) {
  if (seq[n] !== undefined) {
    return seq[n];
  }
  let places = 1;
  let range = BASE;
  let s = '';

  for (; n >= range; n -= range, places++, range *= BASE) {
  }
  while (places--) {
    const d = n % BASE;
    s = String.fromCharCode((d < 10 ? 48 : 55) + d) + s;
    n = (n - d) / BASE;
  }
  return s;
};


const fromAlphaCode = function(s) {
  if (cache[s] !== undefined) {
    return cache[s];
  }
  let n = 0;
  let places = 1;
  let range = BASE;
  let pow = 1;

  for (; places < s.length; n += range, places++, range *= BASE) {
  }
  for (let i = s.length - 1; i >= 0; i--, pow *= BASE) {
    let d = s.charCodeAt(i) - 48;
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

},{}],3:[function(_dereq_,module,exports){
(function (global){
'use strict';
const efrt = {
  pack: _dereq_('./pack/index'),
  unpack: _dereq_('./unpack/index')
};

//and then all-the-exports...
if (typeof self !== 'undefined') {
  self.efrt = efrt; // Web Worker
} else if (typeof window !== 'undefined') {
  window.efrt = efrt; // Browser
} else if (typeof global !== 'undefined') {
  global.efrt = efrt; // NodeJS
}
//don't forget amd!
if (typeof define === 'function' && define.amd) {
  define(efrt);
}
//then for some reason, do this too!
if (typeof module !== 'undefined') {
  module.exports = efrt;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./pack/index":6,"./unpack/index":10}],4:[function(_dereq_,module,exports){
'use strict';

const commonPrefix = function(w1, w2) {
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

/* Sort elements and remove duplicates from array (modified in place) */
const unique = function(a) {
  a.sort();
  for (let i = 1; i < a.length; i++) {
    if (a[i - 1] === a[i]) {
      a.splice(i, 1);
    }
  }
};

module.exports = {
  commonPrefix: commonPrefix,
  unique: unique
};

},{}],5:[function(_dereq_,module,exports){
'use strict';

class Histogram {
  constructor() {
    this.counts = {};
  }
  init(sym) {
    if (this.counts[sym] === undefined) {
      this.counts[sym] = 0;
    }
  }
  add(sym, n) {
    if (n === undefined) {
      n = 1;
    }
    this.init(sym);
    this.counts[sym] += n;
  }
  change(symNew, symOld, n) {
    if (n === undefined) {
      n = 1;
    }
    this.add(symOld, -n);
    this.add(symNew, n);
  }
  countOf(sym) {
    this.init(sym);
    return this.counts[sym];
  }
  highest(top) {
    let sorted = [];
    let keys = Object.keys(this.counts);
    for (let i = 0; i < keys.length; i++) {
      let sym = keys[i];
      sorted.push([sym, this.counts[sym]]);
    }
    sorted.sort(function(a, b) {
      return b[1] - a[1];
    });
    if (top) {
      sorted = sorted.slice(0, top);
    }
    return sorted;
  }
}
module.exports = Histogram;

},{}],6:[function(_dereq_,module,exports){
'use strict';
const Trie = _dereq_('./trie');

//turn an array into a compressed string
const pack = function(arr) {
  let t = new Trie(arr);
  return t.pack();
};
module.exports = pack;

},{"./trie":9}],7:[function(_dereq_,module,exports){
const fns = _dereq_('./fns');
const pack = _dereq_('./pack');
const config = _dereq_('../config');

module.exports = {
  // Insert words from one big string, or from an array.
  insertWords: function(words) {
    if (words === undefined) {
      return;
    }
    if (typeof words === 'string') {
      words = words.split(/[^a-zA-Z]+/);
    }
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i].toLowerCase();
    }
    fns.unique(words);
    for (let i = 0; i < words.length; i++) {
      if (words[i].match(config.NOT_ALLOWED) === null) {
        this.insert(words[i]);
      }
    }
  },

  insert: function(word) {
    this._insert(word, this.root);
    let lastWord = this.lastWord;
    this.lastWord = word;

    let prefix = fns.commonPrefix(word, lastWord);
    if (prefix === lastWord) {
      return;
    }

    let freeze = this.uniqueNode(lastWord, word, this.root);
    if (freeze) {
      this.combineSuffixNode(freeze);
    }
  },

  _insert: function(word, node) {
    let prefix,
      next;

    // Duplicate word entry - ignore
    if (word.length === 0) {
      return;
    }

    // Do any existing props share a common prefix?
    let keys = Object.keys(node);
    for(let i = 0; i < keys.length; i++) {
      let prop = keys[i];
      prefix = fns.commonPrefix(word, prop);
      if (prefix.length === 0) {
        continue;
      }
      // Prop is a proper prefix - recurse to child node
      if (prop === prefix && typeof node[prop] === 'object') {
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
  },

  // Add a terminal string to node.
  // If 2 characters or less, just add with value == 1.
  // If more than 2 characters, point to shared node
  // Note - don't prematurely share suffixes - these
  // terminals may become split and joined with other
  // nodes in this part of the tree.
  addTerminal: function(node, prop) {
    if (prop.length <= 1) {
      node[prop] = 1;
      return;
    }
    let next = {};
    node[prop[0]] = next;
    this.addTerminal(next, prop.slice(1));
  },

  // Well ordered list of properties in a node (string or object properties)
  // Use nodesOnly==true to return only properties of child nodes (not
  // terminal strings.
  nodeProps: function(node, nodesOnly) {
    let props = [];
    for (let prop in node) {
      if (prop !== '' && prop[0] !== '_') {
        if (!nodesOnly || typeof node[prop] === 'object') {
          props.push(prop);
        }
      }
    }
    props.sort();
    return props;
  },

  optimize: function() {
    this.combineSuffixNode(this.root);
    this.prepDFS();
    this.countDegree(this.root);
    this.prepDFS();
    this.collapseChains(this.root);
  },

  // Convert Trie to a DAWG by sharing identical nodes
  combineSuffixNode: function(node) {
    // Frozen node - can't change.
    if (node._c) {
      return node;
    }
    // Make sure all children are combined and generate unique node
    // signature for this node.
    let sig = [];
    if (this.isTerminal(node)) {
      sig.push('!');
    }
    let props = this.nodeProps(node);
    for (let i = 0; i < props.length; i++) {
      let prop = props[i];
      if (typeof node[prop] === 'object') {
        node[prop] = this.combineSuffixNode(node[prop]);
        sig.push(prop);
        sig.push(node[prop]._c);
      } else {
        sig.push(prop);
      }
    }
    sig = sig.join('-');

    let shared = this.suffixes[sig];
    if (shared) {
      return shared;
    }
    this.suffixes[sig] = node;
    node._c = this.cNext++;
    return node;
  },

  prepDFS: function() {
    this.vCur++;
  },

  visited: function(node) {
    if (node._v === this.vCur) {
      return true;
    }
    node._v = this.vCur;
    return false;
  },

  countDegree: function(node) {
    if (node._d === undefined) {
      node._d = 0;
    }
    node._d++;
    if (this.visited(node)) {
      return;
    }
    let props = this.nodeProps(node, true);
    for (let i = 0; i < props.length; i++) {
      this.countDegree(node[props[i]]);
    }
  },

  // Remove intermediate singleton nodes by hoisting into their parent
  collapseChains: function(node) {
    let prop,
      props,
      child,
      i;
    if (this.visited(node)) {
      return;
    }
    props = this.nodeProps(node);
    for (i = 0; i < props.length; i++) {
      prop = props[i];
      child = node[prop];
      if (typeof child !== 'object') {
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
  },

  has: function(word) {
    return this.isFragment(word, this.root);
  },

  isTerminal: function(node) {
    return !!node[''];
  },

  isFragment(word, node) {
    if (word.length === 0) {
      return this.isTerminal(node);
    }

    if (node[word] === 1) {
      return true;
    }

    // Find a prefix of word reference to a child
    let props = this.nodeProps(node, true);
    for (let i = 0; i < props.length; i++) {
      let prop = props[i];
      if (prop === word.slice(0, prop.length)) {
        return this.isFragment(word.slice(prop.length), node[prop]);
      }
    }

    return false;
  },

  // Find highest node in Trie that is on the path to word
  // and that is NOT on the path to other.
  uniqueNode: function(word, other, node) {
    let props = this.nodeProps(node, true);
    for (let i = 0; i < props.length; i++) {
      let prop = props[i];
      if (prop === word.slice(0, prop.length)) {
        if (prop !== other.slice(0, prop.length)) {
          return node[prop];
        }
        return this.uniqueNode(word.slice(prop.length),
          other.slice(prop.length),
          node[prop]);
      }
    }
    return undefined;
  },

  pack: function() {
    return pack(this);
  }
};

},{"../config":1,"./fns":4,"./pack":8}],8:[function(_dereq_,module,exports){
'use strict';
const Histogram = _dereq_('./histogram');
const config = _dereq_('../config');
const encoding = _dereq_('../encoding');

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


const nodeLine = function(self, node) {
  let line = '',
    sep = '';

  if (self.isTerminal(node)) {
    line += config.TERMINAL_PREFIX;
  }

  const props = self.nodeProps(node);
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
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
    let ref = encoding.toAlphaCode(node._n - node[prop]._n - 1 + self.symCount);
    // Large reference to smaller string suffix -> duplicate suffix
    if (node[prop]._g && ref.length >= node[prop]._g.length &&
      node[node[prop]._g] === 1) {
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

const analyzeRefs = function(self, node) {
  if (self.visited(node)) {
    return;
  }
  const props = self.nodeProps(node, true);
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    const ref = node._n - node[prop]._n - 1;
    // Count the number of single-character relative refs
    if (ref < config.BASE) {
      self.histRel.add(ref);
    }
    // Count the number of characters saved by converting an absolute
    // reference to a one-character symbol.
    self.histAbs.add(node[prop]._n, encoding.toAlphaCode(ref).length - 1);
    analyzeRefs(self, node[prop]);
  }
};

const symbolCount = function(self) {
  self.histAbs = self.histAbs.highest(config.BASE);
  let savings = [];
  savings[-1] = 0;
  let best = 0,
    sCount = 0;
  let defSize = 3 + encoding.toAlphaCode(self.nodeCount).length;
  for (let sym = 0; sym < config.BASE; sym++) {
    if (self.histAbs[sym] === undefined) {
      break;
    }
    savings[sym] = self.histAbs[sym][1] - defSize -
    self.histRel.countOf(config.BASE - sym - 1) +
    savings[sym - 1];
    if (savings[sym] >= best) {
      best = savings[sym];
      sCount = sym + 1;
    }
  }
  return sCount;
};

const numberNodes = function(self, node) { // Topological sort into nodes array
  if (node._n !== undefined) {
    return;
  }
  let props = self.nodeProps(node, true);
  for (let i = 0; i < props.length; i++) {
    numberNodes(self, node[props[i]]); //recursive
  }
  node._n = self.pos++;
  self.nodes.unshift(node);
};

const pack = function(self) {
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
  for (let sym = 0; sym < self.symCount; sym++) {
    self.syms[self.histAbs[sym][0]] = encoding.toAlphaCode(sym);
  }
  for (let i = 0; i < self.nodeCount; i++) {
    self.nodes[i] = nodeLine(self, self.nodes[i]);
  }
  // Prepend symbols
  for (let sym = self.symCount - 1; sym >= 0; sym--) {
    self.nodes.unshift(encoding.toAlphaCode(sym) + ':' + encoding.toAlphaCode(self.nodeCount - self.histAbs[sym][0] - 1));
  }

  return self.nodes.join(config.NODE_SEP);
};

module.exports = pack;

},{"../config":1,"../encoding":2,"./histogram":5}],9:[function(_dereq_,module,exports){
'use strict';
const methods = _dereq_('./methods');
/*
 A JavaScript implementation of a Trie search datastructure.
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
const Trie = function(words) {
  this.root = {};
  this.lastWord = '';
  this.suffixes = {};
  this.suffixCounts = {};
  this.cNext = 1;
  this.wordCount = 0;
  this.insertWords(words);
  this.vCur = 0;
};
Object.keys(methods).forEach(function(k) {
  Trie.prototype[k] = methods[k];
});
module.exports = Trie;

},{"./methods":7}],10:[function(_dereq_,module,exports){
'use strict';
const Ptrie = _dereq_('./ptrie');

module.exports = function(str) {
  return new Ptrie(str);
};

},{"./ptrie":13}],11:[function(_dereq_,module,exports){
'use strict';
const encoding = _dereq_('../encoding');
const isPrefix = _dereq_('./prefix');
const unravel = _dereq_('./unravel');

const methods = {
  // Return largest matching string in the dictionary (or '')
  has: function(want) {
    //fail-fast
    if (!want) {
      return false;
    }
    //then, try cache-lookup
    if (this._cache) {
      return this._cache[want] || false;
    }
    let self = this;
    const crawl = function(index, prefix) {
      let node = self.nodes[index];
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
      const matches = node.split(/([A-Z0-9,]+)/g);
      for (let i = 0; i < matches.length; i += 2) {
        const str = matches[i];
        const ref = matches[i + 1];
        if (!str) {
          continue;
        }
        const have = prefix + str;
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
  indexFromRef: function(ref, index) {
    const dnode = encoding.fromAlphaCode(ref);
    if (dnode < this.symCount) {
      return this.syms[dnode];
    }
    return index + dnode + 1 - this.symCount;
  },

  toArray: function() {
    return Object.keys(this.toObject());
  },

  toObject: function() {
    if (this._cache) {
      return this._cache;
    }
    return unravel(this);
  },

  cache: function() {
    this._cache = unravel(this);
    this.nodes = null;
    this.syms = null;
  }
};
module.exports = methods;

},{"../encoding":2,"./prefix":12,"./unravel":15}],12:[function(_dereq_,module,exports){
'use strict';
//are we on the right path with this string?
module.exports = function(str, want) {
  //allow perfect equals
  if (str === want) {
    return true;
  }
  //compare lengths
  let len = str.length;
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

},{}],13:[function(_dereq_,module,exports){
'use strict';
const parseSymbols = _dereq_('./symbols');
const methods = _dereq_('./methods');

//PackedTrie - Trie traversal of the Trie packed-string representation.
const PackedTrie = function(str) {
  this.nodes = str.split(';'); //that's all ;)!
  this.syms = [];
  this.symCount = 0;
  this._cache = null;
  //process symbols, if they have them
  if (str.match(':')) {
    parseSymbols(this);
  }
};

Object.keys(methods).forEach(function(k) {
  PackedTrie.prototype[k] = methods[k];
});

module.exports = PackedTrie;

},{"./methods":11,"./symbols":14}],14:[function(_dereq_,module,exports){
'use strict';
const encoding = _dereq_('../encoding');

//the symbols are at the top of the array.
module.exports = function(t) {
  //... process these lines
  const reSymbol = new RegExp('([0-9A-Z]+):([0-9A-Z]+)');
  for(let i = 0; i < t.nodes.length; i++) {
    const m = reSymbol.exec(t.nodes[i]);
    if (!m) {
      t.symCount = i;
      break;
    }
    t.syms[encoding.fromAlphaCode(m[1])] = encoding.fromAlphaCode(m[2]);
  }
  //remove from main node list
  t.nodes = t.nodes.slice(t.symCount, t.nodes.length);
};

},{"../encoding":2}],15:[function(_dereq_,module,exports){
'use strict';
//spin-out all words from this trie
module.exports = function(trie) {
  let all = {};
  const crawl = function(index, pref) {
    let node = trie.nodes[index];
    if (node[0] === '!') {
      all[pref] = true;
      node = node.slice(1); //ok, we tried. remove it.
    }
    let matches = node.split(/([A-Z0-9,]+)/g);
    for (let i = 0; i < matches.length; i += 2) {
      let str = matches[i];
      let ref = matches[i + 1];
      if (!str) {
        continue;
      }

      let have = pref + str;
      //branch's end
      if (ref === ',' || ref === undefined) {
        all[have] = true;
        continue;
      }
      let newIndex = trie.indexFromRef(ref, index);
      crawl(newIndex, have);
    }
  };
  crawl(0, '');
  return all;
};

},{}]},{},[3])(3)
});