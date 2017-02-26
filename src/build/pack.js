'use strict';
const Histogram = require('./histogram');
const config = require('../config');
const fns = require('../fns');
// Return packed representation of Trie as a string.

function analyzeRefs(self, node, histAbs, histRel) {
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
    analyzeRefs(self, node[prop], histAbs, histRel);
  }
}

function symbolCount(histAbs, histRel, nodeCount) {
  histAbs = histAbs.highest(config.BASE);
  let savings = [];
  savings[-1] = 0;
  let best = 0;
  let symbCount = 0;
  let defSize = 3 + fns.toAlphaCode(nodeCount).length;
  for (let sym = 0; sym < config.BASE; sym++) {
    if (histAbs[sym] === undefined) {
      break;
    }
    // Cumulative savings of:
    //   saved characters in refs
    //   minus definition size
    //   minus relative size wrapping to 2 digits
    savings[sym] = histAbs[sym][1] - defSize -
    histRel.countOf(config.BASE - sym - 1) +
    savings[sym - 1];
    // console.log('savings[' + sym + '] ' + savings[sym] + ' = ' +
    //   savings[sym - 1] + ' +' +
    //   histAbs[sym][1] + ' - ' + defSize + ' - ' +
    //   histRel.countOf(config.BASE - sym - 1) + ')');
    if (savings[sym] >= best) {
      best = savings[sym];
      symbCount = sym + 1;
    }
  }
  return symbCount;
}



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
const pack = (self) => {
  let nodes = [];
  let nodeCount;
  let syms = {};
  let symCount;
  let pos = 0;

  // Make sure we've combined all the common suffixes
  self.optimize();

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


  numberNodes(self.root, 0);
  nodeCount = nodes.length;

  self.prepDFS();
  analyzeRefs(self, self.root, histAbs, histRel);
  symCount = symbolCount(histAbs, histRel, nodeCount);
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
module.exports = pack
