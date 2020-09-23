const {merge} = require('lodash');
const EventEmitter = require('events');
const nectaryDefaultConfig = require('./nectary.config');

class Nectary {
  constructor(options) {
    this.options = merge(nectaryDefaultConfig, options || {});
    this.entryPoints = {};
    this.event = new EventEmitter();
  }
  ready(){

  }
}

module.exports = Nectary;
