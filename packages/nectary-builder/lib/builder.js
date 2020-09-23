const pify = require('pify');
const webpack = require('webpack');
const MFS = require('memory-fs');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const getWebpackConfig = require('./webpack');

class Builder {
  constructor(nectary) {
    this.nectary = nectary;
    this.options = nectary.options;
    this.webpackConfig = getWebpackConfig(nectary.options);
    this.mfs = new MFS();
  }

  async ready() {
    const {client, server} = this.webpackConfig;

    await Promise.all([client, server].map(config => {
      const compiler = webpack(config)
      if (this.options.dev) compiler.outputFileSystem = this.mfs;
      return this.webpackCompile(compiler);
    }));
  }

  async webpackCompile(compiler) {
    const {name} = compiler.options;

    compiler.hooks.done.tap('load-resources', (stats) => {
      this.nectary.callHook('builder:compiled', {
        name,
        compiler,
        stats
      });
    });

    // dev
    if (this.options.dev) {
      return new Promise((resolve, reject) => {
        compiler.hooks.done.tap('nectary-dev', () => resolve())
        return this.webpackDev(compiler);
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
    const {nectary, options, middleware} = this
    // Create webpack dev middleware
    this.devMiddleware = pify(
      webpackDevMiddleware(
        compiler, {
          publicPath: options.build.publicPath,
          stats: false,
          logLevel: 'silent',
          fs: compiler.outputFileSystem
        })
    );
    // Create webpack hot middleware
    this.hotMiddleware = pify(
      webpackHotMiddleware(
        compiler, {
          log: false,
          heartbeat: 10000,
          path: '/__nectary_hmr/client'
        })
    );

    // Register devMiddleware on server
    await nectary.callHook('builder:devMiddleware', middleware.bind(this));
  }

  async middleware(req, res, next) {
    const {devMiddleware, hotMiddleware} = this
    if (devMiddleware) await devMiddleware(req, res);

    if (hotMiddleware) await hotMiddleware(req, res);

    next();
  }
}

module.exports = Builder;
