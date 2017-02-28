'use strict';
const BitWriter = require('./bitWriter');

/*
 A Succinct Trie for Javascript

 By Steve Hanov
 Released to the public domain.

 This file contains functions for creating a succinctly encoded trie structure
 from a list of words. The trie is encoded to a succinct bit string using the
 method of Jacobson (1989). The bitstring is then encoded using BASE-64.

 The resulting trie does not have to be decoded to be used. This file also
 contains functions for looking up a word in the BASE-64 encoded data, in
 O(mlogn) time, where m is the number of letters in the target word, and n is
 the number of nodes in the trie.

 Objects for encoding:

 TrieNode
 Trie
 BitWriter

 Objects for decoding:
 BitString
 FrozenTrieNode
 FrozenTrie

 QUICK USAGE:

 Suppose we let data be some output of the demo encoder:

 var data = {
    "nodeCount": 37,
    "directory": "BMIg",
    "trie": "v2qqqqqqqpIUn4A5JZyBZ4ggCKh55ZZgBA5ZZd5vIEl1wx8g8A"
 };

 var frozenTrie = new FrozenTrie( Data.trie, Data.directory, Data.nodeCount);

 alert( frozenTrie.has( "hello" ) ); // outputs true
 alert( frozenTrie.has( "kwijibo" ) ); // outputs false

*/




/**
  A Trie node, for use in building the encoding trie. This is not needed for
  the decoder.
  */
class TrieNode {
  constructor( letter ) {
    this.letter = letter;
    this.final = false;
    this.children = [];
  }
}

class Trie {
  constructor() {
    this.previousWord = '';
    this.root = new TrieNode(' ');
    this.cache = [this.root];
    this.nodeCount = 1;
  }

  /**
    Returns the number of nodes in the trie
   */
  getNodeCount() {
    return this.nodeCount;
  }

  /**
    Inserts a word into the trie. This function is fastest if the words are
    inserted in alphabetical order.
   */
  insert( word ) {

    var commonPrefix = 0;
    for(var i = 0; i < Math.min(word.length, this.previousWord.length);
      i++) {
      if (word[i] !== this.previousWord[i]) {
        break;
      }
      commonPrefix += 1;
    }

    this.cache.length = commonPrefix + 1;
    var node = this.cache[this.cache.length - 1];

    for(i = commonPrefix; i < word.length; i++) {
      var next = new TrieNode(word[i]);
      this.nodeCount++;
      node.children.push(next);
      this.cache.push(next);
      node = next;
    }

    node.final = true;
    this.previousWord = word;
  }

  /**
    Apply a function to each node, traversing the trie in level order.
    */
  apply( fn ) {
    var level = [this.root];
    while (level.length > 0) {
      var node = level.shift();
      for(var i = 0; i < node.children.length; i++) {
        level.push(node.children[i]);
      }
      fn(node);
    }

  }

  /**
    Encode the trie and all of its nodes. Returns a string representing the
    encoded data.
    */
  encode() {
    // Write the unary encoding of the tree in level order.
    var bits = new BitWriter();
    //'start' indicator
    bits.write(0x02, 2);
    this.apply(function( node ) {
      for(var i = 0; i < node.children.length; i++) {
        bits.write(1, 1);
      }
      bits.write(0, 1);
    });

    // Write the data for each node, using 6 bits for node. 1 bit stores
    // the "final" indicator. The other 5 bits store one of the 26 letters
    // of the alphabet.
    var a = 'a'.charCodeAt(0);
    this.apply(function( node ) {
      var value = node.letter.charCodeAt(0) - a;
      // console.log(node.letter + ' ' + node.letter.charCodeAt(0) + '  ' + value);
      if (node.final) {
        value |= 0x20;
      }
      bits.write(value, 6);
    });

    return bits.getData();
  }
}



module.exports = Trie;
