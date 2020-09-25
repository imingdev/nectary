/**
 * @intro: page-loader.
 */
const loaderUtils = require('loader-utils');
const {formatFilePath} = require('../utils/format');
const {resolve} = require('../utils/resolve');

module.exports = function () {
  const {resourcePath} = this;
  const {app, globalId, globalContext, mode} = loaderUtils.getOptions(this);
  const currentComponentPath = formatFilePath(resourcePath);
  const mainComponentPath = formatFilePath(resolve('client/main.jsx'));
  const appComponentPath = formatFilePath(app);
  const isDev = mode === 'development';
  let hotAcceptCode = '';
  if (isDev) hotAcceptCode = ' if (module.hot) module.hot.accept();';

  return `
    import App from '${appComponentPath}';
    import AppMain from '${mainComponentPath}';
    import AppPage from '${currentComponentPath}';

    setTimeout(function () {
      AppMain({Component: AppPage, App: App, globalId: '${globalId}', globalContext: window.${globalContext}});
    }, 0);
    ${hotAcceptCode}
  `
};
