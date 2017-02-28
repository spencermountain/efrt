(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.unpack = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

module.exports = {
  NODE_SEP: ';',
  STRING_SEP: ',',
  TERMINAL_PREFIX: '!',
  BASE: 36
};

},{}],2:[function(_dereq_,module,exports){
'use strict';

var config = _dereq_('./config');

// 0, 1, 2, ..., A, B, C, ..., 00, 01, ... AA, AB, AC, ..., AAA, AAB, ...
var toAlphaCode = function toAlphaCode(n) {
  var places,
      range,
      s = '',
      d;

  for (places = 1, range = config.BASE; n >= range; n -= range, places++, range *= config.BASE) {}

  while (places--) {
    d = n % config.BASE;
    s = String.fromCharCode((d < 10 ? 48 : 55) + d) + s;
    n = (n - d) / config.BASE;
  }
  return s;
};

var fromAlphaCode = function fromAlphaCode(s) {
  var n = 0,
      places,
      range,
      pow,
      i,
      d;

  for (places = 1, range = config.BASE; places < s.length; n += range, places++, range *= config.BASE) {}

  for (i = s.length - 1, pow = 1; i >= 0; i--, pow *= config.BASE) {
    d = s.charCodeAt(i) - 48;
    if (d > 10) {
      d -= 7;
    }
    n += d * pow;
  }
  return n;
};

/* Sort elements and remove duplicates from array (modified in place) */
var unique = function unique(a) {
  a.sort();
  for (var i = 1; i < a.length; i++) {
    if (a[i - 1] === a[i]) {
      a.splice(i, 1);
    }
  }
};

var commonPrefix = function commonPrefix(w1, w2) {
  var len = Math.min(w1.length, w2.length);
  while (len > 0) {
    var prefix = w1.slice(0, len);
    if (prefix === w2.slice(0, len)) {
      return prefix;
    }
    len -= 1;
  }
  return '';
};

module.exports = {
  toAlphaCode: toAlphaCode,
  fromAlphaCode: fromAlphaCode,
  unique: unique,
  commonPrefix: commonPrefix
};

},{"./config":1}],3:[function(_dereq_,module,exports){
'use strict';

var Ptrie = _dereq_('./ptrie');

var unpack = function unpack(str) {
  return new Ptrie(str);
};
module.exports = unpack;

},{"./ptrie":4}],4:[function(_dereq_,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var config = _dereq_('../config');
var fns = _dereq_('../fns');
var reNodePart = new RegExp('([a-z ]+)(' + config.STRING_SEP + '|[0-9A-Z]+|$)', 'g');
var reSymbol = new RegExp('([0-9A-Z]+):([0-9A-Z]+)');
var MAX_WORD = 'zzzzzzzzzz';
/*
  PackedTrie - Trie traversal of the Trie packed-string representation.
  Usage:
      ptrie = new PackedTrie(<string> compressed);
      bool = ptrie.isWord(word);
      longestWord = ptrie.match(string);
      matchArray = ptrie.matches(string);
      wordArray = ptrie.words(from, beyond, limit);
      ptrie.enumerate(inode, prefix, context);
*/

// Implement isWord given a packed representation of a Trie.

var PackedTrie = function () {
  function PackedTrie(pack) {
    _classCallCheck(this, PackedTrie);

    this.nodes = pack.split(config.NODE_SEP);
    this.syms = [];
    this.symCount = 0;
    while (true) {
      var m = reSymbol.exec(this.nodes[0]);
      if (!m) {
        break;
      }
      this.syms[fns.fromAlphaCode(m[1])] = fns.fromAlphaCode(m[2]);
      this.symCount++;
      this.nodes.shift();
    }
  }

  _createClass(PackedTrie, [{
    key: 'has',
    value: function has(word) {
      if (word === '') {
        return false;
      }
      return this.match(word) === word;
    }

    // Return largest matching string in the dictionary (or '')

  }, {
    key: 'match',
    value: function match(word) {
      var matches = this.matches(word);
      if (matches.length === 0) {
        return '';
      }
      return matches[matches.length - 1];
    }

    // Return array of all the prefix matches in the dictionary

  }, {
    key: 'matches',
    value: function matches(word) {
      return this.words(word, word + 'a');
    }

    // Largest possible word in the dictionary - hard coded for now

  }, {
    key: 'max',
    value: function max() {
      return MAX_WORD;
    }

    // words() - return all strings in dictionary - same as words('')
    // words(string) - return all words with prefix
    // words(string, limit) - limited number of words
    // words(string, beyond) - max (alphabetical) word
    // words(string, beyond, limit)

  }, {
    key: 'words',
    value: function words(from, beyond, limit) {
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

      this.enumerate(0, '', {
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

  }, {
    key: 'enumerate',
    value: function enumerate(inode, prefix, ctx) {
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

      if (node[0] === config.TERMINAL_PREFIX) {
        emit(prefix);
        if (ctx.abort) {
          return;
        }
        node = node.slice(1);
      }

      node.replace(reNodePart, function (w, str, ref) {
        var match = prefix + str;

        // Done or no possible future match from str
        if (ctx.abort || match >= ctx.beyond || match < ctx.from.slice(0, match.length)) {
          return;
        }

        var isTerminal = ref === config.STRING_SEP || ref === '';

        if (isTerminal) {
          emit(match);
          return;
        }

        self.enumerate(self.inodeFromRef(ref, inode), match, ctx);
      });
    }

    // References are either absolute (symbol) or relative (1 - based)

  }, {
    key: 'inodeFromRef',
    value: function inodeFromRef(ref, inode) {
      var dnode = fns.fromAlphaCode(ref);
      if (dnode < this.symCount) {
        return this.syms[dnode];
      }
      return inode + dnode + 1 - this.symCount;
    }

    // Increment a string one beyond any string with the current prefix

  }, {
    key: 'beyond',
    value: function beyond(s) {
      if (s.length === 0) {
        return this.max();
      }
      var asc = s.charCodeAt(s.length - 1);
      return s.slice(0, -1) + String.fromCharCode(asc + 1);
    }
  }]);

  return PackedTrie;
}();

module.exports = PackedTrie;

},{"../config":1,"../fns":2}]},{},[3])(3)
});