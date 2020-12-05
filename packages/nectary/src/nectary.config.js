const NODE_ENV = process.env.NODE_ENV || 'development';

export default {
  dev: NODE_ENV === 'development',
  env: {},
  build: {
    manifest: 'manifest.json',
    publicPath: '/',
    extend(config, {isDev, isClient, isServer}) {
      return config;
    },
    babel: {
      configFile: false,
      babelrc: false,
      compact: false,
      cacheDirectory: undefined
    },
    dir: {
      server: 'views',
      static: 'static'
    },
    filenames: {
      // { isDev, isClient, isServer }
      app: ({isDev}) => isDev ? '[name].js' : 'js/[contenthash:8].js',
      chunk: ({isDev}) => isDev ? '[name].js' : 'js/[contenthash:8].js',
      css: ({isDev}) => isDev ? '[name].css' : 'css/[contenthash:8].css',
      img: ({isDev}) => isDev ? '[path][name].[ext]' : 'images/[contenthash:8].[ext]',
      font: ({isDev}) => isDev ? '[path][name].[ext]' : 'fonts/[contenthash:8].[ext]',
      video: ({isDev}) => isDev ? '[path][name].[ext]' : 'videos/[contenthash:8].[ext]'
    }
  },
  server: {
    compressor: {
      threshold: 0
    },
    etag: {
      weak: false
    }
  },
  eslint: true,
  alias: {},
  buildDir: 'dist',
  rootDir: process.cwd(),
  srcDir: 'src',
  pageDir: 'pages',
  pattern: '**/index.{js,jsx}',
  globals: {
    id: 'app-main',
    context: '__INITIAL_STATE__'
  }
}
