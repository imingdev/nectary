const WebpackDynamicEntryPlugin = require('webpack-dynamic-entry-plugin');
const webpack = require('webpack');
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

  nodeEnv() {
    const env = {
      'process.env.NODE_ENV': JSON.stringify(this.mode),
      'process.mode': JSON.stringify(this.mode),
      'process.dev': this.dev
    };

    Object.entries(this.options.env).forEach(([key, value]) => {
      env['process.env.' + key] = ['boolean', 'number'].includes(typeof value) ? value : JSON.stringify(value);
    });

    return env;
  }

  getBabelOptions() {
    const {name: envName, env, options} = this;
    const {babel} = options.build;

    const opt = {
      ...babel,
      envName
    };

    if (opt.configFile || opt.babelrc) return opt;

    const defaultPlugins = [
      require.resolve('@babel/plugin-transform-runtime'),
      require.resolve('@babel/plugin-syntax-dynamic-import'),
      require.resolve('@babel/plugin-proposal-class-properties')
    ];
    if (typeof opt.plugins === 'function') opt.plugins = opt.plugins({envName, ...env}, defaultPlugins);
    if (!opt.plugins) opt.plugins = defaultPlugins;

    const defaultPreset = [
      [require.resolve('@babel/preset-env'), {modules: false}],
      require.resolve('@babel/preset-react')
    ];
    if (typeof opt.presets === 'function') opt.presets = opt.presets({envName, ...env}, defaultPreset);
    if (!opt.presets) opt.presets = defaultPreset;

    return opt;
  }

  get rules() {
    const {env, options} = this;
    const rules = [{
      test: /\.(js|jsx)$/,
      loader: require.resolve('babel-loader'),
      include: [
        resolve('client'),
        resolve('loaders/client-pages-loader.js'),
        resolveByProject(options.srcDir)
      ],
      options: this.getBabelOptions()
    }]
      .concat(styleLoaders({
        sourceMap: env.isDev,
        useIgnore: env.isServer,
        extract: env.isClient,
      }))
      .concat(assetsLoaders({emitFile: env.isClient}));

    if (options.eslint) rules.unshift({
      test: /\.(js|jsx)$/,
      loader: 'eslint-loader',
      enforce: 'pre',
      options: {
        formatter: require('eslint-friendly-formatter')
      }
    });

    return rules;
  }

  plugins() {
    return [
      new WebpackDynamicEntryPlugin(),
      new WebpackBarPlugin({
        name: this.name,
        color: this.colors[this.name]
      }),
      new webpack.DefinePlugin(this.nodeEnv())
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
