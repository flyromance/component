var path = require('path')
var webpack = require('webpack')
var merge = require('webpack-merge')
var config = require('../config')
var express= require('express')

module.exports = merge(webpackBaseConfig, {
    entry: {
        
    },
    output: {
        
    },
    module: {
        rules: [],
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
        historyApiFallback: true, // 
        // publicPath: '', // 指定静态资源目录(入口级别)，权重比contentBase大; 用绝对路径
        contentBase: [path.join(__dirname, '../dist'), path.join(__dirname, '../public')], // 指定静态资源目录
        inline: true,
        hot: true, // 启动热加载
        port: config.port, 
        open: config.autoOpenBrowser, // 自动打开浏览器
        quiet: false, // 不显示打包资源条目
        // color: true, // 只能在cli中调用, devServer.stid和devServer.info也是如此
        // setup在webpack3.0版本中将会被废弃，建议使用before
        before: function (app) {
            app.set('views', path.resolve(__dirname, './views')); 
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
    devtool: 'source-map'
})