'use strict';
const fns = require('../fns');
const config = require('../config');
const Histogram = require('./histogram');
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
class Trie {
  constructor(words) {
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
  insertWords(words) {
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
      this.insert(words[i]);
    }
  }

  insert(word) {
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
  }

  _insert(word, node) {
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
  }

  // Add a terminal string to node.
  // If 2 characters or less, just add with value == 1.
  // If more than 2 characters, point to shared node
  // Note - don't prematurely share suffixes - these
  // terminals may become split and joined with other
  // nodes in this part of the tree.
  addTerminal(node, prop) {
    if (prop.length <= 1) {
      node[prop] = 1;
      return;
    }
    let next = {};
    node[prop[0]] = next;
    this.addTerminal(next, prop.slice(1));
  }

  // Well ordered list of properties in a node (string or object properties)
  // Use nodesOnly==true to return only properties of child nodes (not
  // terminal strings.
  nodeProps(node, nodesOnly) {
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
  }

  optimize() {
    this.combineSuffixNode(this.root);
    this.prepDFS();
    this.countDegree(this.root);
    this.prepDFS();
    this.collapseChains(this.root);
  }

  // Convert Trie to a DAWG by sharing identical nodes
  combineSuffixNode(node) {
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
  }

  prepDFS() {
    this.vCur++;
  }

  visited(node) {
    if (node._v === this.vCur) {
      return true;
    }
    node._v = this.vCur;
    return false;
  }

  countDegree(node) {
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
  }

  // Remove intermediate singleton nodes by hoisting into their parent
  collapseChains(node) {
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
  }

  isWord(word) {
    return this.isFragment(word, this.root);
  }

  isTerminal(node) {
    return !!node[''];
  }

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
  }

  // Find highest node in Trie that is on the path to word
  // and that is NOT on the path to other.
  uniqueNode(word, other, node) {
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
  }

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
  pack() {
    let self = this;
    let nodes = [];
    let nodeCount;
    let syms = {};
    let symCount;
    let pos = 0;

    // Make sure we've combined all the common suffixes
    this.optimize();

    function nodeLine(node) {
      let line = '',
        sep = '';

      if (self.isTerminal(node)) {
        line += config.TERMINAL_PREFIX;
      }

      let props = self.nodeProps(node);
      for (let i = 0; i < props.length; i++) {
        let prop = props[i];
        if (typeof node[prop] === 'number') {
          line += sep + prop;
          sep = config.STRING_SEP;
          continue;
        }
        if (syms[node[prop]._n]) {
          line += sep + prop + syms[node[prop]._n];
          sep = '';
          continue;
        }
        let ref = fns.toAlphaCode(node._n - node[prop]._n - 1 + symCount);
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
    }

    // Topological sort into nodes array
    function numberNodes(node) {
      if (node._n !== undefined) {
        return;
      }
      let props = self.nodeProps(node, true);
      for (let i = 0; i < props.length; i++) {
        numberNodes(node[props[i]]);
      }
      node._n = pos++;
      nodes.unshift(node);
    }

    let histAbs = new Histogram();
    let histRel = new Histogram();

    function analyzeRefs(node) {
      if (self.visited(node)) {
        return;
      }
      let props = self.nodeProps(node, true);
      for (let i = 0; i < props.length; i++) {
        let prop = props[i];
        let ref = node._n - node[prop]._n - 1;
        // Count the number of single-character relative refs
        if (ref < config.BASE) {
          histRel.add(ref);
        }
        // Count the number of characters saved by converting an absolute
        // reference to a one-character symbol.
        histAbs.add(node[prop]._n, fns.toAlphaCode(ref).length - 1);
        analyzeRefs(node[prop]);
      }
    }

    function symbolCount() {
      histAbs = histAbs.highest(config.BASE);
      let savings = [];
      savings[-1] = 0;
      let best = 0,
        sCount = 0;
      let defSize = 3 + fns.toAlphaCode(nodeCount).length;
      for (let sym = 0; sym < config.BASE; sym++) {
        if (histAbs[sym] === undefined) {
          break;
        }
        savings[sym] = histAbs[sym][1] - defSize -
        histRel.countOf(config.BASE - sym - 1) +
        savings[sym - 1];
        if (savings[sym] >= best) {
          best = savings[sym];
          sCount = sym + 1;
        }
      }
      return sCount;
    }

    numberNodes(this.root, 0);
    nodeCount = nodes.length;

    this.prepDFS();
    analyzeRefs(this.root);
    symCount = symbolCount();
    for (let sym = 0; sym < symCount; sym++) {
      syms[histAbs[sym][0]] = fns.toAlphaCode(sym);
    }
    for (let i = 0; i < nodeCount; i++) {
      nodes[i] = nodeLine(nodes[i]);
    }
    // Prepend symbols
    for (let sym = symCount - 1; sym >= 0; sym--) {
      nodes.unshift(fns.toAlphaCode(sym) + ':' +
        fns.toAlphaCode(nodeCount - histAbs[sym][0] - 1));
    }

    return nodes.join(config.NODE_SEP);
  }
}

module.exports = Trie;
