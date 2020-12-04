import path from 'path';
import WebpackDynamicEntryPlugin from 'webpack-dynamic-entry-plugin';
import webpack from 'webpack';
import cloneDeep from 'lodash/cloneDeep';
import WebpackBarPlugin from 'webpackbar';
import {styleLoaders, assetsLoaders} from '../utils/loaders';
import {checkFileExists} from "../utils/checkFile";

export default class WebpackBaseConfig {
  constructor(options) {
    this.options = options;

    this.assetsPath = this.assetsPath.bind(this);
    this.loadPagePath = this.loadPagePath.bind(this);
  }

  assetsPath(_path) {
    return path.posix.join(this.options.build.dir.static, _path);
  }

  loadPagePath(p) {
    const {rootDir = process.cwd(), srcDir, pageDir} = this.options;
    return path.join(rootDir, srcDir, pageDir, p);
  }

  get loadDefaultPages() {
    const {loadPagePath} = this;

    const load = name => checkFileExists(loadPagePath(name)) || require.resolve(`../client/pages/${name}`);

    return {
      '_document': load('_document'),
      '_app': load('_app'),
      '_404': load('_404')
    }
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

  get target() {
    return this.isServer ? 'node' : 'web';
  }

  get devtool() {
    const {dev, isServer} = this;
    if (!dev || isServer) return false;

    return 'source-map';
  }

  output() {
    const {options} = this;
    const {rootDir, buildDir, build} = options;
    return {
      path: path.join(rootDir, buildDir),
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
      const envPrefix = 'process.env.';
      const envKey = envPrefix + key.replace(new RegExp(`^${envPrefix}`), '');
      const envVal = ['boolean', 'number'].includes(typeof value) ? value : JSON.stringify(value);

      env[envKey] = envVal;
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
      '@babel/plugin-transform-runtime',
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-proposal-class-properties'
    ];
    if (typeof opt.plugins === 'function') opt.plugins = opt.plugins({envName, ...env}, defaultPlugins);
    if (!opt.plugins) opt.plugins = defaultPlugins;

    const defaultPreset = [
      ['@babel/preset-env', {modules: false}],
      '@babel/preset-react'
    ];
    if (typeof opt.presets === 'function') opt.presets = opt.presets({envName, ...env}, defaultPreset);
    if (!opt.presets) opt.presets = defaultPreset;

    return opt;
  }

  get rules() {
    const {env, options, assetsPath} = this;
    const rules = [{
      test: /\.(js|jsx)$/,
      loader: 'babel-loader',
      include: [
        path.join(__dirname, '..', 'client'),
        path.join(__dirname, '..', 'loaders'),
        path.join(options.rootDir, options.srcDir)
      ],
      options: this.getBabelOptions()
    }]
      .concat(styleLoaders({
        sourceMap: env.isDev,
        useIgnore: env.isServer,
        extract: env.isClient,
      }))
      .concat(assetsLoaders({emitFile: env.isClient, assetsPath}));

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
      target: this.target,
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

    const extendedConfig = cloneDeep(this.extendConfig(config));

    return extendedConfig;
  }
};