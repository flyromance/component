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
        filename: '[name].js',
        // publicPath: '',
        // library: '[name]',
        // libraryTarget: "amd"
    },
    module: {
        rules: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader', // 必须用loader，不能简写必须加loader后缀，多个用数组
            options: { // 必须用options配置loader参数
                presets: ['es2015']
            }
        }, {
            test: /\.hbs$/,
            exclude: /node_modules/,
            loader: 'handlebars-loader',
            options: {

            }
        },
        // {
        //     test: /\.html$/,
        //     loader: 'ejs-loader'
        // },
        {
            test: /\.css$/,
            exclude: /node_modules/,
            loader: ['style-loader', 'css-loader']
        }, {
            test: /\.(png|jpg|gif)$/i,
            exclude: /node_modules/,
            loader: 'url-loader',
            options: {
                limit: 2000,
                name: '[name]-[hash].[ext]'
            }
        }]
    },

    // plugins: [].concat(htmlEntryPlugins),

    devServer: {
        historyApiFallback: true,
        publicPath: '/dist/',
        // inline: true,
        // hot: true, // 不能在config.js中配置
        port: 8002,
        open: true,
        setup: function (app) {
            app.set('views', path.resolve(__dirname, './example'));
            // app.engine('html', hbs.__express);
            app.set('view engine', 'ejs');

            var reg = /^\/([^\/]*)?(\.html)?$/;

            app.get(reg, function (req, res) {
                // var name = req.path.replace(/\.html.*/, "").replace('/', '');
                // console.log(req.path);
                var match = req.path.match(reg);
                var name = match ? match[1] ? match[1] : '' : '';
                name = name || 'index';
                res.render(name);
            });

            // app.get("/", function (req, res) {
            //     res.redirect("/index");
            // });
        },
        proxy: {
            '/api/*': {
                // 当前devserver去请求127.0.0.1:7788 
                // 前端不存在跨域
                target: 'http://127.0.0.1:7788',
                // pathRewrite: { '^/api': '/campaign_huggies/t3store_freeuse/admin' },
                changeOrigin: true
            }
        }
    }

}
