/* efrt trie-compression v2.0.3  github.com/nlp-compromise/efrt  - MIT */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.unpack = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
'use strict';
const BASE = 36;

const seq = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const cache = seq.split('').reduce(function(h, c, i) {
  h[c] = i;
  return h;
}, {});

// 0, 1, 2, ..., A, B, C, ..., 00, 01, ... AA, AB, AC, ..., AAA, AAB, ...
const toAlphaCode = function(n) {
  if (seq[n] !== undefined) {
    return seq[n];
  }
  let places = 1;
  let range = BASE;
  let s = '';

  for (; n >= range; n -= range, places++, range *= BASE) {
  }
  while (places--) {
    const d = n % BASE;
    s = String.fromCharCode((d < 10 ? 48 : 55) + d) + s;
    n = (n - d) / BASE;
  }
  return s;
};


const fromAlphaCode = function(s) {
  if (cache[s] !== undefined) {
    return cache[s];
  }
  let n = 0;
  let places = 1;
  let range = BASE;
  let pow = 1;

  for (; places < s.length; n += range, places++, range *= BASE) {
  }
  for (let i = s.length - 1; i >= 0; i--, pow *= BASE) {
    let d = s.charCodeAt(i) - 48;
    if (d > 10) {
      d -= 7;
    }
    n += d * pow;
  }
  return n;
};

module.exports = {
  toAlphaCode: toAlphaCode,
  fromAlphaCode: fromAlphaCode
};

},{}],2:[function(_dereq_,module,exports){
'use strict';
const unpack = _dereq_('./unpack');

module.exports = function(str) {
  //turn the weird string into a key-value object again
  let obj = str.split('|').reduce((h, s) => {
    let arr = s.split('¦');
    h[arr[0]] = arr[1];
    return h;
  }, {});
  let all = {};
  Object.keys(obj).forEach(function(cat) {
    let arr = unpack(obj[cat]);
    //special case, for botched-boolean
    if (cat === 'true') {
      cat = true;
    }
    for (var i = 0; i < arr.length; i++) {
      let k = arr[i];
      if (all.hasOwnProperty(k) === true) {
        if (Array.isArray(all[k]) === false) {
          all[k] = [all[k], cat];
        } else {
          all[k].push(cat);
        }
      } else {
        all[k] = cat;
      }
    }
  });
  return all;
};

},{"./unpack":4}],3:[function(_dereq_,module,exports){
'use strict';
const encoding = _dereq_('../encoding');

//the symbols are at the top of the array.
module.exports = function(t) {
  //... process these lines
  const reSymbol = new RegExp('([0-9A-Z]+):([0-9A-Z]+)');
  for(let i = 0; i < t.nodes.length; i++) {
    const m = reSymbol.exec(t.nodes[i]);
    if (!m) {
      t.symCount = i;
      break;
    }
    t.syms[encoding.fromAlphaCode(m[1])] = encoding.fromAlphaCode(m[2]);
  }
  //remove from main node list
  t.nodes = t.nodes.slice(t.symCount, t.nodes.length);
};

},{"../encoding":1}],4:[function(_dereq_,module,exports){
'use strict';
const parseSymbols = _dereq_('./symbols');
const encoding = _dereq_('../encoding');

// References are either absolute (symbol) or relative (1 - based)
const indexFromRef = function(trie, ref, index) {
  const dnode = encoding.fromAlphaCode(ref);
  if (dnode < trie.symCount) {
    return trie.syms[dnode];
  }
  return index + dnode + 1 - trie.symCount;
};

const toArray = function(trie) {
  let all = [];
  const crawl = (index, pref) => {
    let node = trie.nodes[index];
    if (node[0] === '!') {
      all.push(pref);
      node = node.slice(1); //ok, we tried. remove it.
    }
    let matches = node.split(/([A-Z0-9,]+)/g);
    for (let i = 0; i < matches.length; i += 2) {
      let str = matches[i];
      let ref = matches[i + 1];
      if (!str) {
        continue;
      }

      let have = pref + str;
      //branch's end
      if (ref === ',' || ref === undefined) {
        all.push(have);
        continue;
      }
      let newIndex = indexFromRef(trie, ref, index);
      crawl(newIndex, have);
    }
  };
  crawl(0, '');
  return all;
};

//PackedTrie - Trie traversal of the Trie packed-string representation.
const unpack = function(str) {
  let trie = {
    nodes: str.split(';'), //that's all ;)!
    syms: [],
    symCount: 0
  };
  //process symbols, if they have them
  if (str.match(':')) {
    parseSymbols(trie);
  }
  return toArray(trie);
};

module.exports = unpack;

},{"../encoding":1,"./symbols":3}]},{},[2])(2)
});
