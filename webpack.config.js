var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var autoprefixer = require('autoprefixer')

var $util = require('./bin/util.js')
var jsEntrys = $util.getEntry('js')

// var htmlEntrys = $util.getEntry('html');
// var htmlEntryPlugins = $util.getHtmlPlugins(HtmlWebpackPlugin);
// console.log(jsEntrys, htmlEntryPlugins);

var plugins = [
    new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        minChunks: 4
    })
]

if (process.env.NODE_ENV === 'production') {
    plugins = plugins.concat([
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
} else {
    plugins = plugins.concat([
        new webpack.HotModuleReplacementPlugin()
    ])
}

module.exports = {
    entry: Object.assign({
        'common': './src/common.js'
    }, jsEntrys),
    output: {
        path: path.resolve(__dirname, './dist'), // 2版本必须用绝对路径
        filename: '[name].js',
        publicPath: '/dist/',
        chunkFilename: '[name].js',
        library: '[name]',
        libraryTarget: "amd" //cmd umd window global
    },
    module: {
        rules: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            // loader 是 use 的简写; 
            // 使用use, 在这个配置上下文内，就不能使用options进行传递参数;
            // loaders 已经被废弃;
            loader: 'babel-loader', // 必须用loader，不能简写必须加loader后缀，多个用数组

            // 由于兼容性原因还能使用query进行配置；
            options: {
                presets: ['es2015']
            }
        }, {
            test: /\.hbs$/,
            exclude: /node_modules/,
            loader: 'handlebars-loader',
            options: {

            }
        }, {
            test: /\.art/,
            exclude: /node_modules/,
            loader: 'art-template-loader',
            options: {
                imports: path.resolve(__dirname, './bin/helpers/runtime.js')
            }
        }, {
            test: /\.html$/,
            exclude: /node_modules/,
            loader: 'html-loader'
        }, {
            test: /\.css$/,
            exclude: /node_modules/,
            loader: ['style-loader', {
                loader: 'css-loader'
            }, {
                loader: 'postcss-loader',
                options: {
                    plugins: [ autoprefixer ]
                }
            }]
        }, {
            test: /\.less$/,
            exclude: /node_modules/,
            use: ['style-loader', 'css-loader', {
                loader: 'postcss-loader',
                options: {
                    plugins: [ autoprefixer ]
                }
            }, {
                loader: 'less-loader',
                options: {
                    // onIeCompat: true, 
                }
            }]
        }, {
            test: /\.(png|jpg|gif|eot|svg|ttf|woff|woff2)$/i,
            exclude: /node_modules/,
            loader: 'url-loader',
            options: {
                limit: 2000,
                name: '[name]-[hash].[ext]'
            }
        }]
    },

    plugins: plugins,

    // cli配置参数的权重最大
    devServer: {
        historyApiFallback: true, // 
        publicPath: '/dist/', // 指定静态资源目录(入口级别)，权重比contentBase大; 用绝对路径
        // contentBase: '', // 指定静态资源目录
        inline: true,
        hot: true, // 启动热加载
        port: 8002, // 指定端口号
        open: true, // 自动打开浏览器
        quiet: false, // 不显示打包资源条目
        // color: true, // 只能在cli中调用, devServer.stid和devServer.info也是如此

        // setup在webpack3.0版本中将会被废弃，建议使用before
        before: function(app) {
            app.set('views', path.resolve(__dirname, './view'));
            // app.engine('html', ejs.__express);
            // app.set('view engine', 'html');
            app.set('view engine', 'ejs');

            var reg = /^\/([^\/]*)?(\.html)?$/;

            app.get(reg, function(req, res) {
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