'use strict';

class Histogram {
  constructor() {
    this.counts = {};
  }
  init(sym) {
    if (this.counts[sym] === undefined) {
      this.counts[sym] = 0;
    }
  }
  add(sym, n) {
    if (n === undefined) {
      n = 1;
    }
    this.init(sym);
    this.counts[sym] += n;
  }
  change(symNew, symOld, n) {
    if (n === undefined) {
      n = 1;
    }
    this.add(symOld, -n);
    this.add(symNew, n);
  }
  countOf(sym) {
    this.init(sym);
    return this.counts[sym];
  }
  highest(top) {
    let sorted = [];
    let keys = Object.keys(this.counts);
    for(let i = 0; i < keys.length; i++) {
      let sym = keys[i];
      sorted.push([sym, this.counts[sym]]);
    }
    sorted.sort(function (a, b) {
      return b[1] - a[1];
    });
    if (top) {
      sorted = sorted.slice(0, top);
    }
    return sorted;
  }
}
module.exports = Histogram;
