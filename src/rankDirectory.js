'use strict';
const BitString = require('./unpack/bitString');
const BitWriter = require('./pack/bitWriter');
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
class RankDirectory {
  constructor( directoryData, bitData, numBits, l1Size, l2Size ) {
    this.directory = new BitString(directoryData);
    this.data = new BitString(bitData);
    this.l1Size = l1Size;
    this.l2Size = l2Size;
    this.l1Bits = Math.ceil(Math.log(numBits) / Math.log(2));
    this.l2Bits = Math.ceil(Math.log(l1Size) / Math.log(2));
    this.sectionBits = (l1Size / l2Size - 1) * this.l2Bits + this.l1Bits;
    this.numBits = numBits;
  }

  /**
      Returns the string representation of the directory.
   */
  getData() {
    return this.directory.getData();
  }

  /**
    Returns the number of 1 or 0 bits (depending on the "which" parameter) to
    to and including position x.
    */
  rank( which, x ) {

    if (which === 0) {
      return x - this.rank(1, x) + 1;
    }

    var rank = 0;
    var o = x;
    var sectionPos = 0;

    if (o >= this.l1Size) {
      sectionPos = (o / this.l1Size | 0) * this.sectionBits;
      rank = this.directory.get(sectionPos - this.l1Bits, this.l1Bits);
      o = o % this.l1Size;
    }

    if (o >= this.l2Size) {
      sectionPos += (o / this.l2Size | 0) * this.l2Bits;
      rank += this.directory.get(sectionPos - this.l2Bits, this.l2Bits);
    }

    rank += this.data.count(x - x % this.l2Size, x % this.l2Size + 1);

    return rank;
  }

  /**
    Returns the position of the y'th 0 or 1 bit, depending on the "which"
    parameter.
    */
  select( which, y ) {
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
}

//static
RankDirectory.Create = function( data, numBits, l1Size, l2Size ) {
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
