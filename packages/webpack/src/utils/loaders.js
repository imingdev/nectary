import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const resolve = (dir) => path.join(__dirname, '..', dir);

export const cssLoaders = (options = {}) => {
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

export const styleLoaders = (options = {}) => {
  const output = [];
  const loaders = cssLoaders(options);

  for (const extension in loaders) {
    const loader = loaders[extension];
    output.push({
      test: new RegExp(`\\.${extension}$`),
      use: loader
    });
  }

  return output;
};

export const assetsLoaders = ({emitFile = true, assetsPath} = {}) => {
  const loader = 'url-loader';
  const limit = 1000;

  return [{
    test: /\.(png|jpe?g|gif|svg|webp|avif)$/i,
    loader,
    options: {
      limit,
      emitFile,
      name: assetsPath.img
    }
  }, {
    test: /\.(webm|mp4|ogv)$/i,
    loader,
    options: {
      limit,
      emitFile,
      name: assetsPath.video
    }
  }, {
    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
    loader,
    options: {
      limit,
      emitFile,
      name: assetsPath.font
    }
  }];
};
