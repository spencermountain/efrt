'use strict';
const config = require('../config');
const fns = require('../fns');
const isPrefix = require('./prefix');

//PackedTrie - Trie traversal of the Trie packed-string representation.
class PackedTrie {
  constructor(str) {
    this.nodes = str.split(config.NODE_SEP); //that's all ;)!
    this.syms = [];
    this.symCount = 0;
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
      let letPrefix = false;
      //the '!' means a prefix-alone is a good match
      if (node[0] === '!') {
        //try to match the prefix (the last branch)
        if (prefix === want) {
          return true;
        }
        letPrefix = true;
        node = node.slice(1); //ok, we tried. remove it.
      }
      //each possible match on this line is something like 'me,me2,me4'.
      //try each one
      let matches = node.split(/([A-Z0-9,]+)/g);
      for (let i = 0; i < matches.length; i += 2) {
        let str = matches[i];
        let ref = matches[i + 1];
        if (!str) {
          continue;
        }
        let have = prefix + str;
        // console.log('  --- ' + str + ', ' + ref);
        //we're at the branch's end, so try to match it
        if (ref === ',' || ref === undefined) {
          if (have === want) {
            // console.log('::end');
            return true;
          }
          continue;
        }
        //ok, not a match.
        //well, should we keep going on this branch?
        //if we do, we ignore all the others here.
        if (isPrefix(have, want)) {
          inode = this.inodeFromRef(ref, inode);
          return crawl(inode, have);
        }
        //nah, lets try the next branch..
        continue;
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
