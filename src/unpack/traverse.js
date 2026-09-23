import parseSymbols from './symbols.js'
import encoding from '../encoding.js'

// References are either absolute (symbol) or relative (1 - based)
const indexFromRef = function (trie, ref, index) {
  const dnode = encoding.fromAlphaCode(ref)
  const target = dnode < trie.symCount ? trie.syms[dnode] : index + dnode + 1 - trie.symCount
  // The encoder emits nodes in topological order. Every edge must point
  // forward, which also rules out cycles before expansion starts.
  if (!Number.isSafeInteger(target) || target <= index || target >= trie.nodes.length) {
    throw new SyntaxError('Invalid efrt packed data: node reference')
  }
  return target
}

const parseNodes = function (trie) {
  return trie.nodes.map((node, index) => {
    if (node === '' && trie.nodes.length !== 1) {
      throw new SyntaxError('Invalid efrt packed data: empty node')
    }
    const terminal = node[0] === '!'
    const body = terminal ? node.slice(1) : node
    const edges = []
    const token = /([^A-Z0-9,;!:|¦]+)([A-Z0-9]+|,|$)/g
    let offset = 0
    while (offset < body.length) {
      const match = token.exec(body)
      if (!match || match.index !== offset || (match[2] === ',' && token.lastIndex === body.length)) {
        throw new SyntaxError('Invalid efrt packed data: node syntax')
      }
      const ref = match[2]
      edges.push({
        text: match[1],
        target: ref === '' || ref === ',' ? -1 : indexFromRef(trie, ref, index)
      })
      offset = token.lastIndex
    }
    return { terminal, edges }
  })
}

const toArray = function (trie) {
  const nodes = parseNodes(trie)
  const all = []
  const stack = [{ index: 0, pref: '', edge: -1 }]
  while (stack.length) {
    const frame = stack[stack.length - 1]
    const node = nodes[frame.index]
    if (frame.edge === -1) {
      if (node.terminal) {
        all.push(frame.pref)
      }
      frame.edge = 0
    }
    if (frame.edge === node.edges.length) {
      stack.pop()
      continue
    }
    const edge = node.edges[frame.edge++]
    const word = frame.pref + edge.text
    if (edge.target === -1) {
      all.push(word)
    } else {
      stack.push({ index: edge.target, pref: word, edge: -1 })
    }
  }
  return all
}

//PackedTrie - Trie traversal of the Trie packed-string representation.
const unpack = function (str) {
  const trie = {
    nodes: str.split(';'),
    syms: [],
    symCount: 0
  }
  //process symbols, if they have them
  if (str.match(':')) {
    parseSymbols(trie)
  }
  return toArray(trie)
}

export default unpack
