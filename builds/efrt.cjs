(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.efrt = {}));
})(this, (function (exports) { 'use strict';

  const commonPrefix = function (w1, w2) {
    const len = Math.min(w1.length, w2.length);
    let end = 0;
    while (end < len && w1[end] === w2[end]) {
      end++;
    }
    return w1.slice(0, end)
  };

  /* Sort elements and remove duplicates from array (modified in place) */
  const unique = function (a) {
    a.sort();
    let count = 0;
    for (let i = 0; i < a.length; i++) {
      if (count === 0 || a[count - 1] !== a[i]) {
        a[count++] = a[i];
      }
    }
    a.length = count;
  };

  var fns = {
    commonPrefix,
    unique
  };

  const Histogram = function () {
    this.counts = Object.create(null);
  };

  const methods$1 = {
    init: function (sym) {
      if (this.counts[sym] === undefined) {
        this.counts[sym] = 0;
      }
    },
    add: function (sym, n) {
      if (n === undefined) {
        n = 1;
      }
      this.init(sym);
      this.counts[sym] += n;
    },
    countOf: function (sym) {
      this.init(sym);
      return this.counts[sym]
    },
    highest: function (top) {
      let sorted = [];
      const keys = Object.keys(this.counts);
      for (let i = 0; i < keys.length; i++) {
        const sym = keys[i];
        sorted.push([sym, this.counts[sym]]);
      }
      sorted.sort(function (a, b) {
        return b[1] - a[1]
      });
      if (top) {
        sorted = sorted.slice(0, top);
      }
      return sorted
    }
  };

  Object.keys(methods$1).forEach(function (k) {
    Histogram.prototype[k] = methods$1[k];
  });

  /* eslint-disable no-empty */
  const BASE = 36;
  const seq = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const cache = seq.split('').reduce(function (h, c, i) {
    h[c] = i;
    return h
  }, {});

  // 0, 1, 2, ..., A, B, C, ..., 00, 01, ... AA, AB, AC, ..., AAA, AAB, ...
  const toAlphaCode = function (n) {
    if (seq[n] !== undefined) {
      return seq[n]
    }
    let places = 1;
    let range = BASE;
    let s = '';
    for (; n >= range; n -= range, places++, range *= BASE) {}
    while (places--) {
      const d = n % BASE;
      s = String.fromCharCode((d < 10 ? 48 : 55) + d) + s;
      n = (n - d) / BASE;
    }
    return s
  };

  const fromAlphaCode = function (s) {
    if (cache[s] !== undefined) {
      return cache[s]
    }
    let n = 0;
    let places = 1;
    let range = BASE;
    let pow = 1;
    for (; places < s.length; n += range, places++, range *= BASE) {}
    for (let i = s.length - 1; i >= 0; i--, pow *= BASE) {
      let d = s.charCodeAt(i) - 48;
      if (d > 10) {
        d -= 7;
      }
      n += d * pow;
    }
    return n
  };

  var encoding = {
    toAlphaCode,
    fromAlphaCode
  };

  const config = {
    NODE_SEP: ';',
    KEY_VAL: ':',
    STRING_SEP: ',',
    TERMINAL_PREFIX: '!',
    BASE: 36
  };
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
  const nodeLine = function (self, node) {
    let line = '',
      sep = '';
    if (self.isTerminal(node)) {
      line += config.TERMINAL_PREFIX;
    }
    const props = self.nodeProps(node);
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      const child = node.edges[prop];
      if (typeof child === 'number') {
        line += sep + prop;
        sep = config.STRING_SEP;
        continue
      }
      if (self.syms[child._n]) {
        line += sep + prop + self.syms[child._n];
        sep = '';
        continue
      }
      let ref = encoding.toAlphaCode(node._n - child._n - 1 + self.symCount);
      // Large reference to smaller string suffix -> duplicate suffix
      if (child._g && ref.length >= child._g.length && node.edges[child._g] === 1) {
        ref = child._g;
        line += sep + prop + ref;
        sep = config.STRING_SEP;
        continue
      }
      line += sep + prop + ref;
      sep = '';
    }
    return line
  };

  const analyzeRefs = function (self, node) {
    if (self.visited(node)) {
      return
    }
    const props = self.nodeProps(node, true);
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      const child = node.edges[prop];
      const ref = node._n - child._n - 1;
      // Count the number of single-character relative refs
      if (ref < config.BASE) {
        self.histRel.add(ref);
      }
      // Count the number of characters saved by converting an absolute
      // reference to a one-character symbol.
      self.histAbs.add(child._n, encoding.toAlphaCode(ref).length - 1);
      analyzeRefs(self, child);
    }
  };

  const symbolCount = function (self) {
    self.histAbs = self.histAbs.highest(config.BASE);
    const savings = [];
    savings[-1] = 0;
    let best = 0,
      sCount = 0;
    const defSize = 3 + encoding.toAlphaCode(self.nodeCount).length;
    for (let sym = 0; sym < config.BASE; sym++) {
      if (self.histAbs[sym] === undefined) {
        break
      }
      savings[sym] =
        self.histAbs[sym][1] -
        defSize -
        self.histRel.countOf(config.BASE - sym - 1) +
        savings[sym - 1];
      if (savings[sym] >= best) {
        best = savings[sym];
        sCount = sym + 1;
      }
    }
    return sCount
  };

  const numberNodes = function (self, node) {
    // Topological sort into nodes array
    if (node._n !== undefined) {
      return
    }
    const props = self.nodeProps(node, true);
    for (let i = 0; i < props.length; i++) {
      numberNodes(self, node.edges[props[i]]); //recursive
    }
    node._n = self.pos++;
    self.nodes.push(node);
  };

  const pack$1 = function (self) {
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
    self.nodes.reverse();
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
      self.nodes.unshift(
        encoding.toAlphaCode(sym) +
          config.KEY_VAL +
          encoding.toAlphaCode(self.nodeCount - self.histAbs[sym][0] - 1)
      );
    }
    return self.nodes.join(config.NODE_SEP)
  };

  const unsupportedChars = /[0-9A-Z,;!:|¦]/;

  const normalizeKey = function (key) {
    const normalized = key.toLowerCase();
    // Bound the depth of recursive trie construction and optimization.
    if (normalized.length > 1024) {
      throw new RangeError('efrt keys cannot exceed 1024 UTF-16 code units')
    }
    return normalized
  };

  const validateKeys = function (obj) {
    const seen = new Map();
    Object.keys(obj).forEach((key) => {
      const normalized = normalizeKey(key);
      if (!normalized || unsupportedChars.test(normalized)) {
        throw new TypeError('efrt strict: unsupported key ' + JSON.stringify(key))
      }
      if (seen.has(normalized)) {
        throw new TypeError('efrt strict: keys ' + JSON.stringify(seen.get(normalized)) +
          ' and ' + JSON.stringify(key) + ' both normalize to ' + JSON.stringify(normalized))
      }
      seen.set(normalized, key);
    });
  };

  // Word fragments live only in edges; metadata fields belong to the wrapper.
  // Even fragments such as "_c", "edges", and "__proto__" are ordinary keys.
  const createNode = function () {
    return { edges: Object.create(null) }
  };

  const methods = {
    // Insert words from one big string, or from an array.
    insertWords: function (words) {
      if (words === undefined) {
        return
      }
      if (typeof words === 'string') {
        words = words.split(/[^a-zA-Z]+/);
      }
      for (let i = 0; i < words.length; i++) {
        words[i] = normalizeKey(words[i]);
      }
      fns.unique(words);
      for (let i = 0; i < words.length; i++) {
        if (!unsupportedChars.test(words[i])) {
          this.insert(words[i]);
        }
      }
    },

    insert: function (word) {
      this._insert(word, this.root);
      const lastWord = this.lastWord;
      this.lastWord = word;

      const prefix = fns.commonPrefix(word, lastWord);
      if (prefix === lastWord) {
        return
      }

      const freeze = this.uniqueNode(lastWord, word, this.root);
      if (freeze) {
        this.combineSuffixNode(freeze);
      }
    },

    _insert: function (word, node) {
      let prefix, next;

      // Duplicate word entry - ignore
      if (word.length === 0) {
        return
      }

      // Do any existing props share a common prefix?
      const keys = Object.keys(node.edges);
      for (let i = 0; i < keys.length; i++) {
        const prop = keys[i];
        prefix = fns.commonPrefix(word, prop);
        if (prefix.length === 0) {
          continue
        }
        // Prop is a proper prefix - recurse to child node
        if (prop === prefix && typeof node.edges[prop] === 'object') {
          this._insert(word.slice(prefix.length), node.edges[prop]);
          return
        }
        // Duplicate terminal string - ignore
        if (prop === word && typeof node.edges[prop] === 'number') {
          return
        }
        next = createNode();
        next.edges[prop.slice(prefix.length)] = node.edges[prop];
        this.addTerminal(next, word = word.slice(prefix.length));
        delete node.edges[prop];
        node.edges[prefix] = next;
        this.wordCount++;
        return
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
    addTerminal: function (node, prop) {
      if (prop.length <= 1) {
        node.edges[prop] = 1;
        return
      }
      const next = createNode();
      node.edges[prop[0]] = next;
      this.addTerminal(next, prop.slice(1));
    },

    // Well ordered list of properties in a node (string or object properties)
    // Use nodesOnly==true to return only properties of child nodes (not
    // terminal strings.
    nodeProps: function (node, nodesOnly) {
      const props = [];
      for (const prop in node.edges) {
        if (prop !== '') {
          if (!nodesOnly || typeof node.edges[prop] === 'object') {
            props.push(prop);
          }
        }
      }
      props.sort();
      return props
    },

    optimize: function () {
      this.combineSuffixNode(this.root);
      this.prepDFS();
      this.countDegree(this.root);
      this.prepDFS();
      this.collapseChains(this.root);
    },

    // Convert Trie to a DAWG by sharing identical nodes
    combineSuffixNode: function (node) {
      // Frozen node - can't change.
      if (node._c) {
        return node
      }
      // Make sure all children are combined and generate unique node
      // signature for this node.
      let sig = [];
      if (this.isTerminal(node)) {
        sig.push('!');
      }
      const props = this.nodeProps(node);
      for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        if (typeof node.edges[prop] === 'object') {
          node.edges[prop] = this.combineSuffixNode(node.edges[prop]);
          sig.push(prop);
          sig.push(node.edges[prop]._c);
        } else {
          sig.push(prop);
        }
      }
      sig = sig.join('-');

      const shared = this.suffixes[sig];
      if (shared) {
        return shared
      }
      this.suffixes[sig] = node;
      node._c = this.cNext++;
      return node
    },

    prepDFS: function () {
      this.vCur++;
    },

    visited: function (node) {
      if (node._v === this.vCur) {
        return true
      }
      node._v = this.vCur;
      return false
    },

    countDegree: function (node) {
      if (node._d === undefined) {
        node._d = 0;
      }
      node._d++;
      if (this.visited(node)) {
        return
      }
      const props = this.nodeProps(node, true);
      for (let i = 0; i < props.length; i++) {
        this.countDegree(node.edges[props[i]]);
      }
    },

    // Remove intermediate singleton nodes by hoisting into their parent
    collapseChains: function (node) {
      let prop, child, i;
      if (this.visited(node)) {
        return
      }
      const props = this.nodeProps(node);
      for (i = 0; i < props.length; i++) {
        prop = props[i];
        child = node.edges[prop];
        if (typeof child !== 'object') {
          continue
        }
        this.collapseChains(child);
        // Hoist the singleton child's single property to the parent
        if (child._g !== undefined && (child._d === 1 || child._g.length === 1)) {
          delete node.edges[prop];
          prop += child._g;
          node.edges[prop] = child.edges[child._g];
        }
      }
      // Identify singleton nodes
      if (props.length === 1 && !this.isTerminal(node)) {
        node._g = prop;
      }
    },

    isTerminal: function (node) {
      return !!node.edges['']
    },

    // Find highest node in Trie that is on the path to word
    // and that is NOT on the path to other.
    uniqueNode: function (word, other, node) {
      const props = this.nodeProps(node, true);
      for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        if (prop === word.slice(0, prop.length)) {
          if (prop !== other.slice(0, prop.length)) {
            return node.edges[prop]
          }
          return this.uniqueNode(word.slice(prop.length), other.slice(prop.length), node.edges[prop])
        }
      }
      return undefined
    },

    pack: function () {
      return pack$1(this)
    }
  };

  /*
   A JavaScript implementation of a Trie search datastructure.
  Each node has an edges dictionary separate from its metadata.
  The edges dictionary contains:
        '' - If present (with value == 1), the node is a Terminal Node - the prefix
            leading to this node is a word in the dictionary.
        numeric properties (value == 1) - the property name is a terminal string
            so that the prefix + string is a word in the dictionary.
        Object properties - the property name is one or more characters to be consumed
            from the prefix of the test string, with the remainder to be checked in
            the child node.
  The node wrapper contains only edges and the following metadata:
        '_c': A unique name for the node (starting from 1), used in combining Suffixes.
        '_n': Created when packing the Trie, the sequential node number
            (in pre-order traversal).
        '_d': The number of times a node is shared (it's in-degree from other nodes).
        '_v': Visited in DFS.
        '_g': For singleton nodes, the name of it's single property.
   */
  const Trie = function (words) {
    this.root = createNode();
    this.lastWord = '';
    this.suffixes = Object.create(null);
    this.suffixCounts = Object.create(null);
    this.cNext = 1;
    this.wordCount = 0;
    this.insertWords(words);
    this.vCur = 0;
  };

  Object.keys(methods).forEach(function (k) {
    Trie.prototype[k] = methods[k];
  });

  const isArray = function (input) {
    return Object.prototype.toString.call(input) === '[object Array]'
  };

  const handleFormats = function (input) {
    //null
    if (input === null || input === undefined) {
      return {}
    }
    //string
    if (typeof input === 'string') {
      return input.split(/ +/g).reduce(function (h, str) {
        h[str] = true;
        return h
      }, Object.create(null))
    }
    //array
    if (isArray(input)) {
      return input.reduce(function (h, str) {
        h[str] = true;
        return h
      }, Object.create(null))
    }
    //object
    return input
  };

  //turn an array into a compressed string
  const pack = function (obj, options = {}) {
    if (options.strict && isArray(obj) && obj.some((key) => typeof key !== 'string')) {
      throw new TypeError('efrt strict: array keys must be strings')
    }
    obj = handleFormats(obj);
    if (options.strict) {
      validateKeys(obj);
    }
    //pivot into categories:
    const flat = Object.keys(obj).reduce(function (h, k) {
      const values = isArray(obj[k]) ? obj[k] : [obj[k]];
      for (let i = 0; i < values.length; i++) {
        const cat = String(values[i]);
        if (/[|¦]/.test(cat)) {
          throw new TypeError('efrt categories cannot contain | or ¦')
        }
        h[cat] = h[cat] || [];
        h[cat].push(k);
      }
      return h
    }, Object.create(null));
    //pack each into a compressed string
    Object.keys(flat).forEach(function (k) {
      const t = new Trie(flat[k]);
      flat[k] = t.pack();
    });
    return Object.keys(flat)
      .map((k) => {
        return k + '¦' + flat[k]
      })
      .join('|')
  };

  const symbols = function (t) {
    const reSymbol = /^([0-9A-Z]+):([0-9A-Z]+)$/;
    for (let i = 0; i < t.nodes.length; i++) {
      if (!t.nodes[i].includes(':')) {
        break
      }
      const m = reSymbol.exec(t.nodes[i]);
      if (!m || m[0].length !== t.nodes[i].length || encoding.fromAlphaCode(m[1]) !== i) {
        throw new SyntaxError('Invalid efrt packed data: symbol definition')
      }
      t.syms.push(encoding.fromAlphaCode(m[2]));
    }
    t.symCount = t.syms.length;
    t.nodes = t.nodes.slice(t.symCount);
    if (!t.nodes.length || t.syms.some((index) => !Number.isSafeInteger(index) || index >= t.nodes.length)) {
      throw new SyntaxError('Invalid efrt packed data: symbol target')
    }
  };

  // References are either absolute (symbol) or relative (1 - based)
  const indexFromRef = function (trie, ref, index) {
    const dnode = encoding.fromAlphaCode(ref);
    const target = dnode < trie.symCount ? trie.syms[dnode] : index + dnode + 1 - trie.symCount;
    // The encoder emits nodes in topological order. Every edge must point
    // forward, which also rules out cycles before expansion starts.
    if (!Number.isSafeInteger(target) || target <= index || target >= trie.nodes.length) {
      throw new SyntaxError('Invalid efrt packed data: node reference')
    }
    return target
  };

  const parseNodes = function (trie) {
    return trie.nodes.map((node, index) => {
      if (node === '' && trie.nodes.length !== 1) {
        throw new SyntaxError('Invalid efrt packed data: empty node')
      }
      const terminal = node[0] === '!';
      const body = terminal ? node.slice(1) : node;
      const edges = [];
      const token = /([^A-Z0-9,;!:|¦]+)([A-Z0-9]+|,|$)/g;
      let offset = 0;
      while (offset < body.length) {
        const match = token.exec(body);
        if (!match || match.index !== offset || (match[2] === ',' && token.lastIndex === body.length)) {
          throw new SyntaxError('Invalid efrt packed data: node syntax')
        }
        const ref = match[2];
        edges.push({
          text: match[1],
          target: ref === '' || ref === ',' ? -1 : indexFromRef(trie, ref, index)
        });
        offset = token.lastIndex;
      }
      return { terminal, edges }
    })
  };

  const toArray = function (trie) {
    const nodes = parseNodes(trie);
    const all = [];
    const stack = [{ index: 0, pref: '', edge: -1 }];
    while (stack.length) {
      const frame = stack[stack.length - 1];
      const node = nodes[frame.index];
      if (frame.edge === -1) {
        if (node.terminal) {
          all.push(frame.pref);
        }
        frame.edge = 0;
      }
      if (frame.edge === node.edges.length) {
        stack.pop();
        continue
      }
      const edge = node.edges[frame.edge++];
      const word = frame.pref + edge.text;
      if (edge.target === -1) {
        all.push(word);
      } else {
        stack.push({ index: edge.target, pref: word, edge: -1 });
      }
    }
    return all
  };

  //PackedTrie - Trie traversal of the Trie packed-string representation.
  const unpack$1 = function (str) {
    const trie = {
      nodes: str.split(';'),
      syms: [],
      symCount: 0
    };
    //process symbols, if they have them
    if (str.match(':')) {
      symbols(trie);
    }
    return toArray(trie)
  };

  const unpack = function (str) {
    if (str === '' || str === null || str === undefined) {
      return {}
    }
    if (typeof str !== 'string') {
      throw new TypeError('efrt unpack expects a string')
    }
    //turn the weird string into a key-value object again
    const obj = str.split('|').reduce((h, s) => {
      const arr = s.split('¦');
      if (arr.length !== 2 || Object.prototype.hasOwnProperty.call(h, arr[0])) {
        throw new SyntaxError('Invalid efrt packed data: category separator or duplicate category')
      }
      h[arr[0]] = arr[1];
      return h
    }, Object.create(null));
    const all = {};
    Object.keys(obj).forEach(function (cat) {
      const arr = unpack$1(obj[cat]);
      //special case, for botched-boolean
      if (cat === 'true') {
        cat = true;
      }
      for (let i = 0; i < arr.length; i++) {
        const k = arr[i];
        if (Object.prototype.hasOwnProperty.call(all, k)) {
          if (Array.isArray(all[k]) === false) {
            all[k] = [all[k], cat];
          } else {
            all[k].push(cat);
          }
        } else {
          Object.defineProperty(all, k, {
            value: cat,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }
    });
    return all
  };

  var _version = '2.8.0';

  exports.pack = pack;
  exports.unpack = unpack;
  exports.version = _version;

}));
