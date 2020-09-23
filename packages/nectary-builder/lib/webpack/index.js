const clientConfig = require('./client');
const serverConfig = require('./server');

module.exports = opt => ({
  client: clientConfig(opt),
  server: serverConfig(opt)
});
