var $ = require("./script/jquery-1.11.3.js");

require("./script/jquery-powerSwitch.js");

import './style/index.css';

var hbs = require('./template/list.hbs');

console.log(hbs({
    title: "My New Post",
    body: "This is my first post!"
}));

$(".tabNormal").powerSwitch({
    classAdd: "tab_on"
});

$(".tabJustHover").powerSwitch({
    classAdd: "tab_on",
    eventType: "hover",
    onSwitch: function (target) {
        var img = target.find("img").get(0);
        if (img && !img.src) {
            img.src = img.getAttribute("data-src");
        }
    }
});
$("#tabTransUl a").powerSwitch({
    classAdd: "tab_on",
    animation: "translate"
});
$("#tabAutoTrigger a").powerSwitch({
    classAdd: "tab_on",
    animation: "translate",
    eventType: "hover",
    hoverStop: false,
    autoTime: 3000,
    container: $("#tabAutoOperate")
});
$("#caroTriggerOut a").powerSwitch({
    container: $("#caroBox"),
    onSwitch: function (target) {
        target.each(function () {
            var img = $(this).find("img").get(0);
            if (img && !img.src) {
                img.src = img.getAttribute("data-src");
            }
        });
    }
});
$("#caroTriggerOut2 a").powerSwitch({
    container: $("#caroBox2"),
    number: 2,
    onSwitch: function (target) {
        target.each(function () {
            var img = $(this).find("img").get(0);
            if (img && !img.src) {
                img.src = img.getAttribute("data-src");
            }
        });
    }
});
$("#caroTriggerOut3 a").powerSwitch({
    container: $("#caroBox3"),
    animation: "none",
    direction: "vertical",
    onSwitch: function (target) {
        target.each(function () {
            var img = $(this).find("img").get(0);
            if (img && !img.src) {
                img.src = img.getAttribute("data-src");
            }
        });
    }
});
// 无限切换
$("#caroEndless a").powerSwitch({
    classDisabled: '',
    container: $("#caroBoxEnd"),
    number: 2
});


$(".handTitle").powerSwitch({
    animation: "slide"
});

$("#navvBar h4").powerSwitch({
    toggle: true,
    onSwitch: function (target, display) {
        // 三角变化
        $(this).find("span").html(display ? "▼" : "▶");
    }
});

var initHtmlMore = $("#moreToggle").powerSwitch({
    toggle: true,
    onSwitch: function (target, display) {
        // 提示文字变化
        if (display == false) {
            $(this).html(initHtmlMore);
        } else {
            $(this).html($(this).attr("data-toggle"));
        }
    }
}).html();

$("#wordSlide li").powerSwitch({
    autoTime: 3000,
    direction: "vertical",
    animation: "translate"
});

$("#moreCommentBtn").powerSwitch({
    number: 2
});

// 一次展开多个列表
$("#moreList").powerSwitch({
    toggle: true
});