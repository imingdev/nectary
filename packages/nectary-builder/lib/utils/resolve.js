const path = require('path');
const {BUILD_SERVER_DIRECTORY, BUILD_PAGES_DIRECTORY} = require('./constants');

exports.resolve = dir => path.join(__dirname, '../', dir);

exports.resolveByProject = (...dir) => path.join(process.cwd(), ...dir);

exports.requireReactElement = (filePath) => {
  const {default: Component, getServerSideProps} = require(filePath);
  return {
    Component,
    getServerSideProps
  };
}

exports.resolveServerPagesFile = (rootPath, filePath) => exports.resolveByProject(rootPath, BUILD_SERVER_DIRECTORY, BUILD_PAGES_DIRECTORY, filePath);
