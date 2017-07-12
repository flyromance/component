function Factory(options) {
    if (!(this instanceof Factory)) return new Factory(options);
    this.init(options);
}

Factory.prototype = {
    constructor: Factory,
    init: function (options) {
        var that = this;

        var conf = that.conf = $.extend(true, {}, default_conf, options);

        that.page = conf.page || 1;
        that.pages = conf.pages || 20;
        that.group = conf.group || 5;
        that.group = Math.min(that.group, that.pages);

        that.$container = $(conf.container);

        that.events = {};

        that.render(that.page);
        that.bindEvent();
    },
    bindEvent: function () {
        var that = this;

        that.$container.on('click', that.conf.className.item, function (e) {
            var $this = $(this);

            var type = $this.data('type') || 'num';
            var page = +$this.data('page');
            switch (type) {
                case 'num':
                    that.goto(page);
                    break;
                case 'prev':
                    that.goto(that.page - 1);
                    break;
                case 'next':
                    that.goto(that.page + 1);
                    break;
                default:
                    break;
            }
        });

        var events = that.conf.customEvents || {};
        for (var key in events) {
            if (events.hasOwnProperty(key)) {
                that.on(key, events[key]);
            }
        }

    },
    on: function (type, handler) {
        var that = this;

        if (typeof type == 'string' && typeof handler === 'function') {
            var list = that.events[type] = that.events[type] || [];
            list.push(handler);
        }
    },
    trigger: function (type) {
        var that = this;

        var args = [].slice.call(arguments, 1);
        var list = that.events[type] || [];
        for (var i = 0; i < list.length; i++) {
            list[i].apply(that, args);
        }
    },
    goto: function (page) {
        var that = this;

        page = Math.min(page, that.pages);
        page = Math.max(page, 1);

        if (page != that.page) {
            that.render(page, that.pages);
            that.page = page;
            that.trigger('afterSwitch', page, that.pages);
        }
    },
    render: function (page, pages, group) {
        var that = this;

        page = page || that.page;
        pages = pages || that.pages;
        group = group || that.group;

        var offset_left = Math.floor(group / 2);
        var offset_right = group - offset_left - 1;

        var first = that.conf.first ? +that.conf.first : page;
        var last = that.conf.last ? +that.conf.last : pages;

        var data = {
            prev: {
                exist: that.conf.hasPrevNext === false ? false : true,
                disabled: page === 1 ? true : false
            },
            next: {
                exist: that.conf.hasPrevNext === false ? false : true,
                disabled: page === pages ? true : false
            },
            list: []
        };

        var list = data.list;

        var start = page - offset_left;
        var end = page + offset_right;
        var left_more = false;
        var right_more = false;

        if (start <= 0) {
            start = 1;
            end = group;
        }

        if (end > pages) {
            start = pages - group + 1;
            end = pages;
        }

        if (start >= 2) {
            left_more = true;
        }

        if (end <= pages - 1) {
            right_more = true;
        }

        left_more && list.push({
            active: page === 1 ? true : false,
            page: 1,
            text: 1
        }, {
            isMore: true,
            text: '...'
        });

        for (i = start; i <= end; i++) {
            list.push({
                text: i,
                page: i,
                active: page === i ? true : false
            });
        }

        right_more && list.push({
            isMore: true,
            text: '...'
        }, {
            active: page === pages ? true : false,
            text: pages,
            page: pages
        });

        that.$container.html(that.conf.render(data));
    },
}

var default_conf = {
    group: 5,
    pages: 20,
    page: 1
};

module.exports = Factory;