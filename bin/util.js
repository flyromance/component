var glob = require('glob');

// type: js or html
exports.getEntry = function (ext) {
    ext = typeof ext === 'string' ? ext : 'js';

    var filenames = glob.sync('./src/*/*.' + ext);
    var ret = {};
    // var reg = /\.\/src\/(.*\/.*)\.js/;
    var reg = new RegExp('\\.\\/src\\/(.*\\/.*)\\.' + ext);

    // item的格式与输入的匹配模式一样
    filenames.forEach(function (item, index) {
        var match = null;

        if ((match = reg.exec(item)) && match[1]) {
            ret[match[1]] = item;
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
    var ret = [];

    // item的格式与输入的匹配模式一样
    filenames.forEach(function (item, index) {
        var options = {
            filename: '[name]'
            template: item,
            inject: false
        }

        ret.push(new HtmlWebpackPlugin(options));
    });


    return ret;
};
