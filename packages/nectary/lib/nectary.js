const {merge} = require('lodash');
const consola = require('consola');
const Hookable = require('hable');
const nectaryDefaultConfig = require('./nectary.config');

class Nectary extends Hookable {
  constructor(options) {
    super(consola);

    this.options = merge(nectaryDefaultConfig, options || {});
  }

  ready() {

  }
}

module.exports = Nectary;
