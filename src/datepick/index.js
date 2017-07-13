require('./style/widget.css');

var wrapRender = require('./template/wrap.hbs');

var tableRender = require('./template/table.hbs');

var cache = {};

class Datepick {
    constructor(conf) {
        this.init(conf);
    }

    init(conf) {
        var that = this;

        var conf = that.conf = $.extend({}, conf);

        that.handleDate();
        
        that.$container = $(conf.container);
        that.render();

        that.$tbody = that.$container.find('.j-datepick-tbody');
        that.$title = that.$container.find('.j-datepick-title');
        that.switch(that.month, that.year);
        that.bindEvent();
    }

    handleDate(month) {
        var that = this;

        var oDate = new Date();
        var year = that.conf.year;
        var month = that.conf.month;
        var date = that.conf.date;
        var day;

        if (!month || typeof month !== 'number') {
            month = oDate.getMonth() + 1;
        } else {
            month = Math.max(1, month);
            month = Math.min(12, month);
        }

        if (!year || typeof year !== 'nubmer') {
            year = oDate.getFullYear();
        } 

        if (!date || typeof date !== 'number') {
            date = oDate.getDate();
        }

        var _date = new Date(year, month - 1, date);
        day = _date.getDay();

        that.year = year;
        that.month = month;
        that.day = day || 7;
        that.date = date;
    }

    render() {
        var that = this;

        if (!that.inited) {
            that.$container.html(wrapRender());
            that.inited = true;
        }
    }

    switch (month, year) {
        var that = this;

        if (!cache[year + '' + month]) {
            var data = that.getData(month, year);
            var html = tableRender({
                list: data // array
            });
            cache[year + '' + month] = html;
        }

        that.$tbody.html(cache[year + '' + month]);

        that.$title.html(year + '-' + month);
    }

    getData(month, year) {
        var ret = [];

        var date = new Date();

        var firstDate = new Date(year, month - 1, 1); // 获取指定月份第一天日期对象
        var firstDate_day = firstDate.getDay(); // 获取第一天是星期几
        firstDate_day = firstDate_day === 0 ? 7 : firstDate_day; // 有可能是星期日(0)，要转为7

        var _lastDate = new Date(year, month - 1, 0); // 获取指定月份上个月的最后一天日期对象
        var _lastDate_date = _lastDate.getDate(); // 上个月最后一天是几号：31 30 28 27等

        var lastDate = new Date(year, month, 0); // 获取指定月份最后一天日期对象
        var lastDate_date = lastDate.getDate(); // 本月有多少天

        var arr = [];

        // 循环42次(6周)，从1开始
        for (var i = 1, lens = 6 * 7 + 1; i < lens; i++) {
            var _date,
                _month = month,
                _year = year;
            var item = null;

            if (i <= firstDate_day) { // 上一个月: 注意上一年
                _date = i - firstDate_day + _lastDate_date;
                _month = month - 1;
                if (_month == 0) {
                    _month = 12;
                    _year = year - 1;
                }
            } else if (firstDate_day < i && i <= firstDate_day + lastDate_date) { // 本月
                _date = i - firstDate_day;
                _month = month;
            } else { // 下一个月：注意下一年 
                _date = i - firstDate_day - lastDate_date;
                _month = month + 1;
                if (_month > 12) {
                    _month = 1;
                    _year = year + 1;
                }
            }

            item ={
                year: _year,
                // thisYear: year,
                month: _month,
                thisMonth: month, // 面板上的月份
                date: _date,
                day: (i - 1) % 7 === 0 ? 7 : (i - 1) % 7
            };

            arr.push(item);
            if (i % 7 == 0) {
                ret.push(arr);
                arr = [];
            }
        }

        ret.year = year;
        ret.month = month;

        return ret;
    }

    bindEvent() {
        var that = this;

        that.$container.on('click', '.j-btn-prev', function (e) {
            var month = that.month - 1;
            if (month < 1) {
                that.month = 12;
                that.year--;
            } else {
                that.month--;
            }

            that.switch(that.month, that.year);
        });

        that.$container.on('click', '.j-btn-next', function (e) {
            var month = that.month + 1;
            if (month > 12) {
                month = 1;
                year++;
            } else {
                that.month++;
            }

            that.switch(that.month, that.year);
        });

        that.$container.on('click', 'tr td', function (e) {

        });
    }

    getDate() {
        var that = this;

        return {
            year: that.year,
            month: that.month,
            date: that.date,
            day: that.day
        }
    }
}

// init('.ui-datepick-body', 2017, 1);
module.exports = Datepick;
