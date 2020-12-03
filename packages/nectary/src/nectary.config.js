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
