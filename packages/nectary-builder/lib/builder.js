const webpack = require('webpack');
const getWebpackConfig = require('./webpack');

class Builder {
  constructor(nectary) {
    this.nectary = nectary;
    this.options = nectary.options;
    this.webpackConfig = getWebpackConfig(nectary.options);
  }

  ready() {
    const {client, server} = this.webpackConfig

    return webpack([client, server]);
  }
}

module.exports = Builder;
