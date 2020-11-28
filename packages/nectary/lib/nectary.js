const merge = require('lodash/merge');
const consola = require('consola');
const Hookable = require('hable');
const Server = require('nectary-server');
const nectaryDefaultConfig = require('./nectary.config');

module.exports = class Nectary extends Hookable {
  constructor(options) {
    super(consola);

    this.options = merge(nectaryDefaultConfig, options || {});

    // Call ready
    this.ready();
  }

  ready() {
    if (this._ready) return this;
    this._ready = true;

    this.server = new Server(this);
    this.render = this.server.app;

    return this;
  }
};
