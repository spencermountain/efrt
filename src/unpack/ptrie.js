'use strict';
const config = require('../config');
const fns = require('../fns');

// const reNodePart = new RegExp('([^A-Z0-9,]+)([A-Z0-9,]+|$)', 'g'); //( , is STRING_SEP)

//are we on the right path with this string?
const isPrefix = function(str, want) {
  //allow ==
  if (str === want) {
    return true;
  }
  let len = str.length;
  if (len > want.length) {
    return false;
  }
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
  has(want) {
    // console.log(this.nodes);
    //fail-fast
    if (!want) {
      return false;
    }
    const crawl = (inode, prefix) => {
      let node = this.nodes[inode];

      //the '!' means it includes a prefix
      if (node[0] === '!') {
        if (prefix === want) {
          return true;
        }
        node = node.slice(1); //remove it
      }
      if (node === want) {
        return true;
      }

      let matches = node.split(/([A-Z0-9,]+)/g);
      for (let i = 0; i < matches.length; i += 2) {
        let str = matches[i];
        let ref = matches[i + 1];
        let have = prefix + str;
        // console.log('  ---=-=--------  ' + have);
        //at the end, so try it out
        if (ref === ',' || ref === undefined) {
          if (have === want) {
            return true;
          }
          continue;
        }
        // Done or no possible future match from str
        if (!isPrefix(have, want)) {
          // console.log('continue');
          continue;
        }
        //we're at the end of this branch
        // if (ref === ',' || ref === undefined) {
        //   return false;
        // }
        //otherwise, do the next one
        inode = this.inodeFromRef(ref, inode);
        return crawl(inode, have);
      }
      return false;
    };
    return crawl(0, '');
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
