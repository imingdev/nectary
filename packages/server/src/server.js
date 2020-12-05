import path from 'path';
import serveStatic from 'serve-static';
import connect from 'connect';
import nectaryMiddleware from './middleware/nectary';
import Renderer from './renderer';

export default class Server {
  constructor(nectary) {
    this.nectary = nectary;
    this.options = nectary.options;
    const app = connect();
    this.app = app;
    this.render = app;

    // Runtime shared resources
    this.resources = {};

    this.setupMiddleware = this.setupMiddleware.bind(this);
    this.useMiddleware = this.useMiddleware.bind(this);
    this.loadResources = this.loadResources.bind(this);
  }

  async ready() {
    if (this._readyCalled) return this;
    this._readyCalled = true;

    const {nectary, options, useMiddleware, loadResources, setupMiddleware} = this;
    const {dev} = options;

    if (dev) {
      // devMiddleware placeholder
      nectary.hook('server:devMiddleware', useMiddleware);
    }

    // load resources
    nectary.hook('server:resources', _fs => {
      this.resources = loadResources(_fs);
    });

    // build compiled
    nectary.hook('server:compiled', async ({name}) => {
      const _compiled = this._compiled || {};
      _compiled[name] = true;
      this._compiled = _compiled;
      const {client, server} = this._compiled;

      // Setup nuxt middleware
      if (client && server) await setupMiddleware();
    });

    return this;
  }

  setupMiddleware() {
    const {options, useMiddleware} = this;
    const {dev, server, rootDir, buildDir, build} = options;
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
      const staticMiddleware = serveStatic(path.join(rootDir, buildDir, build.dir.static));
      useMiddleware({route: `/${build.dir.static}`, handle: staticMiddleware})
    }

    // Finally use nectaryMiddleware
    const renderer = new Renderer(this);
    useMiddleware(nectaryMiddleware({
      serverContext: this,
      render: renderer.render
    }));
  }

  loadResources(_fs) {
    const {options} = this;

    let result = {};

    try {
      const fullPath = path.join(options.rootDir, options.buildDir, options.build.manifest);

      if (!_fs.existsSync(fullPath)) return result;

      const contents = _fs.readFileSync(fullPath, 'utf-8');

      result = JSON.parse(contents) || {};
    } catch (err) {
    }

    return result;
  }

  useMiddleware(middleware) {
    const {app} = this;

    if (typeof middleware === 'object') {
      if (middleware.handle && !middleware.route) return app.use(middleware.handle);
      return app.use(middleware.route, middleware.handle);
    }
    return app.use(middleware);
  }
}
