'use strict';
let types = require('./types');

let enumBug = !{
    toString: true
  }.propertyIsEnumerable('toString');

let internalNames = ['toString', 'toLocaleString', 'valueOf',
  'constructor', 'isPrototypeOf'];

// Copy methods to a Constructor Function's prototype
const methods = function(ctor, obj) {
  extend(ctor.prototype, obj);
};

// Monkey-patch the Function object if that is your syntactic preference
const patchFunction = function() {
  methods(Function, {
    'methods': function(obj) {
      methods(this, obj);
    },
    'bind': function(self) {
      return fnMethod(this, self);
    },
    'curry': function() {
      return curry(this, arguments);
    },
    'decorate': function(decorator) {
      return decorate(this, decorator);
    }
  });
};

// Function wrapper for binding 'this'
// Similar to Protoype.bind - but does no argument mangling
const bind = function(fn, self) {
  return function() {
    return fn.apply(self, arguments);
  };
};

// Function wrapper for appending parameters (currying)
// Similar to Prototype.curry
const curry = function(fn) {
  let presets;
  // Handle the monkey-patched and in-line forms of curry
  if (arguments.length === 2 && types.isArguments(arguments[1])) {
    presets = copyArray(arguments[2]);
  } else {
    presets = copyArray(arguments);
  }

  return function() {
    return fn.apply(this, presets.concat(arguments));
  };
};

// Wrap the fn function with a generic decorator like:
//
// function decorator(fn, arguments, fnWrapper) {
//   if (fn == undefined) { ... init ...; return;}
//   ...
//   result = fn.apply(this, arguments);
//   ...
//   return result;
// }
//
// The fnWrapper function is a created for each call
// of the decorate function.  In addition to wrapping
// the decorated function, it can be used to save state
// information between calls by adding properties to it.
const decorate = function(fn, decorator) {
  let fnWrapper = function() {
    return decorator.call(this, fn, arguments, fnWrapper);
  };
  // Init call - pass undefined fn - but available in this
  // if needed.
  decorator.call(this, undefined, arguments, fnWrapper);
  return fnWrapper;
};

const extend = function(dest) {
  if (dest === undefined) {
    dest = {};
  }
  for (let i = 1; i < arguments.length; i++) {
    let source = arguments[i];
    let keys = Object.keys(source);
    for(let o = 0; o < keys.length; o++) {
      let prop = source[keys[o]];
      if (source.hasOwnProperty(prop)) {
        dest[prop] = source[prop];
      }
    }
    if (!enumBug) {
      continue;
    }
    for (let j = 0; j < internalNames.length; j++) {
      prop = internalNames[j];
      if (source.hasOwnProperty(prop)) {
        dest[prop] = source[prop];
      }
    }
  }
  return dest;
};

module.exports = {
  'extend': extend,
  'methods': methods,
  'patchFunction': patchFunction,
  'decorate': decorate
};
