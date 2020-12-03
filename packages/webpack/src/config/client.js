import path from 'path';
import webpack from 'webpack';
import WebpackDynamicEntryPlugin from 'webpack-dynamic-entry-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import OptimizeCSSPlugin from 'optimize-css-assets-webpack-plugin';
import ClientManifestPlugin from '../plugins/client-manifest-plugin';
import WebpackBaseConfig from './base';

export default class WebpackClientConfig extends WebpackBaseConfig {
  constructor(options) {
    super(options);
    this.name = 'client';
    this.isServer = false;
    this.isClient = true;
  }

  entry() {
    const {options, dev, loadPagePath, loadDefaultPages} = this;
    const {pattern, globals} = options;

    const appPath = loadDefaultPages._app;

    return WebpackDynamicEntryPlugin.getEntry({
      pattern: loadPagePath(pattern),
      generate: (entry) => {
        if (!entry['_404']) entry['_404'] = loadDefaultPages._404;

        return Object.assign.apply(Object, Object.keys(entry)
          .map((name) => {
            const loaderPath = require.resolve('../loaders/client-pages-loader.js');
            const entryVal = [`${loaderPath}?app=${appPath}&id=${globals.id}&context=${globals.context}!${entry[name]}`];

            if (dev) entryVal.unshift(
              // https://github.com/webpack-contrib/webpack-hot-middleware/issues/53#issuecomment-162823945
              'eventsource-polyfill',
              // https://github.com/glenjamin/webpack-hot-middleware#config
              'webpack-hot-middleware/client?path=/__nectary__/hmr'
            );
            return {[name]: entryVal};
          }))
      }
    });
  }

  output() {
    const {dev, assetsPath} = this;
    const output = super.output();
    return {
      ...output,
      filename: dev ? '[name].js' : assetsPath('js/[chunkhash:8].js'),
      chunkFilename: dev ? '[name].js' : assetsPath('js/[chunkhash:8].js')
    }
  }

  nodeEnv() {
    return Object.assign(
      super.nodeEnv(),
      {
        'process.browser': true,
        'process.client': true,
        'process.server': false
      }
    );
  }

  plugins() {
    const {dev, options, assetsPath} = this;
    const {publicPath, manifest} = options.build;

    const plugins = super.plugins();
    plugins.push(
      new MiniCssExtractPlugin({
        filename: dev ? '[name].css' : assetsPath('css/[contenthash:8].css'),
        chunkFilename: dev ? '[name].css' : assetsPath('css/[contenthash:8].css')
      }),
      new ClientManifestPlugin({
        publicPath,
        fileName: manifest
      })
    );

    if (dev) plugins.push(new webpack.HotModuleReplacementPlugin());

    return plugins;
  }

  optimization() {
    const {dev, options} = this;
    if (dev) return {};

    return {
      splitChunks: {
        cacheGroups: {
          vendor: {
            name: 'vendor',
            chunks: 'initial',
            test: ({resource}) => resource && /\.js$/.test(resource) && path.join(options.rootDir, 'node_modules') === 0
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
