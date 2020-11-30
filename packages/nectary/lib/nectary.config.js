const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
  dev: NODE_ENV === 'development',
  build: {
    manifest: 'manifest.json',
    serverDir: 'views',
    publicPath: '/',
    extend(config, {isDev, isClient, isServer}) {
      return config;
    },
    babel: {
      configFile: false,
      babelrc: false,
      cacheDirectory: undefined
    }
  },
  eslint: true,
  alias: {},
  buildDir: 'dist',
  srcDir: 'src',
  pageDir: 'pages',
  pattern: '**/index.{js,jsx}',
  globals: {
    id: 'app-main',
    context: '__INITIAL_STATE__'
  }
};
