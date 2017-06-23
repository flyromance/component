/** baseUrl：来源
 * 1、data-main的路径值，如果没有往下
 * 2、config配置中baseUrl，如果没有往下
 * 3、使用当前页面的路径
 */

/** 以下三种情况，会被认为是绝对路径，忽略baseUrl配置
 * 1、url有.js后缀
 * 2、以/开头
 * 3、以http(s)开头
 */

// require.config({
//     baseUrl: '/js',
//     paths: {
//         'event': 'module/event',
//         'inherit': 'module/inherit',
//         'widget': 'component/widget',
//         'layer': 'component/layer',
//         'template': 'lib/artTemplate'
//     }
// });

var inherit = require('./inherit');
var Widget = require('./widget');


require('./style/base.css');
require('./style/layer.css');

var cont_hbs = require('./template/cont.hbs');

var baseConf = {
    template: cont_hbs,
    data: null,
    events: null,
    width: 400,
    height: 'auto',
    parent: document.body,
    hasMask: true
};

var Layer = inherit(Widget, {
    initialize: function ($super, conf) {
        $super(conf);
    },
    setConf: function (conf) {
        this.conf = $.extend({}, baseConf, conf);
    },
    renderUI: function () {
        var that = this;
        
        this.$ui = $('<div class="j-ui-layer">' + this.conf.template(that.conf.data) + '</div>').css({
            position: 'fixed',
            left: '50%',
            top: '30%',
            zIndex: 1000,
            width: this.conf.width,
            height: this.conf.height,
            marginLeft: -this.conf.width / 2,
            overflow: 'hidden'
        });

        if (this.conf.hasMask) {
            this.$mask = $('<div class="mask-full-page"></div>').css({
                position: 'fixed',
                left: 0,
                top: 0,
                zIndex: 900,
                width: '100%',
                height: '100%',
                backgroundColor: 'gray'
            });
        }
    },
    bindUI: function () {
        var that = this;
        var events = this.conf.events,
            selector, eventType,
            reg = /^\s*([^\s]+)\s+([^\s]+).*/,
            match;
        for (var key in events) {
            match = reg.exec(key);
            if (match) {
                selector = match[1];
                eventType = match[2];
                this.$ui.on(eventType, selector, events[key]);
            }
        }

        if (this.conf.hasMask) {
            this.$mask.on('click', function (e) {
                that.hide();
            });
        }
    },
    mountUI: function () {
        $(document.body).append(this.$mask);
        $(this.conf.parent).append(this.$ui);
    },
    unMountUI: function () {
        this.trigger('beforeUnMount', 'beforeUnMount'); // 自定义事件，钩子函数

        this.$mask.off();
        this.$mask.remove();
        this.$ui.off();
        this.$ui.remove();

        this.trigger('afterUnMount', 'afterUnMount'); // 自定义事件
    },
    show: function () {
        this.trigger('beforeShow', 'aftershow'); // 自定义事件

        this.$mask.show();
        this.$ui.show().find('.layer-box').addClass('in');

        this.trigger('aftershow', 'aftershow'); // 自定义事件

        return this;
    },
    hide: function () {
        this.trigger('beforeHide', 'aftershow'); // 自定义事件

        this.$mask.hide();
        this.$ui.hide().find('.layer-box').removeClass('in');

        this.trigger('afterHide', 'afterhide'); // 自定义事件

        return this;
    }
});

module.exports = Layer;


