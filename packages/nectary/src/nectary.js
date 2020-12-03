import merge from 'lodash/merge';
import consola from 'consola';
import Hookable from 'hable';

import defaultConfig from './nectary.config';

export default class Nectary extends Hookable {
  constructor(options) {
    super(consola);

    this.options = merge(defaultConfig, options || {});
  }
};
