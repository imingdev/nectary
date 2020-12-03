import path from 'path';
import pify from 'pify';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import getWebpackConfig from './config';

export default class WebpackBundle {
  constructor(nectary) {
    this.nectary = nectary;
    this.options = nectary.options;
    this.webpackConfig = getWebpackConfig(nectary.options);

    this.webpackCompile = this.webpackCompile.bind(this);
    this.devMiddleware = this.devMiddleware.bind(this);
  }

  async build() {
    const {client, server} = this.webpackConfig;

    await Promise.all([client, server].map(c => this.webpackCompile(webpack(c))));
  }

  async webpackCompile(compiler) {
    const {options} = this;
    const {rootDir, srcDir} = options;
    const {name} = compiler.options;

    if (options.dev) {
      // Client Build, watch is started by dev-middleware
      if (name === 'client') return new Promise((resolve) => {
        compiler.hooks.done.tap('nectary-dev', () => resolve());
        return this.webpackDev(compiler);
      });

      // Server, build and watch for changes
      if (name === 'server') return new Promise((resolve, reject) => {
        compiler.watch(path.join(rootDir, srcDir), (err) => {
          if (err) return reject(err);

          resolve();
        })
      })
    }

    compiler.run = pify(compiler.run);
    const stats = await compiler.run();

    if (stats.hasErrors()) {
      const error = new Error('nectary build error');
      error.stack = stats.toString('errors-only');
      throw error
    }
  }

  async webpackDev(compiler) {
    const {devMiddleware} = this;
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
        heartbeat: 10000,
        path: '/__nectary__/hmr'
      })
    );

    // Register devMiddleware
    await this.nectary.callHook('server:devMiddleware', devMiddleware.bind(this));
  }

  // dev middle
  async devMiddleware(req, res, next) {
    const {devMiddleware, hotMiddleware} = this;
    if (devMiddleware) await devMiddleware(req, res);

    if (hotMiddleware) await hotMiddleware(req, res);

    next();
  }
}
