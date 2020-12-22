import serveStatic from 'serve-static';
import connect from 'connect';
import Router from './lib/Router';

export default class Server {
  constructor(nectary) {
    this.nectary = nectary;
    this.options = nectary.options;
    const app = connect();
    this.app = app;
    this.render = app;

    this.router = new Router(nectary);

    // devMiddleware placeholder
    if (nectary.options.dev) {
      nectary.hook('server:devMiddleware', (devMiddleware) => {
        this.devMiddleware = devMiddleware;
      })
    }

    this.setupMiddleware = this.setupMiddleware.bind(this);
    this.useMiddleware = this.useMiddleware.bind(this);
    this.loadResources = this.loadResources.bind(this);
  }

  async ready() {
    if (this._readyCalled) return this;
    this._readyCalled = true;

    const {nectary, loadResources, setupMiddleware} = this;

    // load resources
    nectary.hook('server:resources', _fs => {
      this.router.set(loadResources(_fs));
    });

    // Setup nuxt middleware
    await setupMiddleware();

    return this;
  }

  setupMiddleware() {
    const {nectary, options, router, useMiddleware} = this;
    const {dev, server, dir, build} = options;
    const {root, build: buildDir} = dir;
    const {compressor} = server || {};

    if (!dev) {
      // gzip
      if (typeof compressor === 'object') {
        // If only setting for `compression` are provided, require the module and insert
        const compression = require('compression');
        useMiddleware(compression(compressor));
      } else if (compressor) {
        // Else, require own compression middleware if compressor is actually truthy
        useMiddleware(compressor);
      }

      // static
      const staticMiddleware = serveStatic(nectary.resolve.build(options.build.dir.static));
      useMiddleware({route: `/${build.dir.static}`, handle: staticMiddleware})
    }

    // Dev middleware
    if (dev) {
      useMiddleware((req, res, next) => {
        const {devMiddleware} = this;
        if (!devMiddleware) return next();

        devMiddleware(req, res, next);
      });
    }

    // Finally use router middleware
    useMiddleware(router.middleware);
  }

  loadResources(_fs) {
    const {nectary, options} = this;

    let result = {};

    try {
      const fullPath = nectary.resolve.build(options.build.manifest);

      if (!_fs.existsSync(fullPath)) return result;

      const contents = _fs.readFileSync(fullPath, 'utf-8');

      result = JSON.parse(contents) || {};
    } catch (err) {
    }

    return result;
  }

  useMiddleware(middleware) {
    const {app} = this;

    if (typeof middleware === 'object') return app.use(middleware.route = '/', middleware.handle);
    return app.use(middleware);
  }
}
