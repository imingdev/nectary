const path = require('path');
const connect = require('connect');
const serveStatic = require('serve-static');

module.exports = class Server {
  constructor(nectary) {
    this.nectary = nectary;
    this.options = nectary.options;
    const app = connect();
    this.app = app;
    this.render = app;

    // devMiddleware placeholder
    if (this.options.dev) {
      nectary.hook('server:devMiddleware', (devMiddleware) => {
        this.useMiddleware(devMiddleware)
      });
    }

    this.useMiddleware = this.useMiddleware.bind(this);
  }

  async ready() {
    if (this._readyCalled) return this;
    this._readyCalled = true;

    // Setup nuxt middleware
    await this.setupMiddleware();

    return this;
  }

  async setupMiddleware() {
    const {nectary, options, useMiddleware} = this;
    const {compressor, dev, build, buildDir} = options;

    if (!dev) {
      // Compression middleware for production
      if (typeof compressor === 'object') {
        // If only setting for `compression` are provided, require the module and insert
        const compression = nectary.requireModule('compression');
        useMiddleware(compression(compressor));
      } else if (compressor) {
        // Else, require own compression middleware if compressor is actually truthy
        useMiddleware(compressor);
      }

      if (!build.publicPath.startsWith('http')) {
        // static
        useMiddleware({
          route: '/' + `${build.publicPath}/${build.dir.static}`.split('/').filter(Boolean).join('/'),
          handle: serveStatic(path.join(process.cwd(), buildDir, build.dir.static))
        });
      }
    }
  }

  resolveMiddleware(middleware, fallbackRoute = '/') {
    if (typeof middleware === 'function') return {route: fallbackRoute, handle: middleware};
    if (typeof middleware === 'object') {
      if (middleware.handle && !middleware.route) return {route: fallbackRoute, handle: middleware.handle};
      return middleware;
    }

    return middleware;
  }

  useMiddleware(middleware) {
    const {route, handle} = this.resolveMiddleware(middleware);
    this.app.use(route, handle);
  }
};
