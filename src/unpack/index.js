import traverse from './traverse.js'

const unpack = function (str) {
  if (str === '' || str === null || str === undefined) {
    return {}
  }
  if (typeof str !== 'string') {
    throw new TypeError('efrt unpack expects a string')
  }
  //turn the weird string into a key-value object again
  const obj = str.split('|').reduce((h, s) => {
    const arr = s.split('¦')
    if (arr.length !== 2 || Object.prototype.hasOwnProperty.call(h, arr[0])) {
      throw new SyntaxError('Invalid efrt packed data: category separator or duplicate category')
    }
    h[arr[0]] = arr[1]
    return h
  }, Object.create(null))
  const all = {}
  Object.keys(obj).forEach(function (cat) {
    const arr = traverse(obj[cat])
    //special case, for botched-boolean
    if (cat === 'true') {
      cat = true
    }
    for (let i = 0; i < arr.length; i++) {
      const k = arr[i]
      if (Object.prototype.hasOwnProperty.call(all, k)) {
        if (Array.isArray(all[k]) === false) {
          all[k] = [all[k], cat]
        } else {
          all[k].push(cat)
        }
      } else {
        Object.defineProperty(all, k, {
          value: cat,
          writable: true,
          enumerable: true,
          configurable: true
        })
      }
    }
  })
  return all
}

export default unpack
