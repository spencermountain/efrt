import Histogram from './histogram.js'
import encoding from '../encoding.js'
import dictionary from './dictionary.js'
import fns from './fns.js'
import escapeLabel from './escape.js'

const config = {
  NODE_SEP: ';',
  KEY_VAL: ':',
  STRING_SEP: ',',
  TERMINAL_PREFIX: '!',
  BASE: 36
}
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
    sep = ''
  if (self.isTerminal(node)) {
    line += config.TERMINAL_PREFIX
  }
  const props = self.nodeProps(node)
  for (let i = 0; i < props.length; i++) {
    const prop = props[i]
    const child = node.edges[prop]
    if (typeof child === 'number') {
      line += sep + label(prop)
      sep = config.STRING_SEP
      continue
    }
    if (self.syms[child._n]) {
      line += sep + label(prop) + self.syms[child._n]
      sep = ''
      continue
    }
    let ref = encoding.toAlphaCode(node._n - child._n - 1 + self.symCount)
    // Only inline a complete terminal suffix. A singleton can still point
    // to another node; checking the parent would silently truncate that path.
    if (child._g && ref.length >= child._g.length && child.edges[child._g] === 1) {
      ref = child._g
      line += sep + label(prop + ref)
      sep = config.STRING_SEP
      continue
    }
    line += sep + label(prop) + ref
    sep = ''
  }
  return line
}

const analyzeRefs = function (self, node) {
  if (self.visited(node)) {
    return
  }
  const props = self.nodeProps(node, true)
  for (let i = 0; i < props.length; i++) {
    const prop = props[i]
    const child = node.edges[prop]
    const ref = node._n - child._n - 1
    // Count the number of single-character relative refs
    if (ref < config.BASE) {
      self.histRel.add(ref)
    }
    // Count the number of characters saved by converting an absolute
    // reference to a one-character symbol.
    self.histAbs.add(child._n, encoding.toAlphaCode(ref).length - 1)
    analyzeRefs(self, child)
  }
}

const symbolCount = function (self) {
  self.histAbs = self.histAbs.highest(config.BASE)
  const savings = []
  savings[-1] = 0
  let best = 0,
    sCount = 0
  const defSize = 3 + encoding.toAlphaCode(self.nodeCount).length
  for (let sym = 0; sym < config.BASE; sym++) {
    if (self.histAbs[sym] === undefined) {
      break
    }
    savings[sym] =
      self.histAbs[sym][1] -
      defSize -
      self.histRel.countOf(config.BASE - sym - 1) +
      savings[sym - 1]
    if (savings[sym] >= best) {
      best = savings[sym]
      sCount = sym + 1
    }
  }
  return sCount
}

const numberNodes = function (self, node) {
  // Topological sort into nodes array
  if (node._n !== undefined) {
    return
  }
  const props = self.nodeProps(node, true)
  for (let i = 0; i < props.length; i++) {
    numberNodes(self, node.edges[props[i]]) //recursive
  }
  node._n = self.pos++
  self.nodes.push(node)
}

const pack = function (self, useDictionary = false, versioned = false) {
  const encodeLabel = versioned ? escapeLabel : (text) => text
  self.nodes = []
  self.nodeCount = 0
  self.syms = {}
  self.symCount = 0
  self.pos = 0
  // Make sure we've combined all the common suffixes
  self.optimize()
  self.histAbs = new Histogram()
  self.histRel = new Histogram()
  numberNodes(self, self.root)
  self.nodes.reverse()
  self.nodeCount = self.nodes.length
  self.prepDFS()
  analyzeRefs(self, self.root)
  self.symCount = symbolCount(self)
  for (let sym = 0; sym < self.symCount; sym++) {
    self.syms[self.histAbs[sym][0]] = encoding.toAlphaCode(sym)
  }
  const labels = []
  const lines = self.nodes.map((node) => nodeLine(self, node, (text) => {
    if (useDictionary) {
      labels.push(text)
    }
    return encodeLabel(text)
  }))
  const symbols = []
  // Prepend symbols
  for (let sym = self.symCount - 1; sym >= 0; sym--) {
    symbols.unshift(
      encoding.toAlphaCode(sym) +
        config.KEY_VAL +
        encoding.toAlphaCode(self.nodeCount - self.histAbs[sym][0] - 1)
    )
  }
  const plain = symbols.concat(lines).join(config.NODE_SEP)
  if (useDictionary) {
    const dict = dictionary(labels, encodeLabel)
    if (dict.header) {
      const encoded = dict.header + symbols.concat(
        self.nodes.map((node) => nodeLine(self, node, (text) => encodeLabel(dict.encode(text))))
      ).join(config.NODE_SEP)
      if (fns.utf8Length(encoded) < fns.utf8Length(plain)) {
        return encoded
      }
    }
  }
  return plain
}

export default pack
