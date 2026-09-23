// Word fragments live only in edges; metadata fields belong to the wrapper.
// Even fragments such as "_c", "edges", and "__proto__" are ordinary keys.
const createNode = function () {
  return { edges: Object.create(null) }
}

export default createNode
