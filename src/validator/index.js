/*! Validator.js
 * @author: sofish https://github.com/sofish
 * @copyright: MIT license 
 * 
 * bugger fix:
 * 1. patterns: number  text - min
 * 2. unvalidFields添加删除修改
 * 3. $elem.attr('pattern') 转化错误， str.replace() 不会修改str的值
 * 
 * 支持扩展pattern验证规则
 * 支持自定义提交ajax与服务端交互方式
 * 增加一致性检查功能
 * 
 */
var $ = require('jquery')

require('./style/index.css')

// 验证规则
var patterns = {

    // 当前校验的元素，默认没有，在 `validate()` 方法中传入
    // $item: {},

    email: function(text) {
        return /^(?:[a-z0-9]+[_\-+.]+)*[a-z0-9]+@(?:([a-z0-9]+-?)*[a-z0-9]+.)+([a-z]{2,})+$/i.test(text)
    },

    // 仅支持 8 种类型的 day
    // 20120409 | 2012-04-09 | 2012/04/09 | 2012.04.09 | 以上各种无 0 的状况
    date: function(text) {
        var reg = /^([1-2]\d{3})([-/.])?(1[0-2]|0?[1-9])([-/.])?([1-2]\d|3[01]|0?[1-9])$/,
            taste, d, year, month, day

        if (!reg.test(text)) {
            return false
        }

        taste = reg.exec(text)
        year = +taste[1]
        month = +taste[3] - 1
        day = +taste[5]
        d = new Date(year, month, day)

        return year === d.getFullYear() && month === d.getMonth() && day === d.getDate()
    },

    // 手机：仅中国手机适应；以 1 开头，第二位是 3-9，并且总位数为 11 位数字
    mobile: function(text) {
        return /^1[3-9]\d{9}$/.test(text)
    },

    // 座机：仅中国座机支持；区号可有 3、4位数并且以 0 开头；电话号不以 0 开头，最 8 位数，最少 7 位数
    //  但 400/800 除头开外，适应电话，电话本身是 7 位数
    // 0755-29819991 | 0755 29819991 | 400-6927972 | 4006927927 | 800...
    tel: function(text) {
        return /^(?:(?:0\d{2,3}[- ]?[1-9]\d{6,7})|(?:[48]00[- ]?[1-9]\d{6}))$/.test(text)
    },

    number: function(input) {
        var min = $.trim(this.attr('min')),
            max = $.trim(this.attr('max')),
            result = /^\-?(?:[1-9]\d*|0)(?:[.]\d+)?$/.test(input),
            text = +input,
            step = $.trim(this.attr('step'))

        // ignore invalid range silently
        min = min === '' || isNaN(min) ? text - 1 : +min
        max = max === '' || isNaN(max) ? text + 1 : +max

        step = step === '' || isNaN(step) ? 0 : +step

        // 目前的实现 step 不能小于 0
        return result && (0 >= step ?
            (text >= min && text <= max) : 0 === (text - min) % step && (text >= min && text <= max))
    },

    // 判断是否在 min / max 之间
    range: function(text) {
        return patterns.number(text)
    },

    // 支持类型:
    // http(s)://(username:password@)(www.)domain.(com/co.uk)(/...)
    // (s)ftp://(username:password@)domain.com/...
    // git://(username:password@)domain.com/...
    // irc(6/s)://host:port/... // 需要测试
    // afp over TCP/IP: afp://[<user>@]<host>[:<port>][/[<path>]]
    // telnet://<user>:<password>@<host>[:<port>/]
    // smb://[<user>@]<host>[:<port>][/[<path>]][?<param1>=<value1>[;<param2>=<value2>]]
    url: (function() {
        var protocols = '((https?|s?ftp|irc[6s]?|git|afp|telnet|smb):\\/\\/)?',
            userInfo = '([a-z0-9]\\w*(\\:[\\S]+)?\\@)?',
            domain = '(?:localhost|(?:[a-z0-9]+(?:[-\\w]*[a-z0-9])?(?:\\.[a-z0-9][-\\w]*[a-z0-9])*)*\\.[a-z]{2,})',
            port = '(:\\d{1,5})?',
            ip = '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}',
            address = '(\\/\\S*)?',
            domainType = [protocols, userInfo, domain, port, address],
            ipType = [protocols, userInfo, ip, port, address],
            rDomain = new RegExp('^' + domainType.join('') + '$', 'i'),
            rIP = new RegExp('^' + ipType.join('') + '$', 'i')

        return function(text) {
            return rDomain.test(text) || rIP.test(text)
        }
    })(),

    // 密码项目前只是不为空就 ok，可以自定义
    password: function(text) {
        return patterns.text.call(this, text)
    },

    checkbox: function() {
        return patterns._checker.call(this, 'checkbox')
    },

    // radio 根据当前 radio 的 name 属性获取元素，只要 name 相同的这几个元素中有一个 checked，则验证难过
    radio: function() {
        return patterns._checker.call(this, 'radio')
    },

    _checker: function(type) {
        // TODO: a better way?!
        var form = this.closest('form').eq(0),
            identifie = 'input[type=' + type + '][name="' + this.attr('name') + '"]',
            result = false,
            $items = $(identifie, form)

        // TODO: a faster way?!
        $items.each(function(i, item) {
            if (item.checked && !result) {
                result = true
                return false
            }
        })

        return result
    },

    // text[notEmpty] 表单项不为空
    // [type=text] 也会进这项
    text: function(text) {

        if (!(text = $.trim(text)).length) return;

        var max = parseInt(this.attr('maxlength'), 10),
            min = parseInt(this.attr('minlength'), 10),
            range

        range = function() {
            var ret = true,
                length = text.length

            if (min) ret = length >= min
            if (max) ret = ret && (length <= max)

            return ret
        }
        console.log(range())
        return range()
    }
}

var default_options = {
    identifie: '[required]',
    isErrorOnParent: false,
    method: 'blur',
    klass: 'error',
    before: function() {

    },
    after: function() {

    },
    errorCallback: function() {

    },
    afterSubmit: function() {

    },
    // preventDefault: false,
    // submit: null,
    // trigger: 'selector'
}

class Validator {
    constructor(form, options) {
        this.$form = $(form)
        this.init(form, options)
    }

    init(form, options) {
        this.conf = $.extend({}, default_options, options)

        if (typeof this.conf.submit === 'function') {
            this.conf.preventDefault = true
        }

        // 阻止默认的表单验证
        this.$form.attr('novalidate', 'true')

        this.$fields = $(this.conf.identifie, this.$form)

        this.unvalidFields = []

        this.$submitEvent = $({})

        this.validateForm()

        this.bindEvent()
    }

    bindEvent() {
        var that = this,
            typeReg = /^checkbox|radio$/

        // 给每个elem绑定事件
        if (this.conf.method) {
            // var isNeedChange = typeReg.test(field.type) || field.tagName === 'SELECT'
            that.$form.on(that.conf.method, 'input[required]:not(select, [type=checkbox],[type=radio])', function(e) {
                that.validate($(this))
            })

            that.$form.on('change', 'select[required], [type=checkbox][required], [type=radio][required]', function(e) {
                that.validate($(this))
            })
        }

        // 获取焦点时，清楚错误
        this.$form.on('focus', this.conf.identifie, function(e) {
            that.removeError($(this))
        })

        // 自定义事件
        this.$submitEvent.on('submit', function(e) {
            that.conf.before.call(that, that.$fields)

            that.validateForm()

            if (!that.unvalidFields.length) {
                if (that.conf.after() !== false) {
                    if (that.conf.preventDefault) {
                        that.conf.submit.call(that, that.$form)
                    } else {
                        that.$form.trigger('submit')
                    }
                    that.conf.afterSubmit()
                }
            } else {
                that.conf.errorCallback(this.unvalidFields)
            }
        })

        if (!that.conf.preventDefault) {
            this.$form.submit(function(e) {
                that.$submitEvent.trigger('submit')
            })
        } else {
            $(this.conf.trigger).on('click', function(e) {
                e.preventDefault()
                that.$submitEvent.trigger('submit')
            })
        }
    }

    asyncValidate($item) {
        var that = this,
            url = $item.data('url'),
            param = $item.data('param'),
            val = $item.val(),
            type = $item.data('type')

        var ret = this.commonValidate($item)
        if (ret) {
            return ret
        }

        $.ajax({
            url: url,
            type: type || 'post',

        })
    }

    alternativeValidate($item) {
        var that = this;
        var $total = this.selectElement('[data-userdefined=' + $item.data('userdefined') + ']'),
            other = $.grep($total, function(item, i) {
                return item !== $item[0]
            })

        var ret = this.commonValidate($item)
        if (ret) {
            return ret
        }

        $.each(other, function(i, item) {
            that.removeError($(item))
        })

        return false
    }

    equalValidate($item) {
        var $total = this.selectElement('[data-userdefined=' + $item.data('userdefined') + ']')
        var event = $item.data('event')

        // 验证自身的规则
        var ret = this.commonValidate($item, false)
        if (ret) {
            return ret
        }

        var isValid = true
        $total.each(function(i, item) {
            if ($(item).val() !== $item.val()) {
                return isValid = false
            }
        })

        ret = !isValid ? this.addError($item, 'unvalid') : false
        event && $item.trigger('after:' + event, $item)
        return ret
    }

    commonValidate($item, isTriggerEvent) {
        var pattern = $item.attr('pattern'),
            type = $item.attr('type') || 'text',
            innerPatternType = patterns[type] ? type : 'text',
            val = $item.val(),
            event = $item.data('event'),
            isValid, ret;

        isValid = pattern ? new RegExp(pattern).test(val) : patterns[innerPatternType].call($item, val)
        ret = !isValid ? this.addError($item, 'unvalid') : false

        if (isTriggerEvent !== false) {
            event && $item.trigger('after:' + event, $item)
        } else {
            event && ret && $item.trigger('after:' + event, $item)
        }

        return ret
    }

    validate($item) {
        var userdefinedType = $item.data('userdefined'),
            type = $item.attr('type') || 'text',
            val = $item.val().trim(),
            event = $item.data('event')

        // 
        event && $item.trigger('before:' + event, $item)

        if (!(type === 'checkbox' || type === 'radio') && !patterns.text.call($item, val)) {
            return this.addError($item, val.length ? 'unvalid' : 'empty')
        }

        if (userdefinedType === 'alternative') {
            return this.alternativeValidate($item)
        }

        if (userdefinedType === 'async') {
            return this.asyncValidate($item)
        }

        if (userdefinedType === 'equal') {
            return this.equalValidate($item)
        }

        return this.commonValidate($item)
    }

    validateForm() {
        var that = this
        this.$fields.each(function(i, field) {
            that.validate($(field))
        })

        return this.unvalidFields.length ? this.unvalidFields.concat() : false
    }

    removeError($item) {
        this.removeFromUnvalidFields($item)
        this.removeErrorClass($item)
    }

    addError($item, type) {
        this.addErrorClass($item, type)
        return this.addInUnvalidFileds($item)
    }

    removeErrorClass($item) {
        this.errorElement($item).removeClass(this.conf.klass + ' empty unvalid')
    }

    addErrorClass($item, type) {
        type = type || ''
        this.errorElement($item).addClass(this.conf.klass + ' ' + type)
    }

    addInUnvalidFileds($item, type, message) {
        var ret = null,
            index = this.inUnvalidFields($item)

        if (index > -1) {
            ret = this.unvalidFields[index]
        } else {
            ret = {
                $el: $item,
                type: type,
                message: message
            }
            this.unvalidFields.push(ret)
        }

        return ret
    }

    removeFromUnvalidFields($item) {
        var index = this.inUnvalidFields($item)
        index > -1 && this.unvalidFields.splice(index, 1)
    }

    inUnvalidFields($item) {
        var that = this,
            index = -1;
        $.each(this.unvalidFields, function(i, field) {
            if (field.$el[0] === $item[0]) {
                index = i
                return false
            }
        })
        return index
    }

    selectElement(selector) {
        var that = this
        return $(selector, this.$form).filter(that.conf.identifie)
    }

    errorElement($item) {
        return $item.data('parent') ? $item.closest($item.data('parent')) : this.conf.isErrorOnParent ? $item.parent() : $item
    }
}

module.exports = Validator


$.fn.validator = function(options) {
    return this.each(function(index, form) {
        var $form = $(form)

        var instance = $form.data('validator')
        if (!(instance instanceof Validator)) {
            $form.data('validator', instance = new Validator(form, options))
        }
    })
}