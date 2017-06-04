'use strict';
const parseSymbols = require('./symbols');
const encoding = require('../encoding');

// References are either absolute (symbol) or relative (1 - based)
const indexFromRef = function(trie, ref, index) {
  const dnode = encoding.fromAlphaCode(ref);
  if (dnode < trie.symCount) {
    return trie.syms[dnode];
  }
  return index + dnode + 1 - trie.symCount;
};

const toArray = function(trie) {
  let all = [];
  const crawl = (index, pref) => {
    let node = trie.nodes[index];
    if (node[0] === '!') {
      all.push(pref);
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
        all.push(have);
        continue;
      }
      let newIndex = indexFromRef(trie, ref, index);
      crawl(newIndex, have);
    }
  };
  crawl(0, '');
  return all;
};

//PackedTrie - Trie traversal of the Trie packed-string representation.
const unpack = function(str) {
  let trie = {
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
