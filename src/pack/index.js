import Trie from './trie.js'
import { validateKeys } from './keys.js'

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
  if (options.strict && isArray(obj) && obj.some((key) => typeof key !== 'string')) {
    throw new TypeError('efrt strict: array keys must be strings')
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
    const t = new Trie(flat[k])
    flat[k] = t.pack()
  })
  return Object.keys(flat)
    .map((k) => {
      return k + '¦' + flat[k]
    })
    .join('|')
}
export default pack
