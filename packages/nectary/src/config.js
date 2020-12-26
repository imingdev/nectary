const NODE_ENV = process.env.NODE_ENV || 'development';

export default {
  dev: NODE_ENV === 'development',
  env: {},
  build: {
    publicPath: '/',
    dir: {
      manifest: 'manifest.json',
      server: 'server/views',
      static: 'static'
    },
    alias: {},
    watch: {
      aggregateTimeout: 1000
    },
    extend(config, {isDev, isClient, isServer}) {
      return config;
    },
    babel: {
      configFile: false,
      babelrc: false,
      compact: false,
      cacheDirectory: undefined
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
    port: process.env.PORT || process.env.npm_config_port || 9001,
    host: process.env.HOST || process.env.npm_config_host || 'localhost',
    compressor: {
      threshold: 0
    },
    etag: {
      weak: false
    }
  },
  dir: {
    root: process.cwd(),
    src: 'src',
    page: 'pages',
    build: 'dist',
  },
  pattern: '**/index.{js,jsx}',
  globals: {
    id: 'app-main',
    context: '__INITIAL_STATE__'
  }
}
