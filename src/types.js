
function toString(obj) {
  return Object.prototype.toString.call(obj);
}

function isType(obj, type) {
  return toString(obj) === '[object ' + type + ']';
}

module.exports = {
  'isArray': function (obj) {
    return isType(obj, 'Array');
  },
  'isArguments': function (obj) {
    return isType(obj, 'Arguments');
  },
  'toString': toString,
  'isType': isType
};
