const connect = require('connect');

class Server {
  constructor(nectary) {
    this.nectary = nectary;
    this.options = nectary.options;
    this.app = connect();
    this.render = this.app;
  }

  ready() {

  }
}

module.exports = Server;
