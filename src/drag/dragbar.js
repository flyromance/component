function dragBar(bar, barOver, btn, show) {
    this.btn = document.getElementById(btn);
    this.show = document.getElementById(show);
    this.bar = document.getElementById(bar);
    this.barOver = document.getElementById(barOver);
    this.init();
}
dragBar.prototype = {
    init: function() {
        var self = this;
        self.btn.onmousedown = function(e) {
            var len = self.bar.offsetWidth - self.btn.offsetWidth;
            var curLen = self.barOver.offsetWidth;
            var initX = e.clientX;
            document.onmousemove = function(e) {
                var curX = e.clientX;
                var x = curLen + curX - initX;
                x = Math.min(x, len)
                x = Math.max(0, x);
                self.btn.style.left = x + 'px';
                self.barOver.style.width = x + 'px';
                self.show.innerHTML = x / len * 10;
            };
        };
        document.onmouseup = function(e) {
            document.onmousemove = null;
        }
    }
}
