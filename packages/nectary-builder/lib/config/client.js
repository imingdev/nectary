const WebpackDynamicEntryPlugin = require('webpack-dynamic-entry-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const ClientManifestPlugin = require('../plugins/client-manifest-plugin');
const WebpackBaseConfig = require('./base');
const {checkFileExists} = require('../utils/checkFile');
const {assetsPath} = require('../utils/loaders');
const {resolve, resolveByProject} = require('../utils/resolve');

module.exports = class WebpackClientConfig extends WebpackBaseConfig {
  constructor(options) {
    super(options);
    this.name = 'client';
    this.isServer = false;
    this.isClient = true;
  }

  entry() {
    const {options, dev} = this;
    const {srcDir, pageDir, pattern, globals} = options;

    const appPath = checkFileExists(resolveByProject(srcDir, pageDir, '_app')) || resolve('client/pages/_app.jsx');
    const notPagePath = checkFileExists(resolveByProject(srcDir, pageDir, '_404')) || resolve('client/pages/_404.jsx');

    return WebpackDynamicEntryPlugin.getEntry({
      pattern: [
        resolveByProject(srcDir, pageDir, pattern),
        notPagePath
      ],
      generate: (entry) => Object.assign.apply(Object, Object.keys(entry)
        .map((name) => {
          const loaderPath = resolve('loaders/client-pages-loader.js');
          const entryVal = [`${loaderPath}?app=${appPath}&id=${globals.id}&context=${globals.context}!${entry[name]}`];

          if (dev) entryVal.unshift(
            // https://github.com/webpack-contrib/webpack-hot-middleware/issues/53#issuecomment-162823945
            resolve('../node_modules/eventsource-polyfill'),
            // https://github.com/glenjamin/webpack-hot-middleware#config
            resolve('../node_modules/webpack-hot-middleware/client?path=/__nectary__/hmr')
          );
          return {[name]: entryVal};
        }))
    });
  }

  output() {
    const {dev} = this;
    const output = super.output();
    return {
      ...output,
      filename: dev ? '[name].js' : assetsPath('js/[chunkhash:8].js'),
      chunkFilename: dev ? '[name].js' : assetsPath('js/[chunkhash:8].js')
    }
  }

  plugins() {
    const {dev, options} = this;
    const {publicPath, manifestFileName} = options.build;

    const plugins = super.plugins();
    plugins.push(
      new MiniCssExtractPlugin({
        filename: dev ? '[name].css' : assetsPath('css/[contenthash:8].css'),
        chunkFilename: dev ? '[name].css' : assetsPath('css/[contenthash:8].css')
      }),
      new ClientManifestPlugin({
        publicPath,
        fileName: manifestFileName
      })
    );

    return plugins;
  }

  optimization() {
    const {dev} = this;
    if (dev) return {};

    return {
      splitChunks: {
        cacheGroups: {
          vendor: {
            name: 'vendor',
            chunks: 'initial',
            test: ({resource}) => resource && /\.js$/.test(resource) && resource.indexOf(resolveByProject('node_modules')) === 0
          },
          async: {
            name: 'async',
            chunks: 'async',
            minChunks: 3
          }
        }
      },
      runtimeChunk: true,
      minimizer: [
        new OptimizeCSSPlugin({
          cssProcessorOptions: {safe: true}
        }),
        new UglifyJsPlugin({
          uglifyOptions: {
            output: {
              comments: false
            },
            compress: {
              drop_debugger: true,
              drop_console: true
            }
          },
          sourceMap: false,
          parallel: true
        })
      ]
    }
  }

  config() {
    const config = super.config();
    return {
      ...config,
      optimization: this.optimization()
    }
  }
};