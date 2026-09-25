const unescapeLabel = function (text) {
  return text.replace(/\\([\s\S]|$)/g, (match, char) => {
    if (char === '\\') {
      return '\\'
    }
    if (char >= 'a' && char <= 'j') {
      return String(char.charCodeAt(0) - 97)
    }
    throw new SyntaxError('Invalid efrt packed data: label escape')
  })
}

export default unescapeLabel
