var path = require('path')
var argv = require('minimist')(process.argv.slice(2));
console.log(argv);


module.exports = {
    env: {
        NODE_ENV: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    },
    proRoot: path.resolve(__dirname, '..'),
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