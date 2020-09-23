const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
  dev: NODE_ENV === 'development',
  server: {
    host: 'localhost',
    port: 9001
  },
  build: {
    pattern: '**/index.{js,jsx}',
    publicPath: '/',
    webpackConfig: {}
  },
  buildDir: 'dist',
  srcDir: 'src',
  pageDir: 'pages',
  globals: {
    id: 'app-main',
    context: '__INITIAL_STATE__'
  }
};
