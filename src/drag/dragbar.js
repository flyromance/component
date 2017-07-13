function DragBar(options) {
    if (!(this instanceof DragBar)) {
        return new DragBar(options);
    }
    this.init(options);
}

DragBar.prototype = {
    init: function (options) {
        var self = this;

        var conf = self.conf = options;
        this.btn = document.getElementById(conf.btn);
        this.show = document.getElementById(conf.show);
        this.bar = document.getElementById(conf.bar);
        this.barOver = document.getElementById(conf.barOver);

        this.len = self.bar.offsetWidth - self.btn.offsetWidth;

        self.bindEvent();
    },
    setPos: function (x) {
        var self = this;

        self.btn.style.left = x + 'px';
        self.barOver.style.width = x + 'px';
        self.show.innerHTML = (x / self.len) * (self.conf.max - self.conf.min) + self.conf.min;
    },
    bindEvent: function () {
        var self = this;

        self.btn.onmousedown = function (e) {
            
            var curLen = self.barOver.offsetWidth;
            var initX = e.clientX;

            document.onmousemove = function (e) {
                var curX = e.clientX;
                var x = curLen + curX - initX;
                x = Math.min(x, self.len)
                x = Math.max(0, x);
                self.setPos(x);
            };
        };

        document.onmouseup = function (e) {
            document.onmousemove = null;
        }
    }
}

module.exports = DragBar;
