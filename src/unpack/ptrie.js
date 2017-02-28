'use strict';
const config = require('../config');
const fns = require('../fns');

const reNodePart = new RegExp('([^A-Z0-9,]+)([A-Z0-9,]+|$)', 'g'); //( , is STRING_SEP)

//are we on the right path with this prefex?
const isPrefix = function(str, want) {
  if (str === want) {
    return true;
  }
  if (str.length >= want.length) {
    return false;
  }
  let len = str.length;
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
class PackedTrie {
  constructor(str) {
    this.nodes = str.split(config.NODE_SEP);
    this.syms = [];
    this.symCount = 0;
    //some tries dont even have symbols
    if (str.match(':')) {
      this.initSymbols();
    }
  }

  initSymbols() {
    //the symbols are at the top of the array.
    //... process these lines, if they exist
    const reSymbol = new RegExp('([0-9A-Z]+):([0-9A-Z]+)');
    for(let i = 0; i < this.nodes.length; i++) {
      let m = reSymbol.exec(this.nodes[i]);
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
  has(word) {
    let found = false;

    function fn(w) {
      if (w === word) {
        found = true;
      }
    }

    let context = {
      want: word,
      beyond: word + 'a',
      fn: fn,
      found: found
    };
    this.enumerate(0, '', context);
    return found;
  }

  // Enumerate words in dictionary.  Two modes:
  //
  // ctx.prefixes: Just enumerate terminal strings that are
  // prefixes of 'from'.
  //
  // !ctx.prefixes: Enumerate all words s.t.:
  //
  //    ctx.from <= word < ctx.beyond
  //
  enumerate(inode, prefix, ctx) {
    let node = this.nodes[inode];
    let self = this;

    function emit(word) {
      if (isPrefix(word, ctx.want)) {
        ctx.fn(word);
        ctx.found = true;
      }
    }

    //the '!' means it includes a prefix
    if (node[0] === '!') {
      emit(prefix);
      node = node.slice(1); //remove it
    }

    //not a replace, but a loop through matches
    node.replace(reNodePart, function(_, str, ref) {
      let match = prefix + str;

      // Done or no possible future match from str
      if (!isPrefix(match, ctx.want)) {
        return;
      }

      //we're at the end of this branch
      if (ref === ',' || ref === '') {
        emit(match);
        return;
      }
      //do the next one
      self.enumerate(self.inodeFromRef(ref, inode), match, ctx);
    });
  // console.log(tmp === node);
  }

  // References are either absolute (symbol) or relative (1 - based)
  inodeFromRef(ref, inode) {
    let dnode = fns.fromAlphaCode(ref);
    if (dnode < this.symCount) {
      return this.syms[dnode];
    }
    return inode + dnode + 1 - this.symCount;
  }


}

module.exports = PackedTrie;
