/*
不是浮动元素, getStyle返回 float为none 
position为static的元素的left值为auto 
position为relative/absolute的元素left值为0px, top值为0px
position为fixed的元素，left为0px，top为之前元素的高度值
elem.offsetWidth padding * 2 + border * 2 + width
elem.offsetLeft border开始计算
elem.style.left margin开始计算
*/

// 禁止选中文本
function disableSelect() {
    // ie: document.selection.empty();
    // other: window.getSelection.removeAllRanges();
    window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
}

// 获取样式
function getStyle(elem, prop) {
    if (document.defaultView && document.defaultView.getComputedStyle) {
        return document.defaultView.getComputedStyle(elem, false)[prop];
    } else {
        return elem.currentStyle[prop];
    }
}

// 获取浏览器支持的css属性名
var getCssName = (function () {
    var cache = {};

    return function (name) {
        if (name in cache) return cache[name];

        var style = document.createElement('div').style;
        var prefixs = ['webkit', 'ms', 'O', 'Moz'];
        if (name in style) {
            return cache[name] = name;
        }

        var _name;
        for (var i = 0, lens = prefixs.length; i < lens; i++) {
            _name = prefixs[i] + name.charAt(0).toUpperCase() + name.slice(1);
            if (_name in style) {
                return cache[name] = _name;
            }
        }

        return cache[name] = null;
    }
})();

var transformName = getCssName('transform');


// 函数节流: 在min内无法执行，max内必须执行一次
function threshold(fn, min, max) {
    var startTime = 0;
    var timer = null;
    return function () {
        var args = arguments;
        var nowTime = +new Date();
        if (!startTime) {
            startTime = nowTime;
        }

        if (startTime - nowTime >= max) {
            fn.apply();
            startTime = 0;
            return;
        }

        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(null, args);
        }, min);
    }
};

var eventUtil = {
    getEvent: function (e) {
        return e ? e : window.event;
    },
    getTarget: function (e) {
        return e.target ? e.target : window.srcElement;
    },
    addEvent: function (elem, type, handler, isCapture) {
        if (!elem || !elem.nodeType) return;
        if (elem.addEventListener) {
            elem.addEventListener(type, handler, isCapture === true ? true : false);
        } else if (elem.attachEvent) {
            elem.attachEvent('on' + type, handler);
        } else {
            elem['on' + type] = handler;
        }
    },
    removeEvent: function (elem, type, handler, isCapture) {
        if (!elem || !elem.nodeType) return;
        if (elem.removeEventListener) {
            elem.removeEventListener(type, handler, isCapture === true ? true : false);
        } else if (elem.detachEvent) {
            elem.detachEvent('on' + type, handler);
        } else {
            elem['on' + type] = null;
        }
    }
}

/**
 * 
 */
var drag = (function () {
    var dragging = null;
    var diffX = 0,
        diffY = 0;

    function handleEvent(event) {
        event = eventUtil.getEvent(event);
        var target = eventUtil.getTarget(event);

        switch (event.type) {
            case 'mousedown':
                if (target.className.indexOf('draggable') > -1) {
                    dragging = target;
                    diffX = event.clientX - parseFloat(getStyle(target, 'left'));
                    diffY = event.clientY - parseFloat(getStyle(target, 'top'));
                }
                break;
            case 'mousemove':
                if (dragging) {
                    dragging.style.left = (event.clientX - diffX) + 'px';
                    dragging.style.top = (event.clientY - diffY) + 'px';
                }
                disableSelect();
                break;
            case 'mouseup':
                dragging = null;
                break;
        }
    }

    return {
        enable: function () {
            eventUtil.addEvent(document, 'mousedown', handleEvent);
            eventUtil.addEvent(document, 'mousemove', handleEvent);
            eventUtil.addEvent(document, 'mouseup', handleEvent);
        },
        disable: function () {
            eventUtil.removeEvent(document, 'mousedown', handleEvent);
            eventUtil.removeEvent(document, 'mousemove', handleEvent);
            eventUtil.removeEvent(document, 'mouseup', handleEvent);
        }
    };
})();


/**
 * Drag
 */
function Drag(elem, conf) {
    if (!(this instanceof Drag)) {
        return new Drag(elem, conf);
    }
    this.elem = typeof elem == 'string' ? document.getElementById(elem) : elem;
    this.init(conf || {});
}

Drag.prototype = {
    constructor: Drag,
    init: function (conf) {
        var that = this;
        this.pos = {
            elem: {
                x: 0,
                y: 0
            },
            mouse: {
                x: 0,
                y: 0
            },
            diff: {
                x: 0,
                y: 0
            },

        };
        that.setDrag();
    },
    setDrag: function () {
        var that = this;

        // 绑定mousedown事件
        eventUtil.addEvent(this.elem, 'mousedown', start);

        function start(e) {

            // 获取鼠标的位置
            that.pos.mouse.x = e.pageX;
            that.pos.mouse.y = e.pageY;

            // elem初始位置
            var pos = that.getPos();
            that.pos.elem.x = pos.x;
            that.pos.elem.y = pos.y;

            // 绑定事件
            eventUtil.addEvent(document, 'mousemove', move);
            eventUtil.addEvent(document, 'mouseup', up);
        }

        function move(e) {
            disableSelect(); // 禁止选中文本

            var offsetX = e.pageX - that.pos.mouse.x,
                offsetY = e.pageY - that.pos.mouse.y;

            that.setPos({
                x: that.pos.elem.x + offsetX,
                y: that.pos.elem.y + offsetY
            });
        }

        function up() {
            console.log(123);
            // 解绑
            eventUtil.removeEvent(document, 'mousemove', move);
            eventUtil.removeEvent(document, 'mouseup', up);

            // 其他的task
        }
    },
    getPos: function () {
        var that = this;
        var prop = '',
            left, top;

        // 获取elem的初始位置
        if (transformName) {
            prop = getStyle(that.elem, transformName);
            if (prop === 'none') {
                left = 0;
                top = 0;
            } else {

                // getComputedStyle(elem)[transform] 获取到的是 'matrix(1, 0, 0, 1, xxx, xxx)' 啃爹啊
                var match = prop.match(/\d+/g);
                left = +match[4];
                top = +match[5];
            }
        } else {
            if (getStyle(that.elem, 'position') == 'static') {
                that.elem.style.position = 'relative';
            }
            left = getStyle(that.elem, 'left');
            top = getStyle(that.elem, 'top');
            left = left ? parseInt(left) : 0;
            top = top ? parseInt(top) : 0;
        }

        return {
            x: left,
            y: top
        }
    },
    setPos: function (opt) {
        var that = this;

        if (transformName) {
            that.elem.style[transformName] = 'translate(' + opt.x + 'px, ' + opt.y + 'px)'
        } else {
            that.elem.style['left'] = opt.x + 'px';
            that.elem.style['top'] = opt.y + 'px';
        }
    },
}

exports = module.exports = Drag;
exports.drag = drag;

// export default Drag
// export { drag }