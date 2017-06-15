var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var $util = require('./bin/util.js');
var jsEntrys = $util.getEntry('js');
// var htmlEntrys = $util.getEntry('html');
var htmlEntryPlugins = $util.getHtmlPlugins(HtmlWebpackPlugin);

// console.log(jsEntrys, htmlEntryPlugins);

module.exports = {
    entry: jsEntrys,
    output: {
        path: path.resolve(__dirname, './dist'), // 2版本必须用绝对路径
        filename: 'js/[name].[chunkhash].js'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.hbs$/,
                exclude: /node_modules/,
                loader: 'handlebars-loader'
            },
            // {
            //     test: /\.html$/,
            //     loader: 'ejs-loader'
            // },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.(png|jpg|gif)$/i,
                exclude: /node_modules/,
                loader: 'url-loader',
                query: {
                    limit: 2000,
                    name: '[name]-[hash].[ext]'
                }
            }
        ]
    },
    
    plugins: [].concat(htmlEntryPlugins),

    devServer: {
        historyApiFallback: true,
        publicPath: '/dist/',
        inline: true,
        hot: true,
        port: 8002,
        setup: function () {
            app.set('views', path.resolve(__dirname, './example'));
            app.set('view engine', 'html');

            app.get(/\/.*\.html/, function (req, res) {
                var name = req.path.replace(/\.html.*/, "").replace('/', '');
                res.render(name);
            });

            app.get("/", function (req, res) {
                res.redirect("/index.html");
            });
        }
    }

}
