var glob = require('glob')
var config = require('../config')
var path = require('path')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var Router = require('express').Router;

// type: js or html
exports.getEntry = function (ext) {
    ext = typeof ext === 'string' ? ext : 'js';
    var srcPattern = path.join(config.srcRoot, '*/*.entry.' + ext);
    var filenames = glob.sync(srcPattern);

    var ret = {};
    var reg = new RegExp('\\/src\\/(\\w+\\/\\w+)\\.entry.' + ext);

    // item的格式与输入的匹配模式一样
    filenames.forEach(function (item, index) {
        var match = null;

        if ((match = reg.exec(item)) && match[1]) {
            ret[match[1]] = item;
        }
    });

    return ret;
};

exports.styleLoader = function () {
    var ret = [];
    if (config.env.NODE_ENV === 'production') {
        ret.push(
            {
                test: /\.css$/i,
                exclude: /node_modules/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader',
                    ],
                })
            },
            {
                test: /\.scss$/i,
                exclude: /node_modules/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'style-loader',
                        'css-loader',
                        // ['postcss-loader', {
                        //     plugins: [autoprefixer]
                        // }],
                        'sass-loader',
                    ],
                })
            }
        )
    } else {
        ret.push(
            {
                test: /\.css$/i,
                exclude: /node_modules/,
                loader: [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test: /\.scss$/i,
                exclude: /node_modules/,
                loader: [
                    'style-loader',
                    'css-loader',
                    // ['postcss-loader', {
                    //     plugins: [autoprefixer]
                    // }],
                    'sass-loader',
                ],
            }
        )
    }
    return ret;
}


exports.getHtmlPlugins = function (HtmlWebpackPlugin) {
    var ret = [];

    var filenames = glob.sync('./src/*/*.html');
    var reg = /\.\/src\/(.*)\/.*\.html/;
    var ret = [];

    // item的格式与输入的匹配模式一样
    filenames.forEach(function (item, index) {

        var chunks = [];
        var chunkname = reg.exec(item)[1];
        chunksCache.forEach(function (item) {
            if (item.indexOf(chunkname) != -1) {
                chunks.push(item);
            }
        });

        var options = {
            filename: chunkname + '.html',
            template: item,
            inject: true,
            chunks: chunks
        }

        ret.push(new HtmlWebpackPlugin(options));
    });


    return ret;
};

exports.getViewRouter = function () {
    var router = new Router();

    router.get(/\/[\w-]+\.html/, function (req, res) {
        var match = req.path.match(/\/([\w-]+)\.html/i);
        var pageName = match ? match[1] : 'index';
        res.render(pageName)
    });

    return router;
}
