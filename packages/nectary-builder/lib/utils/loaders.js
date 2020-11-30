const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const resolve = (dir) => path.join(__dirname, '..', dir);

exports.cssLoaders = (options = {}) => {
  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  };

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap
    }
  };

  // generate loader string to be used with extract text plugin
  const generateLoaders = (loader, loaderOptions) => {
    const loaders = [cssLoader, postcssLoader];

    if (loader) {
      loaders.push({
        loader: `${loader}-loader`,
        options: {
          ...loaderOptions,
          sourceMap: options.sourceMap
        }
      });
    }
    if (options.extract) return [MiniCssExtractPlugin.loader].concat(loaders);

    return loaders;
  };

  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', {indentedSyntax: true}),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  };
};

exports.styleLoaders = (options = {}) => {
  const output = [];
  const loaders = exports.cssLoaders(options);

  for (const extension in loaders) {
    const loader = loaders[extension];
    output.push({
      test: new RegExp(`\\.${extension}$`),
      use: options.useIgnore ? [resolve('loaders/ignore-loader.js')] : loader
    });
  }

  return output;
};

exports.assetsLoaders = ({emitFile = true, assetsPath} = {}) => {
  const loader = 'url-loader';
  const limit = 1000;

  return [{
    test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
    loader,
    options: {
      limit,
      emitFile,
      name: assetsPath('images/[hash:8].[ext]')
    }
  }, {
    test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
    loader,
    options: {
      limit,
      emitFile,
      name: assetsPath('images/[hash:8].[ext]')
    }
  }, {
    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
    loader,
    options: {
      limit,
      emitFile,
      name: assetsPath('fonts/[hash:8].[ext]')
    }
  }];
};
