const pify = require('pify');
const webpack = require('webpack');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const getWebpackConfig = require('./webpack');
const {formatEntryNameToUrl} = require('./utils/format');
const {requireReactElement, resolveServerPagesFile, resolveByProject} = require('./utils/resolve');

class Builder {
  constructor(nectary) {
    this.nectary = nectary;
    this.options = nectary.options;
    this.webpackConfig = getWebpackConfig(nectary.options);
    this.compilers = {};
  }

  async ready() {
    const {client, server} = this.webpackConfig;

    await Promise.all([client, server].map(config => this.webpackCompile(webpack(config))));
  }

  webpackAllCompiled() {
    const {compilers, options, renderToString, nectary} = this;
    if (!compilers.client || !compilers.server) return false;
    const {stats} = compilers.client;

    const entryPoints = stats.toJson().entrypoints || {};

    const {Component: App, getServerSideProps: appServerSideProps} = requireReactElement(resolveServerPagesFile(options.buildDir, '_app.js'));
    const entryList = Object.keys(entryPoints).map(entryName => {
      const {assets} = entryPoints[entryName];
      const assetsList = assets.map(row => options.build.publicPath + row);

      const url = formatEntryNameToUrl(entryName);

      const {Component, getServerSideProps} = requireReactElement(resolveServerPagesFile(options.buildDir, `${entryName}.js`));
      const pageScripts = assetsList.filter(row => /\.js$/.test(row));
      const pageStyles = assetsList.filter(row => /\.css$/.test(row));

      return {
        url,
        appServerSideProps,
        Component,
        getServerSideProps,
        pageScripts,
        pageStyles,
        renderToString: renderToString.bind(this)
      }
    });
    nectary.callHook('builder:entryList', entryList)
  }

  async webpackCompile(compiler) {
    const {options} = this
    const {name} = compiler.options;

    compiler.hooks.done.tap('load-resources', (stats) => {
      this.compilers[name] = {stats, compiler};
      this.webpackAllCompiled();
    });

    if (options.dev) {
      // Client Build, watch is started by dev-middleware
      if (name === 'client') return this.webpackDev(compiler);

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
    const {nectary, options, devMiddleware, devEntryPointsMiddleware} = this
    // Create webpack dev middleware
    this.devMiddleware = pify(
      webpackDevMiddleware(compiler, {
        publicPath: options.build.publicPath,
        stats: false,
        logLevel: 'silent',
        watchOptions: resolveByProject(options.srcDir)
      })
    );
    // Create webpack hot middleware
    this.hotMiddleware = pify(
      webpackHotMiddleware(compiler, {
        log: false,
        reload: true,
        timeout: 30000,
        heartbeat: 10000,
        path: '/__nectary__/hmr'
      })
    );

    // Register devMiddleware on server
    await nectary.callHook('builder:useMiddleware', devMiddleware.bind(this));
  }

  // dev middle
  async devMiddleware(req, res, next) {
    const {devMiddleware, hotMiddleware} = this;
    if (devMiddleware) await devMiddleware(req, res);

    if (hotMiddleware) await hotMiddleware(req, res);

    next();
  }

  renderToString(locals) {
    const {options} = this;
    const {Component: Document} = requireReactElement(resolveServerPagesFile(options.buildDir, '_document.js'));
    const {Component: App} = requireReactElement(resolveServerPagesFile(options.buildDir, '_app.js'));

    const {id: globalId, context: globalContext} = this.options.globals;
    const element = React.createElement(Document, {...locals, App, globalId, globalContext});
    return '<!doctype html>' + ReactDOMServer.renderToString(element);
  };
}

module.exports = Builder;
