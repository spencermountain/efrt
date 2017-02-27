(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.unpack = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

module.exports = {
  L1: 1024, //(32 * 32)
  L2: 32,
  /**
      The width of each unit of the encoding, in bits. Here we use 6, for base-64
      encoding.
   */
  W: 6,
  //base-64
  chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
};

},{}],2:[function(_dereq_,module,exports){
'use strict';
//NOTHING TO SEE HERE, PLEASE LOOK AT THE FLOOR
//really, nothing interesting in this file

//elite programming!

var funMapping = {
  0: 'qxq', //0
  1: 'qzq', //1
  2: 'qxz', //2
  3: 'qqx', //3
  4: 'qqz', //4
  5: 'xqz', //5
  6: 'xqx', //6
  7: 'xqq', //7
  8: 'zxq', //8
  9: 'zqx', //9
  ' ': 'zzx', //' '
  '\'': 'zzq' //'
};

// look, umm
var normalize = function normalize(str) {
  //ok..
  str = str.replace(/[0-9 ']/g, function (c) {
    return funMapping[c];
  });
  return str;
};

module.exports = normalize;
// console.log(normalize('b52\'s'));

},{}],3:[function(_dereq_,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var config = _dereq_('../config');
var W = config.W;
var BASE64 = config.chars;

// Configure the bit writing and reading functions to work natively in BASE-64
// encoding. That way, we don't have to convert back and forth to bytes.

/**
    Returns the character unit that represents the given value. If this were
    binary data, we would simply return id.
 */
function CHR(id) {
  return BASE64[id];
}

/**
    The BitWriter will create a stream of bytes, letting you write a certain
    number of bits at a time. This is part of the encoder, so it is not
    optimized for memory or speed.
*/

var BitWriter = function () {
  function BitWriter() {
    _classCallCheck(this, BitWriter);

    this.bits = [];
  }
  /**
      Write some data to the bit string. The number of bits must be 32 or
      fewer.
  */


  _createClass(BitWriter, [{
    key: 'write',
    value: function write(data, numBits) {
      for (var i = numBits - 1; i >= 0; i--) {
        if (data & 1 << i) {
          this.bits.push(1);
        } else {
          this.bits.push(0);
        }
      }
    }

    /**
        Get the bitstring represented as a javascript string of bytes
    */

  }, {
    key: 'getData',
    value: function getData() {
      var chars = [];
      var b = 0;
      var i = 0;

      for (var j = 0; j < this.bits.length; j++) {
        b = b << 1 | this.bits[j];
        i += 1;
        if (i === W) {
          chars.push(CHR(b));
          i = b = 0;
        }
      }

      if (i) {
        chars.push(CHR(b << W - i));
      }

      return chars.join('');
    }

    /**
        Returns the bits as a human readable binary string for debugging
     */

  }, {
    key: 'getDebugString',
    value: function getDebugString(group) {
      var chars = [];
      var i = 0;

      for (var j = 0; j < this.bits.length; j++) {
        chars.push('' + this.bits[j]);
        i++;
        if (i === group) {
          chars.push(' ');
          i = 0;
        }
      }

      return chars.join('');
    }
  }]);

  return BitWriter;
}();

module.exports = BitWriter;

},{"../config":1}],4:[function(_dereq_,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BitString = _dereq_('./unpack/bitString');
var BitWriter = _dereq_('./pack/bitWriter');
var config = _dereq_('./config');
var l1Size = 1024;
var l2Size = 32;

/**
    The rank directory allows you to build an index to quickly compute the
    rank() and select() functions. The index can itself be encoded as a binary
    string.
 */
/**
Used to build a rank directory from the given input string.

@param data A javascript string containing the data, as readable using the
BitString object.

@param numBits The number of bits to index.

@param l1Size The number of bits that each entry in the Level 1 table
summarizes. This should be a multiple of l2Size.

@param l2Size The number of bits that each entry in the Level 2 table
summarizes.
*/

var RankDirectory = function () {
  function RankDirectory(directoryData, bitData, numBits) {
    _classCallCheck(this, RankDirectory);

    this.directory = new BitString(directoryData);
    this.data = new BitString(bitData);
    this.l1Bits = Math.ceil(Math.log(numBits) / Math.log(2));
    this.l2Bits = Math.ceil(Math.log(l1Size) / Math.log(2));
    this.sectionBits = (l1Size / l2Size - 1) * this.l2Bits + this.l1Bits;
    this.numBits = numBits;
  }

  /**
      Returns the string representation of the directory.
   */


  _createClass(RankDirectory, [{
    key: 'getData',
    value: function getData() {
      return this.directory.getData();
    }

    /**
      Returns the number of 1 or 0 bits (depending on the "which" parameter) to
      to and including position x.
      */

  }, {
    key: 'rank',
    value: function rank(which, x) {

      if (which === 0) {
        return x - this.rank(1, x) + 1;
      }

      var rank = 0;
      var o = x;
      var sectionPos = 0;

      if (o >= l1Size) {
        sectionPos = (o / l1Size | 0) * this.sectionBits;
        rank = this.directory.get(sectionPos - this.l1Bits, this.l1Bits);
        o = o % l1Size;
      }

      if (o >= l2Size) {
        sectionPos += (o / l2Size | 0) * this.l2Bits;
        rank += this.directory.get(sectionPos - this.l2Bits, this.l2Bits);
      }

      rank += this.data.count(x - x % l2Size, x % l2Size + 1);

      return rank;
    }

    /**
      Returns the position of the y'th 0 or 1 bit, depending on the "which"
      parameter.
      */

  }, {
    key: 'select',
    value: function select(which, y) {
      var high = this.numBits;
      var low = -1;
      var val = -1;

      while (high - low > 1) {
        var probe = (high + low) / 2 | 0;
        var r = this.rank(which, probe);

        if (r === y) {
          // We have to continue searching after we have found it,
          // because we want the _first_ occurrence.
          val = probe;
          high = probe;
        } else if (r < y) {
          low = probe;
        } else {
          high = probe;
        }
      }

      return val;
    }
  }]);

  return RankDirectory;
}();

//static


RankDirectory.Create = function (data, numBits) {
  var bits = new BitString(data);
  var p = 0;
  var i = 0;
  var count1 = 0,
      count2 = 0;
  var l1bits = Math.ceil(Math.log(numBits) / Math.log(2));
  var l2bits = Math.ceil(Math.log(l1Size) / Math.log(2));

  var directory = new BitWriter();

  while (p + l2Size <= numBits) {
    count2 += bits.count(p, l2Size);
    i += l2Size;
    p += l2Size;
    if (i === l1Size) {
      count1 += count2;
      directory.write(count1, l1bits);
      count2 = 0;
      i = 0;
    } else {
      directory.write(count2, l2bits);
    }
  }

  return new RankDirectory(directory.getData(), data, numBits, l1Size, l2Size);
};

module.exports = RankDirectory;

},{"./config":1,"./pack/bitWriter":3,"./unpack/bitString":5}],5:[function(_dereq_,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var config = _dereq_('../config');
var W = config.W;

//Returns the decimal value of the given character unit.
var BASE64 = config.chars.split('').reduce(function (h, c, i) {
  h[c] = i;
  return h;
}, {});

var MaskTop = [0x3f, 0x1f, 0x0f, 0x07, 0x03, 0x01, 0x00];

var BitsInByte = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4, 1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5, 1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7, 1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7, 3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7, 4, 5, 5, 6, 5, 6, 6, 7, 5, 6, 6, 7, 6, 7, 7, 8];

/**
    Given a string of data (eg, in BASE-64), the BitString class supports
    reading or counting a number of bits from an arbitrary position in the
    string.
*/

var BitString = function () {
  function BitString(str) {
    _classCallCheck(this, BitString);

    this.bytes = str;
    this.length = this.bytes.length * W;
  }

  /**
    Returns the internal string of bytes
  */


  _createClass(BitString, [{
    key: 'getData',
    value: function getData() {
      return this.bytes;
    }

    /**
        Returns a decimal number, consisting of a certain number, n, of bits
        starting at a certain position, p.
     */

  }, {
    key: 'get',
    value: function get(p, n) {

      // case 1: bits lie within the given byte
      if (p % W + n <= W) {
        return (BASE64[this.bytes[p / W | 0]] & MaskTop[p % W]) >> W - p % W - n;

        // case 2: bits lie incompletely in the given byte
      } else {
        var result = BASE64[this.bytes[p / W | 0]] & MaskTop[p % W];

        var l = W - p % W;
        p += l;
        n -= l;

        while (n >= W) {
          result = result << W | BASE64[this.bytes[p / W | 0]];
          p += W;
          n -= W;
        }

        if (n > 0) {
          result = result << n | BASE64[this.bytes[p / W | 0]] >> W - n;
        }

        return result;
      }
    }

    /**
        Counts the number of bits set to 1 starting at position p and
        ending at position p + n
     */

  }, {
    key: 'count',
    value: function count(p, n) {

      var count = 0;
      while (n >= 8) {
        count += BitsInByte[this.get(p, 8)];
        p += 8;
        n -= 8;
      }

      return count + BitsInByte[this.get(p, n)];
    }

    /**
        Returns the number of bits set to 1 up to and including position x.
        This is the slow implementation used for testing.
    */

  }, {
    key: 'rank',
    value: function rank(x) {
      var rank = 0;
      for (var i = 0; i <= x; i++) {
        if (this.get(i, 1)) {
          rank++;
        }
      }

      return rank;
    }
  }]);

  return BitString;
}();

module.exports = BitString;

},{"../config":1}],6:[function(_dereq_,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BitString = _dereq_('./bitString');
var RankDirectory = _dereq_('../rankDirectory');
var normalize = _dereq_('../normalize');

/**
  This class is used for traversing the succinctly encoded trie.
  */

var FrozenTrieNode = function () {
  function FrozenTrieNode(trie, index, letter, final, firstChild, childCount) {
    _classCallCheck(this, FrozenTrieNode);

    this.trie = trie;
    this.index = index;
    this.letter = letter;
    this.final = final;
    this.firstChild = firstChild;
    this.childCount = childCount;
  }
  /**
    Returns the FrozenTrieNode for the given child.
    @param index The 0-based index of the child of this node. For example, if
    the node has 5 children, and you wanted the 0th one, pass in 0.
  */


  _createClass(FrozenTrieNode, [{
    key: 'getChild',
    value: function getChild(index) {
      return this.trie.getNodeByIndex(this.firstChild + index);
    }
  }]);

  return FrozenTrieNode;
}();

/**
    The FrozenTrie is used for looking up words in the encoded trie.

    @param data A string representing the encoded trie.

    @param directoryData A string representing the RankDirectory. The global L1
    and L2 constants are used to determine the L1Size and L2size.

    @param nodeCount The number of nodes in the trie.
  */


var FrozenTrie = function () {
  function FrozenTrie(data, directoryData, nodeCount) {
    _classCallCheck(this, FrozenTrie);

    this.data = new BitString(data);
    this.directory = new RankDirectory(directoryData, data, nodeCount * 2 + 1);
    // The position of the first bit of the data in 0th node. In non-root
    // nodes, this would contain 6-bit letters.
    this.letterStart = nodeCount * 2 + 1;
    //cache this
    this.root = this.getNodeByIndex(0);
  }
  /**
     Retrieve the FrozenTrieNode of the trie, given its index in level-order.
     This is a private function that you don't have to use.
    */


  _createClass(FrozenTrie, [{
    key: 'getNodeByIndex',
    value: function getNodeByIndex(index) {
      // retrieve the 6-bit letter.
      var final = this.data.get(this.letterStart + index * 6, 1) === 1;
      var letter = String.fromCharCode(this.data.get(this.letterStart + index * 6 + 1, 5) + 'a'.charCodeAt(0));
      var firstChild = this.directory.select(0, index + 1) - index;

      // Since the nodes are in level order, this nodes children must go up
      // until the next node's children start.
      var childOfNextNode = this.directory.select(0, index + 2) - index - 1;

      return new FrozenTrieNode(this, index, letter, final, firstChild, childOfNextNode - firstChild);
    }

    /**
      Look-up a word in the trie. Returns true if and only if the word exists
      in the trie.
      */

  }, {
    key: 'has',
    value: function has(word) {
      word = normalize(word);
      var node = this.root;
      for (var i = 0; i < word.length; i++) {
        var child;
        var j = 0;
        for (; j < node.childCount; j++) {
          child = node.getChild(j);
          if (child.letter === word[i]) {
            break;
          }
        }
        if (j === node.childCount) {
          return false;
        }
        node = child;
      }

      return node.final;
    }
  }]);

  return FrozenTrie;
}();

module.exports = FrozenTrie;

},{"../normalize":2,"../rankDirectory":4,"./bitString":5}],7:[function(_dereq_,module,exports){
'use strict';

var FrozenTrie = _dereq_('./frozenTrie');
//
var unpack = function unpack(str) {
  var parts = str.split(/\|/g);
  //(data, directoryData, nodeCount), respectively
  var ftrie = new FrozenTrie(parts[0], parts[1], parts[2]);
  return ftrie;
};
module.exports = unpack;

},{"./frozenTrie":6}]},{},[7])(7)
});