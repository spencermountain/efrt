module.exports = {
  NODE_SEP: ';',
  STRING_SEP: ',',
  TERMINAL_PREFIX: '!',
  //characters banned from entering the trie
  NOT_ALLOWED: new RegExp('[0-9A-Z,;!]'),
  BASE: 36,
};
