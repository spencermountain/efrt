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

// Measure the text as shipped in UTF-8, without depending on Node's Buffer.
const utf8Length = function (str) {
  let size = 0
  for (const char of str) {
    const point = char.codePointAt(0)
    if (point < 0x80) {
      size++
    } else if (point < 0x800) {
      size += 2
    } else if (point < 0x10000) {
      size += 3
    } else {
      size += 4
    }
  }
  return size
}

export default {
  commonPrefix,
  unique,
  utf8Length
}
