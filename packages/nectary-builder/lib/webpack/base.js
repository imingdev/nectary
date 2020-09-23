const path = require('path');
const fs = require('fs');
const Glob = require('glob');
const GlobBase = require('glob-base');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge').default;
const WebpackBarPlugin = require('webpackbar');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackNodeExternals = require('webpack-node-externals');
const {formatEntryName, formatFilePath} = require('../utils/format');
const {resolve, resolveByProject} = require('../utils/resolve');
const {styleLoaders, assetsLoaders} = require('./loaders');
const {BUILD_SERVER_DIRECTORY, BUILD_PAGES_DIRECTORY, ASSETS_STATIC_DIRECTORY} = require('../utils/constants');

// 检查文件是否存在,存在返回当前路径
const checkFileExists = (file) => {
  const fileList = Array.isArray(file) ? file : [file];
  for (let i = 0; i < fileList.length; i++) {
    const currentFile = fileList[i];
    if (fs.existsSync(currentFile)) return currentFile
  }
  return false
}

module.exports = (options) => {
  const isClient = options.name === 'client';
  const mode = options.dev ? 'development' : 'production';
  const target = isClient ? 'web' : 'node';

  // get entry
  const entry = () => {
    const joinEntryGlobPath = dir => resolveByProject(options.srcDir, options.pageDir, dir);
    const AppComponentPath = checkFileExists([
        joinEntryGlobPath('_app.js'),
        joinEntryGlobPath('_app.jsx')
      ])
      || resolve('client/pages/_app.jsx');
    const patternList = [joinEntryGlobPath(options.build.pattern)];
    if (!isClient) {
      patternList.push(joinEntryGlobPath('_document.{js,jsx}'))
    }

    let entry = {}
    patternList.forEach((globStr, index) => {
      const globBase = GlobBase(globStr).base;
      const globPageList = (Glob.sync(globStr) || []).map(file => ({base: globBase, file}))
      if (index && !globPageList.length) {
        // 没有自定义document组件
        globPageList.push({base: resolve('client/pages'), file: resolve('client/pages/_document.jsx')})
      }
      globPageList.forEach(({base, file}) => {
        const fileName = formatEntryName(path.relative(base, file).replace(path.extname(file), ''));
        let entryName = `${BUILD_PAGES_DIRECTORY}/${fileName}`
        let entryFile = file

        if (isClient) {
          const clientLoader = resolve('webpack/loaders/client-pages-loader.js');
          entryName = fileName
          entryFile = `${clientLoader}?app=${AppComponentPath}&globalId=${options.globals.id}!${file}`
          if (options.dev) {
            entryFile = ['webpack-hot-middleware/client', entryFile]
          }
        }

        entry[entryName] = entryFile
      })
    });

    return entry;
  }

  // get output
  const output = () => {
    const out = {
      path: isClient ? resolveByProject(options.buildDir) : resolveByProject(options.buildDir, BUILD_SERVER_DIRECTORY),
      publicPath: options.build.publicPath
    };
    if (isClient && !options.dev) {
      out.filename = `${ASSETS_STATIC_DIRECTORY}/js/[chunkhash:8].js`;
      out.chunkFilename = `${ASSETS_STATIC_DIRECTORY}/js/[chunkhash:8].js`;
    } else {
      out.filename = '[name].js';
      out.chunkFilename = '[name].js';
    }

    if (!isClient) {
      out.libraryTarget = 'commonjs2';
    }

    return out;
  }

  // get loader rules
  const rules = () => {
    return [{
      test: /\.(js|jsx)$/,
      loader: 'babel-loader',
      include: [resolve('client'), process.cwd()]
    }]
      .concat(styleLoaders({sourceMap: options.dev, useIgnore: !isClient, extract: isClient}))
      .concat(assetsLoaders({emitFile: isClient}));
  }

  // get webpack plugins
  const plugins = () => {
    const barColors = {
      client: 'green',
      server: 'orange'
    }
    const result = [
      new WebpackBarPlugin({
        name: options.name,
        color: barColors[options.name]
      })
    ];

    if (isClient) {
      let cssExtractName = '[name].css';
      if (!options.dev) cssExtractName = `${ASSETS_STATIC_DIRECTORY}/css/[contenthash:8].css`;
      result.push(
        new MiniCssExtractPlugin({
          filename: cssExtractName,
          chunkFilename: cssExtractName
        })
      );
      if (options.dev) {
        result.push(
          new webpack.HotModuleReplacementPlugin(),
          new webpack.NoEmitOnErrorsPlugin()
        )
      }
    }

    return result;
  }

  const resultConfig = webpackMerge({
    name: options.name,
    mode,
    target,
    output: output(),
    module: {rules: rules()},
    resolve: {
      extensions: ['.js', '.jsx', '.json']
    },
    plugins: plugins()
  }, options.build.webpackConfig, {
    entry: entry()
  })

  if (!isClient) {
    resultConfig.externals = [
      WebpackNodeExternals()
    ]
  }
  return resultConfig
}
