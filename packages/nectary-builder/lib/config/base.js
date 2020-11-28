const WebpackDynamicEntryPlugin = require('webpack-dynamic-entry-plugin');
const WebpackBarPlugin = require('webpackbar');
const {styleLoaders, assetsLoaders} = require('../utils/loaders');
const {resolve, resolveByProject} = require('../utils/resolve');
const {checkFileExists} = require('../utils/checkFile');

module.exports = class WebpackBaseConfig {
  constructor(options) {
    this.options = options;
  }

  get colors() {
    return {
      client: 'green',
      server: 'orange'
    }
  }

  get dev() {
    return this.options.dev;
  }

  get env() {
    return {
      isDev: this.dev,
      isServer: this.isServer,
      isClient: this.isClient
    }
  }

  get mode() {
    return this.dev ? 'development' : 'production';
  }

  get devtool() {
    if (!this.dev) return false;

    return 'source-map';
  }

  output() {
    const {options} = this;
    const {buildDir, build} = options;
    return {
      path: resolveByProject(buildDir),
      publicPath: build.publicPath
    }
  }

  get rules() {
    const {env, options} = this;
    return [{
      test: /\.(js|jsx)$/,
      loader: 'eslint-loader',
      enforce: 'pre',
      options: {
        formatter: require('eslint-friendly-formatter')
      }
    }, {
      test: /\.(js|jsx)$/,
      loader: 'babel-loader',
      include: [
        resolve('client'),
        resolve('loaders/client-pages-loader.js'),
        resolveByProject(options.srcDir)
      ]
    }]
      .concat(styleLoaders({
        sourceMap: env.isDev,
        useIgnore: env.isServer,
        extract: env.isClient,
      }))
      .concat(assetsLoaders({emitFile: env.isClient}));
  }

  plugins() {
    return [
      new WebpackDynamicEntryPlugin(),
      new WebpackBarPlugin({
        name: this.name,
        color: this.colors[this.name]
      })
    ];
  }

  extendConfig(config) {
    const {options, env} = this;
    const {extend} = options.build;
    if (typeof extend === 'function') return extend(config, env) || config
    return config
  }

  config() {
    const config = {
      name: this.name,
      mode: this.mode,
      devtool: this.devtool,
      entry: this.entry(),
      output: this.output(),
      module: {
        rules: this.rules
      },
      resolve: {
        extensions: ['.js', '.jsx', '.json'],
        alias: this.options.alias || {}
      },
      plugins: this.plugins(),
      performance: {
        hints: false
      },
      stats: {
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false,
        entrypoints: false
      }
    };

    const extendedConfig = this.extendConfig(config);

    return extendedConfig;
  }
};
