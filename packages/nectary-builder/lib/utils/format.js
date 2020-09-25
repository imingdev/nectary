const path = require('path');
const {BUILD_PAGES_DIRECTORY} = require('./constants')

// format file path
exports.formatFilePath = (_path) => {
  const sep = path.sep;
  if (_path.includes(sep)) {
    return _path.split(sep)
      .filter(Boolean)
      .join('/');
  }

  return _path;
};

// format webpack entry name
exports.formatEntryName = (_name) => exports.formatFilePath(_name).replace(new RegExp('/index$'), '');

// format webpack entry name to url
exports.formatEntryNameToUrl = entryName => ('/' + entryName
  .replace(new RegExp(`(^${BUILD_PAGES_DIRECTORY}/)?`), '')
  .replace(/_/g, ':')
  .replace(/^index$/, ''));
