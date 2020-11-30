const pify = require('pify');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const getWebpackConfig = require('./config');
const {resolveByProject} = require('./utils/resolve');

module.exports = class Builder {
  constructor(nectary) {
    this.nectary = nectary;
    this.options = nectary.options;
    this.webpackConfig = getWebpackConfig(nectary.options);

    this.webpackCompile = this.webpackCompile.bind(this);
  }

  async ready() {
    const {client, server} = this.webpackConfig;

    await Promise.all([client, server].map(config => this.webpackCompile(webpack(config))));
  }

  async webpackCompile(compiler) {
    const {options} = this;
    const {name} = compiler.options;

    if (options.dev) {
      // Client Build, watch is started by dev-middleware
      if (name === 'client') return new Promise((resolve) => {
        compiler.hooks.done.tap('nectary-dev', () => resolve());
        return this.webpackDev(compiler);
      });

      // Server, build and watch for changes
      if (name === 'server') return new Promise((resolve, reject) => {
        compiler.watch(resolveByProject(options.srcDir), (err) => {
          if (err) return reject(err);

          resolve();
        })
      })
    }

    compiler.run = pify(compiler.run);
    const stats = await compiler.run();

    if (stats.hasErrors()) {
      const error = new Error('Nectary build error');
      error.stack = stats.toString('errors-only');
      throw error
    }
  }

  async webpackDev(compiler) {
    const {nectary, options, devMiddleware} = this
    // Create webpack dev middleware
    this.devMiddleware = pify(
      webpackDevMiddleware(compiler, {
        stats: false,
        logLevel: 'silent'
      })
    );
    // Create webpack hot middleware
    this.hotMiddleware = pify(
      webpackHotMiddleware(compiler, {
        log: false,
        path: '/__nectary__/hmr'
      })
    );

    // Register devMiddleware on server
    await nectary.callHook('server:devMiddleware', devMiddleware.bind(this));
  }

  // dev middle
  async devMiddleware(req, res, next) {
    const {devMiddleware, hotMiddleware} = this;
    if (devMiddleware) await devMiddleware(req, res);

    if (hotMiddleware) await hotMiddleware(req, res);

    next();
  }
}
