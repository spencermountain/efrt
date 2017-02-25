'use strict';

var NODE_SEP = ';',
  STRING_SEP = ',',
  TERMINAL_PREFIX = '!',
  BASE = 36,
  MAX_WORD = 'zzzzzzzzzz';
  /*
    PackedTrie - Trie traversla of the Trie packed-string representation.

    Usage:

        ptrie = new PackedTrie(<string> compressed);
        bool = ptrie.isWord(word);
        longestWord = ptrie.match(string);
        matchArray = ptrie.matches(string);
        wordArray = ptrie.words(from, beyond, limit);
        ptrie.enumerate(inode, prefix, context);
  */

// 0, 1, 2, ..., A, B, C, ..., 00, 01, ... AA, AB, AC, ..., AAA, AAB, ...
const toAlphaCode = function(n) {
  var places,
    range,
    s = '',
    d;

  for (places = 1, range = BASE;
    n >= range;
    n -= range, places++, range *= BASE) {
  }

  while (places--) {
    d = n % BASE;
    s = String.fromCharCode((d < 10 ? 48 : 55) + d) + s;
    n = (n - d) / BASE;
  }
  return s;
};


const fromAlphaCode = function(s) {
  var n = 0,
    places,
    range,
    pow,
    i,
    d;

  for (places = 1, range = BASE;
    places < s.length;
    n += range, places++, range *= BASE) {
  }

  for (i = s.length - 1, pow = 1; i >= 0; i--, pow *= BASE) {
    d = s.charCodeAt(i) - 48;
    if (d > 10) {
      d -= 7;
    }
    n += d * pow;
  }
  return n;
};


var reNodePart = new RegExp('([a-z ]+)(' + STRING_SEP + '|[0-9A-Z]+|$)', 'g');
var reSymbol = new RegExp('([0-9A-Z]+):([0-9A-Z]+)');

// Implement isWord given a packed representation of a Trie.
class PackedTrie {
  constructor(pack) {
    this.nodes = pack.split(NODE_SEP);
    this.syms = [];
    this.symCount = 0;

    while (true) {
      var m = reSymbol.exec(this.nodes[0]);
      if (!m) {
        break;
      }
      this.syms[fromAlphaCode(m[1])] = fromAlphaCode(m[2]);
      this.symCount++;
      this.nodes.shift();
    }

  }

  isWord(word) {
    if (word === '') {
      return false;
    }
    return this.match(word) === word;
  }

  // Return largest matching string in the dictionary (or '')
  match(word) {
    var matches = this.matches(word);
    if (matches.length === 0) {
      return '';
    }
    return matches[matches.length - 1];
  }

  // Return array of all the prefix matches in the dictionary
  matches(word) {
    return this.words(word, word + 'a');
  }

  // Largest possible word in the dictionary - hard coded for now
  max() {
    return MAX_WORD;
  }

  // words() - return all strings in dictionary - same as words('')
  // words(string) - return all words with prefix
  // words(string, limit) - limited number of words
  // words(string, beyond) - max (alphabetical) word
  // words(string, beyond, limit)
  words(from, beyond, limit) {
    var words = [];

    if (from === undefined) {
      from = '';
    }

    if (typeof beyond === 'number') {
      limit = beyond;
      beyond = undefined;
    }

    // By default list all words with 'from' as prefix
    if (beyond === undefined) {
      beyond = this.beyond(from);
    }

    function catchWords(word) {
      if (words.length >= limit) {
        this.abort = true;
        return;
      }
      words.push(word);
    }

    this.enumerate(0, '',
      {
        from: from,
        beyond: beyond,
        fn: catchWords,
        prefixes: from + 'a' === beyond
      });
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
    var node = this.nodes[inode];
    var self = this;

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

    if (node[0] === TERMINAL_PREFIX) {
      emit(prefix);
      if (ctx.abort) {
        return;
      }
      node = node.slice(1);
    }

    node.replace(reNodePart, function (w, str, ref) {
      var match = prefix + str;

      // Done or no possible future match from str
      if (ctx.abort ||
        match >= ctx.beyond ||
        match < ctx.from.slice(0, match.length)) {
        return;
      }

      var isTerminal = ref === STRING_SEP || ref === '';

      if (isTerminal) {
        emit(match);
        return;
      }

      self.enumerate(self.inodeFromRef(ref, inode), match, ctx);
    });
  }

  // References are either absolute (symbol) or relative (1 - based)
  inodeFromRef(ref, inode) {
    var dnode = fromAlphaCode(ref);
    if (dnode < this.symCount) {
      return this.syms[dnode];
    }
    return inode + dnode + 1 - this.symCount;
  }

  // Increment a string one beyond any string with the current prefix
  beyond(s) {
    if (s.length === 0) {
      return this.max();
    }
    var asc = s.charCodeAt(s.length - 1);
    return s.slice(0, -1) + String.fromCharCode(asc + 1);
  }

}

module.exports = {
  'PackedTrie': PackedTrie,
  'NODE_SEP': NODE_SEP,
  'STRING_SEP': STRING_SEP,
  'TERMINAL_PREFIX': TERMINAL_PREFIX,
  'toAlphaCode': toAlphaCode,
  'fromAlphaCode': fromAlphaCode,
  'BASE': BASE
};
