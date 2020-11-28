/**
 * @intro: page-loader.
 */
const path = require('path');
const loaderUtils = require('loader-utils');
const {formatFilePath} = require('../utils/format');

const resolve = (dir) => path.join(__dirname, '..', dir);

module.exports = function () {
  const {resourcePath} = this;
  const {app, id, context} = loaderUtils.getOptions(this);
  const mainPath = formatFilePath(resolve('client/main'));

  const appPath = formatFilePath(app);
  const componentPath = formatFilePath(resourcePath);

  return `
    import Main from '${mainPath}';

    import App from '${appPath}';
    import Component from '${componentPath}';

    // App, Component, context, id
    Main(App, Component, '${context}', '${id}');
  `;
};
