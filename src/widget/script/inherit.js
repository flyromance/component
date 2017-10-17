/*

var SubClass = (function (_SuperClass) {
    inherit(SubClass, _SuperClass)

    function SubClass() {
        classCallCheck(this, SubClass)

        return _possibleConstructorReturn(this, (SubClass.__proto__ || Object.getPrototypeOf(SubClass)).call(this));
    }

    createClass(SubClass)
})(SuperClass);


*/

function toArray(arr) {
    return Array.isArray(arr) ? arr : Array.from(arr)
}

function classCallCheck(instance, Contructor) {
    if (!(instance instanceof Contructor)) {
        throw new TypeError("Cannot call a class as a function")
    }
}

function _possibleConstructorReturn(self, call) { 
    if (!self) { 
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); 
    } 
    return call && (typeof call === "object" || typeof call === "function") ? call : self; 
}

function _inherits(subClass, superClass) { 
    if (typeof superClass !== "function" && superClass !== null) { 
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); 
    }
    
    subClass.prototype = Object.create(superClass && superClass.prototype, { 
        constructor: { 
            value: subClass, 
            enumerable: false, 
            writable: true, 
            configurable: true 
        } 
    });

    if (superClass) {
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; 
    }
}

var createClass = (function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i]

            // 是否可枚举
            descriptor.enumerable = descriptor.enumerable || false

            // 是否可配置
            descriptor.configurable = true

            // writable
            if ('value' in descriptor) {
                descriptor.writable = true
            }

        }
    }

    return function(Contructor, protoProps, staticProps) {
        if (protoProps) {
            defineProperties(Contructor.prototype, protoProps)
        }

        if (staticProps) {
            defineProperties(Contructor, staticProps)
        }

        return Contructor
    }
})();