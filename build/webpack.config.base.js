var path = require('path')
var webpack = require('webpack')
var $util = require('./util.js')
var config = require('../config')
var autoprefixer = require('autoprefixer')

function resolve(dir) {
    return path.resolve(__dirname, '..', dir || '')
}

module.exports = {
    // context: '', // process.cwd
    entry: Object.assign({
        common: path.join(config.srcRoot, 'common/index.js'),
    }, $util.getEntry()),
    output: {
        path: config.distRoot,
        filename: '[name].js',
        publicPath: '/static/', // 默认是''
        chunkFilename: '[name].js', // [id].js
        // library: 'mybli',
        // libraryTarget: 'amd', // cmd amd global
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/i,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                test: /\.art$/i,
                include: [resolve('src')],
                loader: 'art-template-loader',
                options: {
                    imports: path.resolve(__dirname, './template/art.runtime.js')
                }
            },
            {
                test: /\.hbs$/i,
                include: [resolve('src')],
                loader: 'handlebars-loader',
                options: {
                    // imports: path.resolve('./template/hbs.runtime.js')
                }
            },
            {
                test: /\.(png|jpg|jpeg|gif|eot|svg|ttf|woff|woff2)$/i,
                exclude: /node_modules/,
                loader: 'url-loader',
                options: {
                    limit: 2000,
                    name: '[name].[hash].[ext]',
                }
            },
            // {  
            //     test: require.resolve('jquery'), // 如果本地安装jquery, 返回绝对路径
            //     use: [
            //         {
            //             loader: 'expose-loader',
            //             options: 'jQuery',
            //         },
            //         {
            //             loader: 'expose-loader',
            //             options: '$',
            //         }
            //     ],
            // }
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'common',
            minChunks: 2, // 默认是chunk入口的数量
        }),

        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(config.env.NODE_ENV),
        }),

    ],
    resolve: {
        alias: {
            '@': resolve('src'),
        },
        // modules: ['node_modules'],
        // extensions: ['', '.js', '.json'], // 注意3版本不需要''
        // mainFields: ['browser', 'module', 'main'], // 指定package.json中查找字段
    },
    externals: {
        // 'jquery': 'window.jQuery', // 外部单独script引用
    },
    // target: 'web', 

}