var path = require('path')
var minimist = require('minimist')(process.argv.slice(2))


module.exports = {
    env: {
        NODE_ENV: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    },
    srcRoot: path.resolve(__dirname, '../src'),
    distRoot: path.resolve(__dirname, '../dist'),
    port: process.env.PORT || 9090,
    autoOpenBrowser: true,
    libarayTarget: '',
    prod: {
    },
    dev: {
        
    }
}