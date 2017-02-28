'use strict';
const config = require('../config');
const fns = require('../fns');

const reNodePart = new RegExp('([^A-Z0-9,]+)([A-Z0-9,]+|$)', 'g'); //( , is STRING_SEP)

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
    let matches = this.words(word);
    if (matches.length === 0) {
      return false;
    }
    return matches[matches.length - 1] === word;
  }

  // words() - return all strings in dictionary - same as words('')
  // words(string) - return all words with prefix
  // words(string, limit) - limited number of words
  // words(string, beyond) - max (alphabetical) word
  // words(string, beyond, limit)
  words(word) {
    let words = [];
    let beyond = word + 'a';
    let limit = 8;

    function catchWords(w) {
      if (words.length >= limit) {
        this.abort = true;
        return;
      }
      words.push(w);
    }

    let context = {
      from: word,
      beyond: beyond,
      fn: catchWords,
      prefixes: word + 'a' === beyond
    };
    this.enumerate(0, '', context);
    return words;
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
      if (ctx.prefixes) {
        if (word === ctx.from.slice(0, word.length)) {
          ctx.fn(word);
        }
        return;
      }
      if (ctx.from <= word && word < ctx.beyond) {
        ctx.fn(word);
      }
    }

    if (node[0] === config.TERMINAL_PREFIX) {
      emit(prefix);
      if (ctx.abort) {
        return;
      }
      node = node.slice(1);
    }

    //not a replace, but a loop through matches
    node.replace(reNodePart, function(_, str, ref) {
      let match = prefix + str;

      // Done or no possible future match from str
      if (ctx.abort ||
        match >= ctx.beyond ||
        match < ctx.from.slice(0, match.length)) {
        return;
      }

      let isTerminal = ref === config.STRING_SEP || ref === '';

      if (isTerminal) {
        // console.log('::terminal' + str + '\n');
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
