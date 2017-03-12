'use strict';

//spin-out all words from this trie
const unRavel = (trie) => {
  let all = {};
  const crawl = function(index, prefix) {
    let node = trie.nodes[index];
    if (node[0] === '!') {
      all[prefix] = true;
      node = node.slice(1); //ok, we tried. remove it.
    }
    let matches = node.split(/([A-Z0-9,]+)/g);
    for (let i = 0; i < matches.length; i += 2) {
      let str = matches[i];
      let ref = matches[i + 1];
      if (!str) {
        continue;
      }

      let have = prefix + str;
      //branch's end
      if (ref === ',' || ref === undefined) {
        all[have] = true;
        continue;
      }
      let newIndex = trie.indexFromRef(ref, index);
      crawl(newIndex, have);
    }
  };
  crawl(0, '');
  return all;
};
module.exports = unRavel;
