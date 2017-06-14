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

    },
    plugins: [].concat(htmlEntryPlugins)

}
