const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
  dev: NODE_ENV === 'development',
  build: {
    manifestFileName: 'manifest.json',
    serverDir: 'views',
    publicPath: '/',
    extend(config, {isDev, isClient}) {

    }
  },
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
