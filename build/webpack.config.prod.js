var path = require('path')
var webpack = require('webpack')
var autoprefixer = require('autoprefixer')
var merge = require('webpack-merge')
var webpackBaseConfig = require('./webpack.config.base')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var $util = require('./util')

// --color --colors 默认为true
// --display-error-details  --display-reasons
// --hide-modules 隐藏modules
// --display-modules 默认为true

module.exports = merge(webpackBaseConfig, {
    entry: {

    },
    output: {

    },
    module: {
        rules: $util.styleLoader(),
    },
    plugins: [
        // new webpack.optimize.UglifyJsPlugin({
        //     // sourceMap: true,
        //     compress: {
        //         screw_ie8: false, //关闭忽略对IE8的支持
        //         warnings: false
        //     }
        // }),

        new ExtractTextPlugin({
            filename: '[name].css',
            allChunks: true, // 如果使用webpack.optimize.CommonsChunkPlugin, 必须用true
        }),
    ],
})
