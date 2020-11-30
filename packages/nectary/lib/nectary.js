const merge = require('lodash/merge');
const consola = require('consola');
const Hookable = require('hable');
const Server = require('nectary-server');
const nectaryDefaultConfig = require('./nectary.config');

module.exports = class Nectary extends Hookable {
  constructor(options) {
    super(consola);

    this.options = merge(nectaryDefaultConfig, options || {});

    // Init server
    this._initServer();

    // Call ready
    this.ready();
  }

  async ready() {
    if (this._ready) return this;
    this._ready = true;

    // Await for server to be ready
    if (this.server) await this.server.ready();

    return this;
  }

  _initServer() {
    if (this.server) return;

    this.server = new Server(this);
    this.render = this.server.app;
  }

  requireModule(_path) {
    return require(require.resolve(_path));
  }
};
