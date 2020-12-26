import merge from 'lodash/merge';
import consola from 'consola';
import Hookable from 'hable';
import Server from '@nectary/server';
import Require from './lib/require'
import Resolve from './lib/resolve'

import defaultConfig from './config';

export default class Nectary extends Hookable {
  constructor(options) {
    super(consola);

    this.options = merge(defaultConfig, options || {});

    this.resolve = new Resolve(this);
    this.require = new Require(this);

    // Init server
    if (this.options.server !== false) {
      this._initServer();
    }
  }

  async ready() {
    if (this._ready) return this;
    this._ready = true;

    // Await for server to be ready
    if (this.server) {
      await this.server.ready();
    }

    return this;
  }

  _initServer() {
    if (this.server) return;

    this.server = new Server(this);
    this.render = this.server.app;
  }
};
