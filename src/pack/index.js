import Trie from './trie.js'
import { normalizeKey, validateKeys, unsupportedChars } from './keys.js'
import fns from './fns.js'

const isArray = function (input) {
  return Object.prototype.toString.call(input) === '[object Array]'
}

const handleFormats = function (input) {
  //null
  if (input === null || input === undefined) {
    return {}
  }
  //string
  if (typeof input === 'string') {
    return input.split(/ +/g).reduce(function (h, str) {
      h[str] = true
      return h
    }, Object.create(null))
  }
  //array
  if (isArray(input)) {
    return input.reduce(function (h, str) {
      h[str] = true
      return h
    }, Object.create(null))
  }
  //object
  return input
}

//turn an array into a compressed string
const pack = function (obj, options = {}) {
  const direction = options.direction === undefined ? 'prefix' : options.direction
  if (!['prefix', 'suffix', 'auto'].includes(direction)) {
    throw new TypeError('efrt direction must be prefix, suffix, or auto')
  }
  if (options.dictionary !== undefined && typeof options.dictionary !== 'boolean') {
    throw new TypeError('efrt dictionary must be a boolean')
  }
  const isSet = Object.prototype.toString.call(obj) === '[object Set]'
  if (isSet) {
    obj = Array.from(obj)
  }
  if (options.strict && isArray(obj) && obj.some((key) => typeof key !== 'string')) {
    throw new TypeError('efrt strict: ' + (isSet ? 'Set' : 'array') + ' keys must be strings')
  }
  obj = handleFormats(obj)
  if (options.strict) {
    validateKeys(obj)
  }
  //pivot into categories:
  const flat = Object.keys(obj).reduce(function (h, k) {
    const values = isArray(obj[k]) ? obj[k] : [obj[k]]
    for (let i = 0; i < values.length; i++) {
      const cat = String(values[i])
      if (/[|¦]/.test(cat)) {
        throw new TypeError('efrt categories cannot contain | or ¦')
      }
      h[cat] = h[cat] || []
      h[cat].push(k)
    }
    return h
  }, Object.create(null))
  //pack each into a compressed string
  Object.keys(flat).forEach(function (k) {
    const words = flat[k].map(normalizeKey)
    const versioned = words.some((word) => /[0-9]/.test(word) && !unsupportedChars.test(word))
    const marker = versioned ? '!2;' : ''
    if (direction === 'prefix') {
      flat[k] = marker + new Trie(words).pack(options.dictionary, versioned)
      return
    }
    // Normalize before reversing: lowercasing can depend on letter order
    // (for example Greek final sigma) or expand a character into two.
    const reversed = words.map((word) => Array.from(word).reverse().join(''))
    const suffix = marker + ':' + new Trie(reversed).pack(options.dictionary, versioned)
    if (direction === 'suffix') {
      flat[k] = suffix
      return
    }
    const prefix = marker + new Trie(words).pack(options.dictionary, versioned)
    flat[k] = fns.utf8Length(suffix) < fns.utf8Length(prefix) ? suffix : prefix
  })
  return Object.keys(flat)
    .map((k) => {
      return k + '¦' + flat[k]
    })
    .join('|')
}
export default pack
