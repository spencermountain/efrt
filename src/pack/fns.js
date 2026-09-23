const commonPrefix = function (w1, w2) {
  const len = Math.min(w1.length, w2.length)
  let end = 0
  while (end < len && w1[end] === w2[end]) {
    end++
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
