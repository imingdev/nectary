const connect = require('connect');

module.exports = class Server {
  constructor(nectary) {
    this.nectary = nectary;
    this.options = nectary.options;
    const app = connect();
    this.app = app;
    this.render = app;

    // devMiddleware placeholder
    if (this.options.dev) {
      nectary.hook('server:devMiddleware', (devMiddleware)=>{
        app.use(devMiddleware)
      })
    }
  }
};
