const default_conf = {
    title: 'this ia a title',
    content: 'this is a content'
}

class Factory {
    constructor(conf) {
        this.conf = $.extend({}, conf);
        this.init();
    }

    init() {
        var that = this;
    }

    show() {

    }

    hide() {

    }

    destroy() {

    }
}

