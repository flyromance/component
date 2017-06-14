var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var $util = require('./bin/util.js');
var jsEntrys = $util.getEntry('js');
// var htmlEntrys = $util.getEntry('html');
var htmlEntryPlugins = $util.getHtmlPlugins(HtmlWebpackPlugin);

console.log(jsEntrys, htmlEntryPlugins);

module.exports = {
    entry: jsEntrys,
    output: {
        path: path.resolve(__dirname, './dist'), // 2版本必须用绝对路径
        filename: 'js/[name].[chunkhash].js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel',
                query: {
                    presets: ['es2015', 'react']
                }
            },
            {   
                test: /\.hbs/,
                loader: 'handlebars'
            },
            {
                test: /\.html/,
                loader: 'html-loader'
            },
            {
                test: /\.css$/,
                loader: 'style!loader!postcss',

            },
            {
                test: /\.(png|jpg|jpeg|gif|.ico)/i,
                loader: 'url-loader',
                query: {
                    limit: 2000
                }
            }
        ]
    },
    plugins: [].concat(htmlEntryPlugins)

}
