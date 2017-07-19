require('./style/index.css');

var default_conf = require('./script/config.js');

var zIndex = 1000;

class Popup {
    constructor(conf) {
        this.conf = conf;
        this._init()
    }

    _init(conf) {
        var that = this;

        that.$body = $('body');
        that._render();
        that._bindEvent();
    }

    _render() {
        var that = this;

        that.$dialog = $(that.conf.template({
            title: that.conf.title,
            content: that.conf.content,
            okValue: that.conf.okValue,
            btnOk: that.conf.ok ? true : false,
            btnCancel: that.conf.cancel ? true : false,
            cancelValue: that.conf.cancelValue
        }));

        var cssObj = {
            border: '1px solid #333',
            borderRadius: '5px',
            textAlign: 'center',
            backgroundColor: '#fff',
            position: that.conf.fixed === true ? 'fixed' : 'absolute',
            display: 'none',
            width: that.conf.w,
            height: that.conf.h,
            zIndex: zIndex++
        };

        // width和高度有可能不是设置的，需要先插入再获取宽高
        // 获取宽高是为了居中布局
        that.$dialog.css(cssObj).appendTo(that.$body);
    }

    show(elem) {
        var that = this;

        that.isShow = true;

        if (that.isRemoved) {
            that.isRemoved = false;
            that._init();
        }

        var $win = $(window),
            winWidth = $win.width(),
            winHeight = $win.height(),
            scrollTop = $win.scrollTop(),
            scrollLeft = $win.scrollLeft();

        var width = that.$dialog.width(),
            height = that.$dialog.height();

        if (that.conf.animate == 'fade') {
            that.$dialog.css({
                left: (that.conf.fixed ? 0 : scrollLeft) + (winWidth - width) / 2,
                top: (that.conf.fixed ? 0 : scrollTop) + (winHeight - height) / 2
            }).fadeIn(400);
        } else {
            that.$dialog.css({
                width: 0,
                height: 0,
                left: (that.conf.fixed ? 0 : scrollLeft) + winWidth / 2,
                top: (that.conf.fixed ? 0 : scrollTop) + winHeight / 2,
                display: 'block'
            }).animate({
                width: width,
                height: height,
                left: (that.conf.fixed ? 0 : scrollLeft) + (winWidth - width) / 2,
                top: (that.conf.fixed ? 0 : scrollTop) + (winHeight - height) / 2
            });
        }
    }

    showModal() {
        var that = this;

        if (!that.$modal) {
            that.$modal = $('<div>', {
                    class: 'dialog-modal'
                }).css({
                    position: 'fixed', // zIndex默认为auto
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    display: 'none', // isHidden的元素，才能设置fadeIn和fadeTo
                    zIndex: 10,
                    backgroundColor: '#000',
                    opacity: 0.6
                }).appendTo(that.$body)
                .fadeIn();
            // .fadeTo('fast', 0.6);
        } else {
            that.$modal.fadeIn();
        }

        that.show();
    }

    close() {
        var that = this;

        if (that.isRemoved) return;

        that.isShow = false;
        that.$modal && that.$modal.fadeOut();

        var $win = $(window),
            winWidth = $win.width(),
            winHeight = $win.height(),
            scrollTop = $win.scrollTop(),
            scrollLeft = $win.scrollLeft();
        if (that.conf.animate === 'fade') {
            that.$dialog.fadeOut();
        } else {
            that.$dialog.animate({
                width: 0,
                height: 0,
                left: (that.conf.fixed ? 0 : scrollLeft) + winWidth / 2,
                top: (that.conf.fixed ? 0 : scrollTop) + winHeight / 2,
            });
        }
    }

    toggle() {
        var that = this;

        that.isShow ? that.close() : that.show();
    }

    remove() {
        var that = this;
        if (that.isRemoved) return;
        that.$dialog.remove();
        that.$dialog = null;

        that.$modal.remove();
        that.$modal = null;
        that.isRemoved = true;
    }

    title(value) {
        var that = this;

        that.$dialog.find('.dialog-title').html(value);
    }

    content(value) {
        var that = this;

        that.$dialog.find('.dialog-body').html(value);
    }

    _bindEvent() {
        var that = this;
        
        that.$body.on('click', '.dialog-close', function(e) {
            that.close();
        });

        if (that.conf.quickClose === true) {
            that.$body.on('click', '.dialog-modal', function(e) {
                that.close();
            });
        }

        that.$dialog.on('click', '.dialog-btn-ok', function(e) {
            if (typeof that.conf.ok == 'function') {
                if (that.conf.ok.call(that) === false) {
                    return;
                }
                that.close();
            }
        });

        that.$dialog.on('click', '.dialog-btn-cancel', function(e) {
            if (typeof that.conf.cancel == 'function') {
                if (that.conf.cancel.call(that) === false) {
                    return;
                }
                that.close();
            }
        });

        if (that.conf.dragable) {
            that.$dialog.find('.dialog-title').mousedown(function (e) {
                var $this = $(this);

                var init_mouse_x = e.clientX;
                var init_mouse_y = e.clientY;
                var elem_x = that.$dialog.position().left;
                var elem_y = that.$dialog.position().top;

                $(document).mousemove(function (e) {
                    disableSelect();
                    var mouse_x = e.clientX;
                    var mouse_y = e.clientY;

                    that.$dialog.css({
                        left: mouse_x - init_mouse_x + elem_x,
                        top: mouse_y - init_mouse_y + elem_y
                    })
                });
            }).mouseup(function (e) {
                $(document).off('mousemove');
            })
        }

    }
}

function disableSelect() {
    // ie: document.selection.empty();
    // other: window.getSelection.removeAllRanges();
    window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
}

function dialog(conf) {
    conf = $.extend({}, default_conf, conf);
    return new Popup(conf);
}

module.exports = dialog
