/** 
 *  加载一个flash播放器并播放传入内容
 *  
 */

const swfobject = require('./swfobject');

const default_config = {
    swfUrlStr: '//s0.ssl.qhimg.com/static/e5ec8c52d1f8ea59.swf',
    replaceElemIdStr: '',
    widthStr: '100%',
    heightStr: '100%',
    swfVersionStr: '6.0.6',
    xiSwfUrlStr: "http://s1.qhimg.com/static/db3e04bd6db0bbba.swf", // 快速安装swf地址
    flashvarsObj: { // <param name='flashvars' value={{JSON.stringify(obj)}} />, 用于给flash自定义的参数
        // sn: '', // 这个视频播放地址一般都是异步获取
    },
    parObj: { // <param name='menu' value='false' />
        menu: "false",
        wmode: "window",
        bgcolor: "#000000",
        allowFullScreen: "true",
        allowScriptAccess: "always",
        wmode: "transparent",
        movie: '//s0.ssl.qhimg.com/static/e5ec8c52d1f8ea59.swf', // 用于ie 
        // sn: 就是上面的 flashvarsObj
    },
    attObj: { // 设置object的属性<object key=value></object>

    },
    callbackFn: function() {}, // 插入完flash的回调函数，但是不是flash加载完成的回调函数！！
}


class FlashClass {

    constructor(id, options) {
        let self = this;

        if (typeof id === 'string' || (id.nodeType === 1)) {
            options = options || {};
            options.replaceElemIdStr = id;
        }

        this.options = $.extend(true, {}, default_config, options || {});

        this.init();
    }

    init() {
        let opt = this.options;

        opt.flashvarsObj.sn = encodeURIComponent(JSON.stringify(opt.data.source));

        // flash不太一样，必须传1或者0
        if (opt.autoPlay === true) {
            opt.flashvarsObj.autoPlay = 1;
        } else {
            opt.flashvarsObj.autoPlay = 0;
        }

        console.log(opt);

        this.ready = $.Deferred();
        this.render();
    }

    render(data) {
        let self = this,
            opt = this.options;

        swfobject.embedSWF(opt.swfUrlStr, opt.replaceElemIdStr, opt.widthStr, opt.heightStr,
            opt.swfVersionStr, opt.xiSwfUrlStr, opt.flashvarsObj, opt.parObj, opt.attObj, opt.callbackFn.bind(self));

        // 获取flash object
        this.flasher = document.getElementById(opt.replaceElemIdStr);

        // 给flash传送: 暂停居中广告、右下角悬浮广告、播放结束广告数据
        this.onload(function() {

            // 异步
            if (typeof opt.data.endNews === 'function') {
                opt.data.endNews.done(function(data) {
                    data && self.flasher.initRepData(JSON.stringify(data));                 
                })
            } else {
                opt.data.endNews && self.flasher.initRepData(JSON.stringify(opt.data.endNews)); // 同步
            }

            opt.data.pause && self.flasher.initPauseAdvert(JSON.stringify(opt.data.pause)); // 同步数据
            opt.data.float && self.flasher.initFloatAdvert(JSON.stringify(opt.data.float)); // 同步数据
        });
    }

    onload(cb) {
        this.ready.done(cb);
    }

    setLoad() {
        this.ready.resolve();
    }

    setUnload() {
        this.ready.reject();
    }
}

module.exports = FlashClass;