var glob = require('glob');

var chunksCache = null

// type: js or html
exports.getEntry = function (ext) {
    ext = typeof ext === 'string' ? ext : 'js';

    var filenames = glob.sync('./src/*/*.' + ext);
    var ret = {};
    // var reg = /\.\/src\/(.*\/.*)\.js/;
    var reg = new RegExp('\\.\\/src\\/(.*\\/.*)\\.' + ext);

    chunksCache = [];

    // item的格式与输入的匹配模式一样
    filenames.forEach(function (item, index) {
        var match = null;

        if ((match = reg.exec(item)) && match[1]) {
            ret[match[1]] = item;
            chunksCache.push(match[1]);
        }
    });

    return ret;
};



exports.getJsEntry = function () {
    return getEntry('js');
};


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
