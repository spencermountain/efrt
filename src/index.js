const efrt = {
  pack: require('./pack/index'),
  unpack: require('./unpack/index')
}

//and then all-the-exports...
if (typeof self !== 'undefined') {
  self.efrt = efrt // Web Worker
} else if (typeof window !== 'undefined') {
  window.efrt = efrt // Browser
} else if (typeof global !== 'undefined') {
  global.efrt = efrt // NodeJS
}
//don't forget amd!
if (typeof define === 'function' && define.amd) {
  define(efrt)
}
//then for some reason, do this too!
if (typeof module !== 'undefined') {
  module.exports = efrt
}
