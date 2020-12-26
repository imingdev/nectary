import webpack from 'webpack';
import WebpackDynamicEntryPlugin from 'webpack-dynamic-entry-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import OptimizeCSSPlugin from 'optimize-css-assets-webpack-plugin';
import ClientManifestPlugin from '../plugins/client-manifest-plugin';
import WebpackBaseConfig from './base';

export default class WebpackClientConfig extends WebpackBaseConfig {
  constructor(nectary) {
    super(nectary);
    this.name = 'client';
    this.isServer = false;
    this.isClient = true;
  }

  entry() {
    const {nectary, options, dev, loadDefaultPages} = this;
    const {globals} = options;

    const appPath = loadDefaultPages._app;

    return WebpackDynamicEntryPlugin.getEntry({
      pattern: [
        nectary.resolve.globPageDir,
        nectary.resolve.page('/_error.{js,jsx}')
      ],
      generate: (entry) => {
        if (!entry['_error']) entry['_error'] = loadDefaultPages._error;

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
    const {assetsPath} = this;
    const output = super.output();
    return {
      ...output,
      filename: assetsPath.app,
      chunkFilename: assetsPath.chunk
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
    const {nectary, dev, options, assetsPath} = this;
    const {publicPath, manifest} = options.build;

    const plugins = super.plugins();
    plugins.push(
      new MiniCssExtractPlugin({
        filename: assetsPath.css,
        chunkFilename: assetsPath.css
      }),
      new ClientManifestPlugin({
        publicPath,
        fileName: nectary.resolve.buildManifest
      })
    );

    if (dev) plugins.push(new webpack.HotModuleReplacementPlugin());

    return plugins;
  }

  optimization() {
    const {nectary, dev} = this;
    if (dev) return {};

    return {
      splitChunks: {
        cacheGroups: {
          vendor: {
            name: 'vendor',
            chunks: 'initial',
            test: ({resource}) => resource && /\.js$/.test(resource) && nectary.resolve.root('node_modules') === 0
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
