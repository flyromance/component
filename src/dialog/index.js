require('./style/index.css');

var default_conf = require('./script/config.js');

class Popup {
    constructor(conf) {
        this.conf = conf;
        this.init()
    }

    init(conf) {
        var that = this;

        that.$body = $('body');
        that.isShow = !!that.conf.isShow;
        that.isShow && that.show();
        that.bindEvent();
    }

    show(elem) {
        var that = this;

        that.isShow = true;
        that.$dialog = $(that.conf.template({
            title: that.conf.title,
            content: that.conf.content
        }));

        var cssObj = {
            border: '1px solid #333',
            borderRadius: '5px',
            textAlign: 'center',
            backgroundColor: '#fff'
        };

        if (that.conf.animate == 'fade') {

            if (that.conf.fixed === true) {
                $.extend(cssObj, {
                    position: 'fixed',
                    left: '50%',
                    top: '50%',
                    width: that.conf.w,
                    height: that.conf.h,
                    marginLeft: -that.conf.w / 2,
                    marginTop: -that.conf.h / 2,
                    opacity: 1,
                    display: 'none'
                });
            } else {
                $.extend(cssObj, {
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: that.conf.w,
                    height: that.conf.h,
                    marginLeft: -that.conf.w / 2,
                    marginTop: -that.conf.h / 2,
                    opacity: 1,
                    display: 'none'
                });
            }

            that.$dialog.css(cssObj).appendTo(that.$body).fadeIn();
        } else {

            that.$dialog.css({
                width: 0,
                height: 0,
                marginLeft: 0,
                marginTop: 0
            }).appendTo(that.$body).animate({
                width: that.conf.w,
                height: that.conf.h,
                marginLeft: -that.conf.w / 2,
                marginTop: -that.conf.h / 2
            });
        }
    }

    showModal() {
        var that = this;

        that.isShow = true;
        that.$modal = $('<div>', {
                class: 'dialog-modal'
            }).css({
                position: 'fixed', // zIndex默认为auto
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                display: 'none', // isHidden的元素，才能设置fadeIn和fadeTo
                zIndex: 0,
                backgroundColor: '#000',
                opacity: 0.6
            }).appendTo(that.$body)
            // .fadeIn()
            .fadeTo('fast', 0.6);

        that.show();
    }

    close() {
        var that = this;

        that.isShow = false;
        that.$modal && that.$modal.remove();
        that.$dialog.remove();
    }

    toggle() {
        var that = this;

        that.isShow ? that.close() : that.show();
    }

    remove() {
        that.$dialog.remove();
    }

    bindEvent() {
        var that = this;

        that.$body.on('click', '.dialog-close', function(e) {
            that.close();
        });

        if (that.conf.quickClose === true) {
            that.$body.on('click', '.dialog-modal', function(e) {
                that.close();
            });
        }

    }
}

function dialog(conf) {
    conf = $.extend({}, default_conf, conf);
    return new Popup(conf);
}

module.exports = dialog