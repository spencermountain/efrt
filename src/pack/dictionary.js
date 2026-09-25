import fns from './fns.js'

// Only assign characters absent from the original labels. No escaping or
// additional restrictions on input keys are needed, and tokens cost one byte.
const alphabet = '#$%&()*+-./<=>?@[]^_`~'

const dictionary = function (labels) {
  const used = new Set(labels.join(''))
  const tokens = Array.from(alphabet).filter((char) => !used.has(char))
  if (tokens.length === 0) {
    return { header: '', encode: (label) => label }
  }
  const counts = new Map()
  for (const label of labels) {
    const chars = Array.from(label)
    for (let start = 0; start < chars.length; start++) {
      let fragment = ''
      for (let end = start; end < Math.min(chars.length, start + 12); end++) {
        fragment += chars[end]
        if (end > start) {
          counts.set(fragment, (counts.get(fragment) || 0) + 1)
        }
      }
    }
  }
  const candidates = Array.from(counts, ([text, count]) => {
    const size = fns.utf8Length(text)
    return { text, size, saving: ((size - 1) * count) - size - 2 }
  }).filter((entry) => entry.saving > 0).sort((a, b) => b.saving - a.saving).slice(0, 256)
  let remaining = labels.slice()
  const entries = []
  for (const candidate of candidates) {
    if (entries.length === tokens.length) {
      break
    }
    const parts = remaining.map((label) => label.split(candidate.text))
    const count = parts.reduce((sum, pieces) => sum + pieces.length - 1, 0)
    if ((candidate.size - 1) * count <= candidate.size + 2) {
      continue
    }
    const token = tokens[entries.length]
    entries.push({ token, text: candidate.text })
    remaining = parts.map((pieces) => pieces.join(token))
  }
  return {
    header: entries.length > 0 ? '!1:' + entries.map((entry) => entry.token).join('') + ':' +
      entries.map((entry) => entry.text).join(',') + ';' : '',
    encode: function (label) {
      for (const entry of entries) {
        label = label.split(entry.text).join(entry.token)
      }
      return label
    }
  }
}

export default dictionary
