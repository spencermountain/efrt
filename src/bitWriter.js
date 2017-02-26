'use strict';
const config = require('./config');
const W = config.W;

// Configure the bit writing and reading functions to work natively in BASE-64
// encoding. That way, we don't have to convert back and forth to bytes.

var BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
/**
    Returns the character unit that represents the given value. If this were
    binary data, we would simply return id.
 */
function CHR(id){
  return BASE64[id];
}

/**
    The BitWriter will create a stream of bytes, letting you write a certain
    number of bits at a time. This is part of the encoder, so it is not
    optimized for memory or speed.
*/
class BitWriter {
  constructor() {
    this.init();
  }

  init() {
    this.bits = [];
  }

  /**
      Write some data to the bit string. The number of bits must be 32 or
      fewer.
  */
  write( data, numBits ) {
    for(var i = numBits - 1; i >= 0; i--) {
      if (data & (1 << i)) {
        this.bits.push(1);
      } else {
        this.bits.push(0);
      }
    }
  }

  /**
      Get the bitstring represented as a javascript string of bytes
  */
  getData() {
    var chars = [];
    var b = 0;
    var i = 0;

    for (var j = 0; j < this.bits.length; j++) {
      b = (b << 1) | this.bits[j];
      i += 1;
      if (i === W) {
        chars.push(CHR(b));
        i = b = 0;
      }
    }

    if (i) {
      chars.push(CHR(b << (W - i)));
    }

    return chars.join('');
  }

  /**
      Returns the bits as a human readable binary string for debugging
   */
  getDebugString(group) {
    var chars = [];
    var i = 0;

    for(var j = 0; j < this.bits.length; j++) {
      chars.push('' + this.bits[j]);
      i++;
      if (i === group) {
        chars.push(' ');
        i = 0;
      }
    }

    return chars.join('');
  }
}
module.exports = BitWriter;
