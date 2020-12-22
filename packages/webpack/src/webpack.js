import pify from 'pify';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import getWebpackConfig from './config';
import fs from 'fs';
import MFS from 'memory-fs';

export default class WebpackBundle {
  constructor(nectary) {
    this.nectary = nectary;
    this.options = nectary.options;
    this.webpackConfig = getWebpackConfig(nectary);

    // Initialize shared MFS for dev
    if (nectary.options.dev) this.mfs = new MFS();

    this.webpackCompile = this.webpackCompile.bind(this);
    this.devMiddleware = this.devMiddleware.bind(this);
  }

  async build() {
    const {client, server} = this.webpackConfig;

    await Promise.all([client, server].map(c => this.webpackCompile(webpack(c))));
  }

  async webpackCompile(compiler) {
    const {options, nectary, mfs} = this;
    const {name} = compiler.options;

    // Load renderer resources after build
    compiler.hooks.done.tap('load-resources', async (stats) => {
      await nectary.callHook('server:compiled', {
        name,
        compiler,
        stats
      });

      // Reload renderer
      await nectary.callHook('server:resources', options.dev ? mfs : fs);
    });

    if (options.dev) {
      // Client Build, watch is started by dev-middleware
      if (name === 'client') {
        // In dev, write files in memory FS
        compiler.outputFileSystem = mfs;

        return new Promise((resolve) => {
          compiler.hooks.done.tap('nectary-dev', () => resolve());
          return this.webpackDev(compiler);
        });
      }

      // Server, build and watch for changes
      if (name === 'server') return new Promise((resolve, reject) => {
        compiler.watch(options.build.watch, (err) => {
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
        logLevel: 'silent',
        fs: compiler.outputFileSystem
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
    await this.nectary.callHook('server:devMiddleware', devMiddleware);
  }

  // dev middle
  async devMiddleware(req, res, next) {
    const {devMiddleware, hotMiddleware} = this;
    if (devMiddleware) await devMiddleware(req, res);

    if (hotMiddleware) await hotMiddleware(req, res);

    next();
  }
}
