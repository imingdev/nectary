const connect = require('connect');

class Server {
  constructor(nectary) {
    this.nectary = nectary;
    this.options = nectary.options;
    this.app = connect();
    this.render = this.app;
    this.compilers = {};
    nectary.hook('builder:compiled', ({name, compiler, stats}) => {
      this.compilers[name] = {compiler, stats};
    });
    nectary.hook('builder:devMiddleware', (middleware) => {
      this.middleware = middleware;
    });
  }

  ready() {
    const {middleware, app} = this;
    if (middleware) app.use(middleware);
  }
}

module.exports = Server;
