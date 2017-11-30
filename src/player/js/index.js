/** 
 * @api {get} require(["feb/video/index"],function(VideoBox){...}); Video
 * @apiGroup Components
 *
 * @apiDescription 播放器组件
 *  
 * 加载video或flash播放器
 *
 *  
 */

require('./css/common.css');


function supportVideo() {
    // ie 5 ~ 10 的userAgent才有msie这个字符串，而正好ie >= 11才能使用chimee
    if (navigator.userAgent.toLowerCase().indexOf('msie') > -1) {
        return false
    }

    // 排除不支持video的浏览器
    return !!document.createElement('video').canPlayType
}

const TPL_DEFAULT = require('./html/default.art');
const URL_GETSOURCE = "http://api.btime.com/video/play";
// const IS_SUPPORTVIDEO = supportVideo();
const IS_SUPPORTVIDEO = true;
let video_index = 0;


// const FlashClass = require('./js/flash');
// const VideoClass = require('./js/video');
const util = require('./js/util.js');

const default_config = {
    type: 'video', // 默认是使用video
    common_config: {
        scrollfixed: true,
        draggable: true,
        // autoPlay: true,
        // data: {},
    }
    // flash_config: {},
    // h5_config: {},
};

class PlayerClass {

    constructor(container, options) {
        if (typeof container !== 'string') throw new Error('container must be id string');
        this.container = container.charAt(0) === '#' ? container : '#' + container;

        this.options = $.extend(true, default_config, options || {});

        this.init();
    }

    init() {
        let that = this,
            opt = that.options,
            $box = null,
            $cont = $(that.container),
            video_player_id = `video-player-${video_index++}`;

        // 如果指定要用flash，就用flash，不指定并且支持vidoe就用video
        opt.type = opt.type === 'flash' ? 'flash' : IS_SUPPORTVIDEO ? 'video' : 'flash';

        if (typeof opt.template === 'undefined') {
            this.$box = $cont.html(TPL_DEFAULT({ draggable: opt.draggable })).find('.video-box');
        } else {
            this.$box = $cont.find('.video-box');
        }

        this.$view = $cont.find(".video-view")
        this.$video_player = $cont.find('.video-player').attr('id', video_player_id);
        this.$bar = $cont.find(".video-bar");
        this.$close = $cont.find('.video-close');

        this.createPlayer(video_player_id);
        this.bindEvent();
    }

    createPlayer(video_player_id) {
        var that = this;
        var opt = that.options;

        // 先不支持异步获取数据
        // if (typeof opt.data.source.done === 'function') {
        //     opt.data.videoSourceDfd.then((data) => {
        //         if (type === 'video') {
        //             import ( /* webpackChunkName: "feb/player/video" */ './js/video').then(VideoClass => {
        //                 new VideoClass(video_player_id, opt.h5_config);
        //             });
        //         } else {
        //             import ( /* webpackChunkName: "feb/player/flash" */ './js/flash').then(FlashClass => {
        //                 new FlashClass(video_player_id, opt.flash_config);
        //             });
        //         }
        //         // new FlashClass("#video_player", opt);
        //     });
        // } else {
        if (opt.type === 'video') {
            import ( /* webpackChunkName: "feb/player/video" */ './js/video').then(VideoClass => {
                new VideoClass(video_player_id, $.extend(true, opt.common_config, opt.h5_config));
            });
        } else {
            import ( /* webpackChunkName: "feb/player/flash" */ './js/flash').then(FlashClass => {
                new FlashClass(video_player_id, $.extend(true, opt.common_config, opt.flash_config));
            });
            // }
        }
    }

    //绑定事件
    bindEvent() {
        let opt = this.options;
        opt.scrollfixed && this.bindScroll();
        opt.draggable && this.bindDrag();
    }

    //滚动事件
    bindScroll() {
        let self = this;
        self.canFixed = true;
        var _scrollTop = 0;

        function handler() {
            var scrollTop = $(window).scrollTop(),
                wHeight = $(window).height(),
                elemHeight = self.$box.height(),
                elem_offset_top = self.$box.offset().top,
                max = elem_offset_top + elemHeight,
                min = elem_offset_top - wHeight,
                isInview = scrollTop > min && scrollTop < max;

            if (isInview) {
                self.canFixed = true;
                self.isFixed && self.setUnfixed();
            } else {
                self.canFixed && !self.isFixed && self.setFixed();
            }
        }

        $(window).on('scroll.video_player', util.throttle(handler));
        $(window).on('resize.video_player', util.throttle(handler));

        self.$close.on('click', function(e) {
            self.canFixed = false;
            self.setUnfixed();
        })
    }

    setUnfixed() {
        var self = this;

        self.isFixed = false;
        self.$box.removeClass('video-fixed');
        self.$view.css({
            bottom: '',
            right: '',
        });
    }

    setFixed() {
        var self = this;
        self.isFixed = true;
        self.$box.addClass('video-fixed');
        self.$view.css({
            bottom: self.bottom,
            right: self.right,
        });
    }


    //拖拽事件
    bindDrag() {
        let self = this;
        let $bar = this.$bar,
            $view = this.$view;

        $bar.on('mousedown', function(e) {
            let right, bottom,
                elementX = parseFloat($view.css('right')),
                elementY = parseFloat($view.css('bottom')),
                pointX = e.clientX,
                pointY = e.clientY,
                wWidth = $(window).width(),
                wHeight = $(window).height(),
                vWidth = $view.width(),
                vHeight = $view.height();

            $(document).on('mousemove.video-player', function(e) {

                let x = e.clientX,
                    y = e.clientY;

                self.right = right = Math.max(0, Math.min(elementX - (x - pointX), wWidth - $view.width()));
                self.bottom = bottom = Math.max(0, Math.min(elementY - (y - pointY), wHeight - $view.height()));

                $view.css({
                    bottom: bottom,
                    right: right,
                });
            });
            $(document).on('mouseup.video-player', function(e) {
                $(document).off('mousemove.video-player');
                $(document).off('mouseup.video-player');
            });
        });
    }

}

module.exports = PlayerClass;