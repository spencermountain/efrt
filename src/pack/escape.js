// Escape only serialized labels, after trie optimization and token selection.
const escapeLabel = function (text) {
  return text.replace(/[0-9\\]/g, (char) =>
    char === '\\' ? '\\\\' : '\\' + 'abcdefghij'[Number(char)])
}

export default escapeLabel
