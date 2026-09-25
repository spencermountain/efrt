(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.efrt = {}));
})(this, (function (exports) { 'use strict';

  const commonPrefix = function (w1, w2) {
    const len = Math.min(w1.length, w2.length);
    let end = 0;
    for (; end < len;) {
      const point = w1.codePointAt(end);
      if (point !== w2.codePointAt(end)) {
        break
      }
      end += point > 0xffff ? 2 : 1;
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

  // Measure the text as shipped in UTF-8, without depending on Node's Buffer.
  const utf8Length = function (str) {
    let size = 0;
    for (const char of str) {
      const point = char.codePointAt(0);
      if (point < 0x80) {
        size++;
      } else if (point < 0x800) {
        size += 2;
      } else if (point < 0x10000) {
        size += 3;
      } else {
        size += 4;
      }
    }
    return size
  };

  var fns = {
    commonPrefix,
    unique,
    utf8Length
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
    for (; places > 0; places--) {
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

  // Only assign characters absent from the original labels. No escaping or
  // additional restrictions on input keys are needed, and tokens cost one byte.
  const alphabet = '#$%&()*+-./<=>?@[]^_`~';

  const dictionary$1 = function (labels, encodeLabel = (text) => text) {
    const used = new Set(labels.join(''));
    const tokens = Array.from(alphabet).filter((char) => !used.has(char));
    if (tokens.length === 0) {
      return { header: '', encode: (label) => label }
    }
    const counts = new Map();
    for (const label of labels) {
      const chars = Array.from(label);
      for (let start = 0; start < chars.length; start++) {
        let fragment = '';
        for (let end = start; end < Math.min(chars.length, start + 12); end++) {
          fragment += chars[end];
          if (end > start) {
            counts.set(fragment, (counts.get(fragment) || 0) + 1);
          }
        }
      }
    }
    const candidates = Array.from(counts, ([text, count]) => {
      const size = fns.utf8Length(encodeLabel(text));
      return { text, size, saving: ((size - 1) * count) - size - 2 }
    }).filter((entry) => entry.saving > 0).sort((a, b) => b.saving - a.saving).slice(0, 256);
    let remaining = labels.slice();
    const entries = [];
    for (const candidate of candidates) {
      if (entries.length === tokens.length) {
        break
      }
      const parts = remaining.map((label) => label.split(candidate.text));
      const count = parts.reduce((sum, pieces) => sum + pieces.length - 1, 0);
      if ((candidate.size - 1) * count <= candidate.size + 2) {
        continue
      }
      const token = tokens[entries.length];
      entries.push({ token, text: candidate.text });
      remaining = parts.map((pieces) => pieces.join(token));
    }
    return {
      header: entries.length > 0 ? '!1:' + entries.map((entry) => entry.token).join('') + ':' +
        entries.map((entry) => encodeLabel(entry.text)).join(',') + ';' : '',
      encode: function (label) {
        for (const entry of entries) {
          label = label.split(entry.text).join(entry.token);
        }
        return label
      }
    }
  };

  // Escape only serialized labels, after trie optimization and token selection.
  const escapeLabel = function (text) {
    return text.replace(/[0-9\\]/g, (char) =>
      char === '\\' ? '\\\\' : '\\' + 'abcdefghij'[Number(char)])
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
  const nodeLine = function (self, node, label = (text) => text) {
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
        line += sep + label(prop);
        sep = config.STRING_SEP;
        continue
      }
      if (self.syms[child._n]) {
        line += sep + label(prop) + self.syms[child._n];
        sep = '';
        continue
      }
      let ref = encoding.toAlphaCode(node._n - child._n - 1 + self.symCount);
      // Only inline a complete terminal suffix. A singleton can still point
      // to another node; checking the parent would silently truncate that path.
      if (child._g && ref.length >= child._g.length && child.edges[child._g] === 1) {
        ref = child._g;
        line += sep + label(prop + ref);
        sep = config.STRING_SEP;
        continue
      }
      line += sep + label(prop) + ref;
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

  const pack$1 = function (self, useDictionary = false, versioned = false) {
    const encodeLabel = versioned ? escapeLabel : (text) => text;
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
    const labels = [];
    const lines = self.nodes.map((node) => nodeLine(self, node, (text) => {
      if (useDictionary) {
        labels.push(text);
      }
      return encodeLabel(text)
    }));
    const symbols = [];
    // Prepend symbols
    for (let sym = self.symCount - 1; sym >= 0; sym--) {
      symbols.unshift(
        encoding.toAlphaCode(sym) +
          config.KEY_VAL +
          encoding.toAlphaCode(self.nodeCount - self.histAbs[sym][0] - 1)
      );
    }
    const plain = symbols.concat(lines).join(config.NODE_SEP);
    if (useDictionary) {
      const dict = dictionary$1(labels, encodeLabel);
      if (dict.header) {
        const encoded = dict.header + symbols.concat(
          self.nodes.map((node) => nodeLine(self, node, (text) => encodeLabel(dict.encode(text))))
        ).join(config.NODE_SEP);
        if (fns.utf8Length(encoded) < fns.utf8Length(plain)) {
          return encoded
        }
      }
    }
    return plain
  };

  const unsupportedChars = /[A-Z,;!:|¦]/;

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
    // An empty suffix or one code point is stored directly as a terminal.
    // Longer suffixes point to a shared node, without splitting surrogate pairs.
    // Note - don't prematurely share suffixes - these
    // terminals may become split and joined with other
    // nodes in this part of the tree.
    addTerminal: function (node, prop) {
      const width = prop.codePointAt(0) > 0xffff ? 2 : 1;
      if (prop.length <= width) {
        node.edges[prop] = 1;
        return
      }
      const next = createNode();
      node.edges[prop.slice(0, width)] = next;
      this.addTerminal(next, prop.slice(width));
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
      // Preserve the distinction between digit labels and numeric child IDs.
      sig = JSON.stringify(sig);

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

    pack: function (useDictionary, versioned) {
      return pack$1(this, useDictionary, versioned)
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
    const direction = options.direction === undefined ? 'prefix' : options.direction;
    if (!['prefix', 'suffix', 'auto'].includes(direction)) {
      throw new TypeError('efrt direction must be prefix, suffix, or auto')
    }
    if (options.dictionary !== undefined && typeof options.dictionary !== 'boolean') {
      throw new TypeError('efrt dictionary must be a boolean')
    }
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
      const words = flat[k].map(normalizeKey);
      const versioned = words.some((word) => /[0-9]/.test(word) && !unsupportedChars.test(word));
      const marker = versioned ? '!2;' : '';
      if (direction === 'prefix') {
        flat[k] = marker + new Trie(words).pack(options.dictionary, versioned);
        return
      }
      // Normalize before reversing: lowercasing can depend on letter order
      // (for example Greek final sigma) or expand a character into two.
      const reversed = words.map((word) => Array.from(word).reverse().join(''));
      const suffix = marker + ':' + new Trie(reversed).pack(options.dictionary, versioned);
      if (direction === 'suffix') {
        flat[k] = suffix;
        return
      }
      const prefix = marker + new Trie(words).pack(options.dictionary, versioned);
      flat[k] = fns.utf8Length(suffix) < fns.utf8Length(prefix) ? suffix : prefix;
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
    if (t.nodes.length === 0 || t.syms.some((index) => !Number.isSafeInteger(index) || index >= t.nodes.length)) {
      throw new SyntaxError('Invalid efrt packed data: symbol target')
    }
  };

  const unescapeLabel = function (text) {
    return text.replace(/\\([\s\S]|$)/g, (match, char) => {
      if (char === '\\') {
        return '\\'
      }
      if (char >= 'a' && char <= 'j') {
        return String(char.charCodeAt(0) - 97)
      }
      throw new SyntaxError('Invalid efrt packed data: label escape')
    })
  };

  const dictionary = function (trie) {
    if (!trie.nodes[0].startsWith('!1:')) {
      return
    }
    const header = trie.nodes.shift().split(':');
    const tokens = Array.from(header[1]);
    const fragments = (header[2] || '').split(',');
    if (header.length !== 3 || tokens.length === 0 || tokens.length !== fragments.length ||
      new Set(tokens).size !== tokens.length || trie.nodes.length === 0 ||
      tokens.some((token) => token.length !== 1 || token.charCodeAt(0) < 33 ||
        token.charCodeAt(0) > 126 || /[A-Za-z0-9,;!:|]/.test(token) ||
        (trie.versioned && token === '\\')) ||
      fragments.some((text) => !text || /[A-Z0-9,;!:|¦]/.test(text))) {
      throw new SyntaxError('Invalid efrt packed data: fragment dictionary')
    }
    trie.dictionary = Object.create(null);
    for (let i = 0; i < tokens.length; i++) {
      trie.dictionary[tokens[i]] = trie.versioned ? unescapeLabel(fragments[i]) : fragments[i];
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
      // Match only at the current offset. Searching later positions would
      // repeatedly rescan a long malformed fragment before rejecting it.
      const token = /([^A-Z0-9,;!:|¦]+)([A-Z0-9]+|,|$)/y;
      for (let offset = 0; offset < body.length; offset = token.lastIndex) {
        const match = token.exec(body);
        if (!match || match.index !== offset || (match[2] === ',' && token.lastIndex === body.length)) {
          throw new SyntaxError('Invalid efrt packed data: node syntax')
        }
        const ref = match[2];
        const label = trie.versioned ? unescapeLabel(match[1]) : match[1];
        const text = trie.dictionary ? Array.from(label,
          (char) => trie.dictionary[char] || char).join('') : label;
        edges.push({
          text,
          target: ref === '' || ref === ',' ? -1 : indexFromRef(trie, ref, index)
        });
      }
      return { terminal, edges }
    })
  };

  const toArray = function (trie) {
    const nodes = parseNodes(trie);
    const all = [];
    const stack = [{ index: 0, pref: '', edge: -1 }];
    for (; stack.length > 0;) {
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
  const unpack$1 = function (str, versioned = false) {
    const trie = {
      nodes: str.split(';'),
      syms: [],
      symCount: 0,
      versioned
    };
    dictionary(trie);
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
      let data = obj[cat];
      const versioned = data.startsWith('!2;');
      if (versioned) {
        data = data.slice(3);
        if (!data || data === ':') {
          throw new SyntaxError('Invalid efrt packed data: missing versioned trie')
        }
      }
      const reversed = data[0] === ':';
      const arr = unpack$1(reversed ? data.slice(1) : data, versioned);
      //special case, for botched-boolean
      if (cat === 'true') {
        cat = true;
      }
      for (let i = 0; i < arr.length; i++) {
        const k = reversed ? Array.from(arr[i]).reverse().join('') : arr[i];
        if (Object.prototype.hasOwnProperty.call(all, k)) {
          if (Array.isArray(all[k]) === false) {
            if (all[k] !== cat) {
              all[k] = [all[k], cat];
            }
          } else if (!all[k].includes(cat)) {
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
