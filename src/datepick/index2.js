function Datepicker(options) {
    this.init(options);
};

Datepicker.prototype = {
    constructor: Datepicker,
    init: function (options) {
        var that = this;

        that.events = {};

        that.options = $.extend(true, {}, Datepicker.defaultOptions || {}, options || {});

        var date = new Date();

        that.cur = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            date: date.getDate()
        };

        that.prev = {
            year: date.getFullYear(),
            month: date.getMonth(),
            $title: $(that.options.prevTitle),
            $body: $(that.options.prevBody),
            $handler: $(that.options.prevHandler)
        };

        that.next = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            $title: $(that.options.nextTitle),
            $body: $(that.options.nextBody),
            $handler: $(that.options.nextHandler)
        };

        that.$wrap = $(that.options.wrap);
        that.$input = $(that.options.input);
        that.$box = $(that.options.box);
        that.cache = {};

        that.switchPanel();
        that.bindEvent();
    },
    switchPanel: function () {
        var that = this;

        if (that.next.month >= that.cur.month && that.next.year >= that.cur.year) {
            that.next.$handler.hide();
        } else {
            that.next.$handler.show();
        }

        that.render('prev');
        that.render('next');
    },
    changeDate: function (type) {
        var that = this;

        if (type == 'prev') {
            that.prev.month--;
            that.next.month--;
            if (that.prev.month == 0) {
                that.prev.month = 12;
                that.prev.year--;
            }
            if (that.next.month == 0) {
                that.next.month = 12;
                that.next.year--;
            }
        } else if ('next') {
            that.prev.month++;
            that.next.month++;
            if (that.next.month >= 13) {
                that.next.month = 1;
                that.next.year++;
            }
            if (that.prev.month >= 13) {
                that.prev.month = 1;
                that.prev.year++;
            }
        }
    },
    render: function (type) {
        var that = this;
        type = type || 'prev';
        var year = that[type].year,
            month = that[type].month,
            $title = that[type].$title,
            $body = that[type].$body,
            data, html;

        data = that.cache[year + '' + month] ? that.cache[year + '' + month] : that.getData(year, month, true);
        html = that.getHtml(data);

        $title.html(year + '年' + month + '月');
        $body.html(html);
    },
    bindEvent: function () {
        var that = this;

        that.$input.on('focus', function (e) {
            that.$input.addClass('datepicker-input-focus');
            that.$wrap.addClass('datepicker-open');
        }).blur(function (e) {
            that.$input.removeClass('datepicker-input-focus');
            !$(this).val() && that.trigger('empty');
        }).on('keyup', function (e) {
            !$(this).val() && that.trigger('empty');
        });

        $(document).on('click', function (e) {
            var $parent = $(e.target).parents(that.$wrap.selector);
            if (!$parent.length) {
                that.closePanel();
            }
        });

        that.prev.$handler.on('click', function (e) {
            that.changeDate('prev');
            that.switchPanel();
        });

        that.next.$handler.on('click', function (e) {
            that.changeDate('next');
            that.switchPanel();
        });

        that.prev.$body.on('click', 'td', function (e) {
            var $this = $(this);
            if ($this.hasClass('disabled')) return;
            var date = { year: that.prev.year, month: that.prev.month, date: +$this.html() };
            if (!that.startDate) {
                that.startDate = date;
            } else {
                that.endDate = date;
            }
            that.updateInput();
            if (that.startDate && that.endDate) {
                that.closePanel();
            }
        });

        that.next.$body.on('click', 'td', function (e) {
            var $this = $(this);
            if ($this.hasClass('disabled')) return;
            var date = { year: that.next.year, month: that.next.month, date: +$this.html() };
            if (!that.startDate) {
                that.startDate = date;
            } else {
                that.endDate = date;
            }
            that.updateInput();
            if (that.startDate && that.endDate) {
                that.closePanel();
            }
        });

        for (var key in that.options.custom_events) {
            that.on(key, that.options.custom_events[key]);
        }
    },
    closePanel: function () {
        var that = this;
        that.$wrap.removeClass('datepicker-open');
        that.startDate = null;
        that.endDate = null;
    },
    updateInput: function () {
        var that = this;
        var start = that.startDate;
        var end = that.endDate;
        var str = '',
            start_time = '',
            end_time = '',
            temp_time;
        if (start) {
            str = start.year + '-' + start.month + '-' + start.date;
        }
        if (end) {
            str += ' 至 ';
            str += end.year + '-' + end.month + '-' + end.date;
        }
        if (start && !end) {
            start_time = that.transformatDate(start.year, start.month, start.date);
            that.trigger('afterSelect', start_time);
        } else {
            start_time = that.transformatDate(start.year, start.month, start.date);
            end_time = that.transformatDate(end.year, end.month, end.date);
            if (start_time > end_time) {
                temp_time = start_time;
                start_time = end_time;
                end_time = temp_time;
            }
            that.trigger('afterSelect', start_time, end_time);
        }
        that.$input.val(str);
    },
    transformatDate: function (year, month, date) {
        var that = this;

        if (month < 10) {
            month = '0' + month;
        }

        if (date < 10) {
            date = '0' + date;
        }

        return year + '-' + month + '-' + date;
    },
    getHtml: function (data) {
        var that = this;
        var html = '';
        var isDisabled = false;
        for (var i = 0, lens = data.length; i < lens; i++) {
            if (i % 7 == 0) {
                html += '<tr>';
            }
            if (!data[i].date || (data[i].date > that.cur.date && data[i].month == that.cur.month)) {
                isDisabled = true;
            }
            html += '<td ' + (isDisabled ? 'class="disabled"' : '') + '>' + data[i].date + '</td>';
            isDisabled = false;
        }

        html += '</tr>';

        return html;
    },
    getData: function (year, month, onlyCurMonth) {
        var ret = [];

        var date = new Date();

        var firstDate = new Date(year, month - 1, 1); // 获取指定月份第一天日期对象
        var firstDate_day = firstDate.getDay(); // 获取第一天是星期几
        firstDate_day = firstDate_day === 0 ? 7 : firstDate_day; // 有可能是星期日(0)，要转为7

        var _lastDate = new Date(year, month - 1, 0); // 获取指定月份上个月的最后一天日期对象
        var _lastDate_date = _lastDate.getDate(); // 上个月最后一天是几号：31 30 28 27等

        var lastDate = new Date(year, month, 0); // 获取指定月份最后一天日期对象
        var lastDate_date = lastDate.getDate(); // 本月有多少天

        // 循环42次(6周)，从1开始
        for (var i = 1, lens = 6 * 7 + 1; i < lens; i++) {
            var _date,
                _month = month,
                _year = year;

            if (i <= firstDate_day) { // 上一个月: 注意上一年
                _date = onlyCurMonth ? '' : i - firstDate_day + _lastDate_date;
                _month = month - 1;
                if (_month == 0) {
                    _month = 12;
                    _year = year - 1;
                }
            } else if (firstDate_day < i && i <= firstDate_day + lastDate_date) { // 本月
                _date = i - firstDate_day;
                _month = month;
            } else { // 下一个月：注意下一年 
                _date = onlyCurMonth ? '' : i - firstDate_day - lastDate_date;
                _month = month + 1;
                if (_month > 12) {
                    _month = 1;
                    _year = year + 1;
                }
            }

            ret.push({
                year: _year,
                // thisYear: year,
                month: _month,
                thisMonth: month, // 面板上的月份
                date: _date,
                day: (i - 1) % 7 === 0 ? 7 : (i - 1) % 7
            });
        }

        ret.year = year;
        ret.month = month;

        return ret;
    },
    on: function (type, handler) {
        var that = this;
        that.events[type] = that.events[type] || [];
        that.events[type].push(handler);
        return that;
    },
    trigger: function (type) {
        var that = this;
        var list = that.events[type] || [];
        for (var i = 0; i < list.length; i++) {
            list[i].apply(that, [].slice.call(arguments, 1));
        }
        return that;
    }
};

Datepicker.defaultOptions = {

}

module.exports = Datepicker;
