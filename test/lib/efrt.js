if (process.env.TESTENV === 'prod') {
  console.log('== production build test 🚀 ==');
  // module.exports = require('../../builds/efrt');
  module.exports = require('../../builds/efrt.min');
  // console.log(module.exports);
} else {
  module.exports = require('../../src/index');
}
