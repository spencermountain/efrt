export const unsupportedChars = /[0-9A-Z,;!:|¦]/

export const normalizeKey = function (key) {
  const normalized = key.toLowerCase()
  // Bound the depth of recursive trie construction and optimization.
  if (normalized.length > 1024) {
    throw new RangeError('efrt keys cannot exceed 1024 UTF-16 code units')
  }
  return normalized
}

export const validateKeys = function (obj) {
  const seen = new Map()
  Object.keys(obj).forEach((key) => {
    const normalized = normalizeKey(key)
    if (!normalized || unsupportedChars.test(normalized)) {
      throw new TypeError('efrt strict: unsupported key ' + JSON.stringify(key))
    }
    if (seen.has(normalized)) {
      throw new TypeError('efrt strict: keys ' + JSON.stringify(seen.get(normalized)) +
        ' and ' + JSON.stringify(key) + ' both normalize to ' + JSON.stringify(normalized))
    }
    seen.set(normalized, key)
  })
}
