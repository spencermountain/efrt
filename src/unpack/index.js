'use strict'
const unpack = require('./unpack')

module.exports = function(obj) {
  if (typeof obj === 'string') {
    obj = JSON.parse(obj) //weee!
  }
  let all = {}
  Object.keys(obj).forEach(function(cat) {
    let arr = unpack(obj[cat])
    //special case, for botched-boolean
    if (cat === 'true') {
      cat = true
    }
    for (var i = 0; i < arr.length; i++) {
      let k = arr[i]
      if (all.hasOwnProperty(k) === true) {
        if (Array.isArray(all[k]) === false) {
          all[k] = [all[k], cat]
        } else {
          all[k].push(cat)
        }
      } else {
        all[k] = cat
      }
    }
  })
  return all
}
