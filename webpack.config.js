var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var $util = require('./bin/util.js');
var jsEntrys = $util.getEntry('js');

// var htmlEntrys = $util.getEntry('html');
// var htmlEntryPlugins = $util.getHtmlPlugins(HtmlWebpackPlugin);
// console.log(jsEntrys, htmlEntryPlugins);

var plugins = [
    new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        minChunks: 4
    })
];

if (process.env.NODE_ENV == 'production') {
    console.log(123);
    plugins.concat([
        // webpack编译时遇到process.env.NODE_ENV, 就把它替换为production
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),

        // 压缩js
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                screw_ie8: false, //关闭忽略对IE8的支持
                warnings: false
            }
        })
    ]);
}

module.exports = {
    entry: Object.assign({
        'common': './src/common.js'
    }, jsEntrys),
    output: {
        path: path.resolve(__dirname, './dist'), // 2版本必须用绝对路径
        filename: '[name].js',
        // publicPath: '',
        chunkFilename: '[name].js',
        library: '[name]',
        libraryTarget: "amd" //cmd umd window global
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
            }
        ]
    },

    plugins: plugins,

    devServer: {
        historyApiFallback: true,
        publicPath: '/dist/',
        // inline: true,
        // hot: true, // 不能在config.js中配置
        port: 8002,
        open: true,
        setup: function (app) {
            app.set('views', path.resolve(__dirname, './view'));
            // app.engine('html', ejs.__express);
            // app.set('view engine', 'html');
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
    },
    externals: {
        // webpack编译时把 var $ = require('jquery') 转为 var $ = window.jQuery;
        'jquery': 'window.jQuery'
    }

}
