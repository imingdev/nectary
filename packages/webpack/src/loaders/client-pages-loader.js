/**
 * @intro: page-loader.
 */
import loaderUtils from 'loader-utils';
import template from 'lodash/template';
import {readFileSync} from 'fs';
import {formatFilePath} from '../utils/format';

export default function () {
  const {resourcePath} = this;
  const {app, id, context} = loaderUtils.getOptions(this);

  const appPath = formatFilePath(app);
  const componentPath = formatFilePath(resourcePath);

  const compiled = template(readFileSync(require.resolve('./client-template')));

  return compiled({
    appPath,
    componentPath,
    context,
    id
  });
};
