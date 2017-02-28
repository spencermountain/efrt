'use strict';
const Histogram = require('./histogram');
const config = require('../config');
const fns = require('../fns');
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

  let props = self.nodeProps(node);
  for (let i = 0; i < props.length; i++) {
    let prop = props[i];
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
    let ref = fns.toAlphaCode(node._n - node[prop]._n - 1 + self.symCount);
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
  let props = self.nodeProps(node, true);
  for (let i = 0; i < props.length; i++) {
    let prop = props[i];
    let ref = node._n - node[prop]._n - 1;
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


const symbolCount = function(self) {
  self.histAbs = self.histAbs.highest(config.BASE);
  let savings = [];
  savings[-1] = 0;
  let best = 0,
    sCount = 0;
  let defSize = 3 + fns.toAlphaCode(self.nodeCount).length;
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

const pack = function(self) {
  let nodes = [];
  self.nodeCount = 0;
  self.syms = {};
  self.symCount = 0;
  let pos = 0;

  // Make sure we've combined all the common suffixes
  self.optimize();


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

  self.histAbs = new Histogram();
  self.histRel = new Histogram();

  numberNodes(self.root, 0);
  self.nodeCount = nodes.length;

  self.prepDFS();
  analyzeRefs(self, self.root);
  self.symCount = symbolCount(self);
  for (let sym = 0; sym < self.symCount; sym++) {
    self.syms[self.histAbs[sym][0]] = fns.toAlphaCode(sym);
  }
  for (let i = 0; i < self.nodeCount; i++) {
    nodes[i] = nodeLine(self, nodes[i]);
  }
  // Prepend symbols
  for (let sym = self.symCount - 1; sym >= 0; sym--) {
    nodes.unshift(fns.toAlphaCode(sym) + ':' +
      fns.toAlphaCode(self.nodeCount - self.histAbs[sym][0] - 1));
  }

  return nodes.join(config.NODE_SEP);
};

module.exports = pack;
