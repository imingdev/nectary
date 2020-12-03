import {sep} from 'path';

// format file path
export const formatFilePath = (_path) => {
  if (_path.includes(sep)) {
    return _path.split(sep)
      .join('/');
  }

  return _path;
};

// format webpack entry name
export const formatEntryName = (_name) => formatFilePath(_name)
  .replace(new RegExp('/index$'), '');
