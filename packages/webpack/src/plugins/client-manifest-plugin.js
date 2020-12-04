import WebpackManifestPlugin from 'webpack-manifest-plugin';

export default class ClientManifestPlugin extends WebpackManifestPlugin {
  constructor(options = {}) {
    super({
      ...options,
      fileName: options.fileName,
      generate: (seed, files, entryPoints) => Object.assign.apply(Object, Object.keys(entryPoints)
        .map((name) => {
          const files = entryPoints[name].map((file) => `${options.publicPath}${file}`);

          const scripts = files.filter((row) => /\.js$/.test(row))
            .filter(row => !/hot-update.js$/.test(row));

          const styles = files.filter((row) => /\.css$/.test(row));

          return {
            [name]: {
              scripts,
              styles
            }
          };
        }))
    });
  }
};
