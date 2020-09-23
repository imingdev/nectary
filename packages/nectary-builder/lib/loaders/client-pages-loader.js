/**
 * @intro: page-loader.
 */
const loaderUtils = require('loader-utils');
const {formatFilePath} = require('../utils/format');
const {resolve} = require('../utils/resolve');

module.exports = function () {
  const {resourcePath} = this;
  const {app, globalId} = loaderUtils.getOptions(this);
  const currentComponentPath = formatFilePath(resourcePath);
  const mainComponentPath = formatFilePath(resolve('lib/client/main.jsx'));
  const appComponentPath = formatFilePath(app);

  return `
    import App from '${appComponentPath}';
    import AppMain from '${mainComponentPath}';
    import AppPage from '${currentComponentPath}';

    setTimeout(function () {
      AppMain(AppPage, App, ${globalId});
    }, 0);
  `
};
