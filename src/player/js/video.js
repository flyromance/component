/** 
 *  基于chimee开发加载video标签视频
 *  
 */


const ChimeePlayer = require('chimee-player');

require('../css/video.scss');

var tpl_end = require('../html/video-end.art');

var defalut_config = {

}

class VideoClass {

    constructor(container, options) {
        if (typeof container === 'object') {
            this.container = options.container;
        } else {
            this.container = container;
        }

        this.options = $.extend(true, defalut_config, options);
        console.log(this.options)
        this.init()
    }

    init() {
        var that = this;
        var opt = this.options;

        try {
            var floatData = opt.data.float.ads[0].ad_material;
            var float_conf = {
                width: floatData.width,
                height: floatData.height,
                src: floatData.src,
                url: floatData.url,
                is_show_close: !!floatData.is_show_close,
                is_show_mark: !!floatData.is_show_mark
            }

            var pauseData = opt.data.pause.ads[0].ad_material;
            var pause_conf = {
                width: pauseData.width,
                height: pauseData.height,
                src: pauseData.src,
                url: pauseData.url,
                is_show_close: !!pauseData.is_show_close,
                is_show_mark: !!pauseData.is_show_mark
            }

            var ad_mark = {
                src: 'https://cpro.baidustatic.com/cpro/ui/noexpire/img/newBDlogo/wap_ads_2x.png',
                width: 26,
                height: 14,
            }
        } catch (e) {
            float_conf = {
                width: '200px',
                height: '200px',
            }
        }

        const pause_popup_plugin = {
            name: 'pause_popup',
            className: 'chimme-popup chimme-popup-pause',
            // 使用 el 设置插件的容器 HTMLTagName
            el: `<chimee-pause-popup style="width:${pause_conf.width}px;height:${pause_conf.height}px;">
                </chimee-pause-popup>`,
            // 在插件创建生命周期，实现DOM结构和基本的交互行为
            create() {
                this.$dom.innerHTML = `
                    <pp-close title="close" class="chimme-close">×</pp-close>
                    <pp-content>
                        <img src="${pause_conf.src}" width="${pause_conf.width}" height="${pause_conf.height}"/>
                    </pp-content>
                    <pp-mark class='chimme-mark'>
                        <img src="${ad_mark.src}" width="${ad_mark.width}" height="${ad_mark.height}"/>
                    </pp-mark>
                `;
                // 为关闭按钮绑定关闭交互
                this.$dom.querySelector('pp-close').addEventListener('click', this.close);
            },
            methods: {
                // 为插件实现关闭功能
                close() {
                    this.$dom.style.display = 'none';
                    // 开始播放
                    this.$emit('play');
                    // 通知全局popup关闭了，并通过参数将关闭的popup实例传递过去
                    this.$emit('popupClose', this);

                    // 打点
                    // opt.log()
                },
                // 为插件实现开启功能
                open() {

                    // 结束的时候，因为要显示最后的新闻，这边就不能显示暂停广告
                    if (this.currentTime === this.duration) {
                        return;
                    }
                    // 提升z-index为最高
                    this.$bumpToTop();
                    this.$dom.style.display = 'block';
                    // 暂停播放
                    this.$emit('pause');
                    // 通知全局popup打开了，并通过参数将关闭的popup实例传递过去
                    this.$emit('popupOpen', this);

                    // 打点
                    // opt.log()
                }
            },
            events: {
                // 监听播放器播放事件，以实现播放时自动关闭popup
                play() {
                    this.close();
                },
                // 监听播放器暂停事件，以实现暂停时自动打开popup
                pause() {
                    this.open();
                }
            }
        };

        const float_popup_plugin = {
            // 插件名为 controller 
            name: 'float_popup',
            className: 'chimme-popup chimme-popup-float',
            // 插件实体为按钮
            el: `<chimee-float-popup  style="width:${float_conf.width}px;height:${float_conf.height}px">
                </chimee-float-popup>`,
            methods: {
                close() {
                    this.$dom.style.display = 'none';
                }
            },
            // 在插件创建的阶段，我们为插件绑定事件。
            create() {
                this.$dom.innerHTML = `
                    <pp-close title="close" class="chimme-close">×</pp-close>
                    <pp-content>
                        <img src="${float_conf.src}" width="${float_conf.width}" height="${float_conf.height}"/>
                    </pp-content>
                    <pp-mark class="chimme-mark">
                        <img src="${ad_mark.src}" width="${ad_mark.width}" height="${ad_mark.height}"/>
                    </pp-mark>
                `;

                this.$dom.querySelector('pp-close').addEventListener('click', this.close);
            },
            // 插件会在播放暂停操作发生后改变自己的文案及相应的行为
            events: {

            }
        };

        class ClockTimer {
            constructor(num, handler) {
                var self = this;
                this.num = num || 5;
                this.handler = handler || function() {};

                function _handler() {
                    var ret = handler.call(self, self.num--);
                    if (ret === false || self.num < 0) {
                        return;
                    }
                    self.timer = setTimeout(_handler, 1000);
                }

                _handler()
            }
        }

        const end_popup_plugin = {
            name: 'end_pop',
            className: 'chimme-popup-end',
            el: `<chimee-end-popup></chimee-end-popup>`,
            methods: {
                open() {
                    var self = this;

                    if (this.currentTime === this.duration) {
                        this.$dom.style.display = 'block';
                        this.$bumpToTop();
                    self.clockTimer = new ClockTimer(5, function(num) {
                            self.$dom.querySelector('.J_chimme-clock-num').innerHTML = num;
                            if (num === 0) {
                                // 下一条
                                console.log('clock next');
                            }
                        })
                        // 通知全局popup打开了，并通过参数将关闭的popup实例传递过去
                        this.$emit('popupOpen', this);
                    }
                },
                close() {
                    this.$dom.style.display = 'none';
                },
                reset() {
                    document.querySelector('.J_chimme-end-footer').classList.remove('chimme-end-footer-cancel');
                }
            },
            create() {
                var self = this;

                this.$dom.innerHTML = tpl_end({
                    title: '精彩推荐',
                    list: opt.data.endNews,
                    next: {
                        title: 'xlsflasjdflsjd',
                        href: 'www.baidu.com'
                    }
                });

                var delegates = ['.J_icon_cancel', '.J_icon_replay', '.J_icon_play'];
                this.$dom.querySelector('.J_icon_footer').addEventListener('click', function(e) {
                    var wrapper = this;
                    var target = e.target;
                    delegates.forEach(function(selector, index) {
                        var item = wrapper.querySelector(selector);
                        if (item === target || item.contains(target)) {
                            switch (selector) {
                                case '.J_icon_cancel':
                                    document.querySelector('.J_chimme-end-footer').classList.add('chimme-end-footer-cancel');
                                    clearTimeout(self.clockTimer.timer);
                                    break;
                                case '.J_icon_play':
                                    // 下一条
                                    console.log('next')
                                    break;
                                case '.J_icon_replay':
                                    player.play();
                                    self.reset();
                                    break;
                            }
                            return false
                        }
                    })
                })
            },
            events: {
                // 监听播放器暂停事件，以实现暂停时自动打开popup
                pause() {
                    this.open();
                },

                play() {
                    this.close()
                }
            }
        };


        ChimeePlayer.install(pause_popup_plugin);
        ChimeePlayer.install(float_popup_plugin);
        ChimeePlayer.install(end_popup_plugin);

        var player = that.player = new ChimeePlayer({
            wrapper: '#' + this.container, // video dom容器
            src: opt.data.source[opt.data.source.default],
            // box: 'hls',
            // isLive: true,
            autoplay: !!opt.autoplay,
            controls: true,
            plugin: ['pause_popup', 'float_popup', 'end_pop']
        });

        window.ChimeePlayer = ChimeePlayer;

        opt.callbackFn.call(player, player);



        // that.player.play();
    }
}


module.exports = VideoClass;