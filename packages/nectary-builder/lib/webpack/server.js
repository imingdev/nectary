const baseConfig = require('./base')

module.exports = (opt) => baseConfig({...opt || {}, name: 'server'})
