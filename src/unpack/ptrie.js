'use strict';
const encoding = require('../encoding');
const isPrefix = require('./prefix');
const unravel = require('./unravel');

//PackedTrie - Trie traversal of the Trie packed-string representation.
class PackedTrie {
  constructor(str) {
    this.nodes = str.split(';'); //that's all ;)!
    this.syms = [];
    this.symCount = 0;
    this._cache = null;
    //process symbols, if they have them
    if (str.match(':')) {
      this.initSymbols();
    }
  }

  //the symbols are at the top of the array.
  initSymbols() {
    //... process these lines
    const reSymbol = new RegExp('([0-9A-Z]+):([0-9A-Z]+)');
    for(let i = 0; i < this.nodes.length; i++) {
      const m = reSymbol.exec(this.nodes[i]);
      if (!m) {
        this.symCount = i;
        break;
      }
      this.syms[encoding.fromAlphaCode(m[1])] = encoding.fromAlphaCode(m[2]);
    }
    //remove from main node list
    this.nodes = this.nodes.slice(this.symCount, this.nodes.length);
  }

  // Return largest matching string in the dictionary (or '')
  has(want) {
    // console.log(this.nodes);
    //fail-fast
    if (!want) {
      return false;
    }
    //then, try cache-lookup
    if (this._cache) {
      return this._cache[want] || false;
    }
    const crawl = (index, prefix) => {
      let node = this.nodes[index];
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
          index = this.indexFromRef(ref, index);
          return crawl(index, have);
        }
        //nah, lets try the next branch..
        continue;
      }

      return false;
    };
    return crawl(0, '');
  }

  // References are either absolute (symbol) or relative (1 - based)
  indexFromRef(ref, index) {
    const dnode = encoding.fromAlphaCode(ref);
    if (dnode < this.symCount) {
      return this.syms[dnode];
    }
    return index + dnode + 1 - this.symCount;
  }

  toArray() {
    if (this._cache) {
      return Object.keys(this._cache);
    }
    return Object.keys(unravel(this));
  }
  cache() {
    this._cache = unravel(this);
    this.nodes = null;
    this.syms = null;
  }

}

module.exports = PackedTrie;
