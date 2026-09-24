const commonPrefix = function (w1, w2) {
  const len = Math.min(w1.length, w2.length)
  let end = 0
  for (; end < len;) {
    const point = w1.codePointAt(end)
    if (point !== w2.codePointAt(end)) {
      break
    }
    end += point > 0xffff ? 2 : 1
  }
  return w1.slice(0, end)
}

/* Sort elements and remove duplicates from array (modified in place) */
const unique = function (a) {
  a.sort()
  let count = 0
  for (let i = 0; i < a.length; i++) {
    if (count === 0 || a[count - 1] !== a[i]) {
      a[count++] = a[i]
    }
  }
  a.length = count
}

export default {
  commonPrefix,
  unique
}
