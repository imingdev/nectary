const WebpackClientConfig = require('./client');
const WebpackServerConfig = require('./server');

module.exports = options => ({
  client: (new WebpackClientConfig(options)).config(),
  server: (new WebpackServerConfig(options)).config()
})
