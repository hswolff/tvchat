require('reify');
const _ = require('lodash');

// Setup ENV values.
try {
  const config = require('./config.local').default;
  _.defaults(process.env, config);
} catch (e) {}

const config = require('./config').default;
_.defaults(process.env, config);

// Make sure it's a number.
process.env.PORT = (+process.env.PORT);

const createServer = require('./server').default;
createServer();
