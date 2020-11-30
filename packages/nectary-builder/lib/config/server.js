const WebpackNodeExternals = require('webpack-node-externals');
const WebpackDynamicEntryPlugin = require('webpack-dynamic-entry-plugin');
const WebpackBaseConfig = require('./base');
const {checkFileExists} = require('../utils/checkFile');
const {resolve, resolveByProject} = require('../utils/resolve');

module.exports = class WebpackServerConfig extends WebpackBaseConfig {
  constructor(options) {
    super(options);
    this.name = 'server';
    this.isServer = true;
    this.isClient = false;
  }

  entry() {
    const {options} = this;
    const {srcDir, pageDir, pattern, build} = options;

    const documentPath = checkFileExists(resolveByProject(srcDir, pageDir, '_document')) || resolve('client/pages/_document.jsx');
    const appPath = checkFileExists(resolveByProject(srcDir, pageDir, '_app')) || resolve('client/pages/_app.jsx');
    const notPagePath = checkFileExists(resolveByProject(srcDir, pageDir, '_404')) || resolve('client/pages/_404.jsx');

    return WebpackDynamicEntryPlugin.getEntry({
      pattern: [
        resolveByProject(srcDir, pageDir, pattern),
        documentPath,
        appPath,
        notPagePath
      ],
      generate: (entry) => Object.assign.apply(Object, Object.keys(entry)
        .map((name) => {
          const key = `${build.dir.server}/${name}`
            .split('/')
            .filter(Boolean)
            .join('/');
          return {[key]: entry[name]};
        }))
    });
  }

  output() {
    const output = super.output();
    return {
      ...output,
      filename: '[name].js',
      chunkFilename: '[name].js',
      libraryTarget: 'commonjs2'
    }
  }

  nodeEnv() {
    return Object.assign(
      super.nodeEnv(),
      {
        'process.browser': false,
        'process.client': false,
        'process.server': true
      }
    );
  }

  config() {
    const config = super.config();
    return {
      ...config,
      externals: WebpackNodeExternals()
    }
  }
};
