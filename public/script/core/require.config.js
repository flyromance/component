/** 
 * @api {get} //hostname[:port]/require.btime.js Config
 * @apiGroup Basics
 *
 * @apiDescription requirejs配置文件，同时也是全局基础配置文件，通过参数判断设置不同的
 *	baseUrl,实现测试环境和线上环境的切换，同时默认依赖common.js公共库文件
 *
 * 关于baseUrl的获取，程序会从页面中require.btime.js地址中获取baseUrl地址，之后判断
 * 地址中是否传入版本信息进行拼接
 * 另外会获取页面中_feb参数，如果_feb参数不为空，强制baseUrl为测试地址localhost:8002
 */
(function () {

    /**
     *	@desp 循环
     */
    var each = function (obj, iterator, context) {
        if (obj == null) return;
        if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
                iterator.call(context, i, obj[i], obj);
            }
        } else {
            for (var key in obj) {
                if (_.has(obj, key)) {
                    iterator.call(context, key, obj[key], obj);
                }
            }
        }
    };


    /**
     *	@desp 继承
     */
    var extend = function (obj) {
        each(Array.prototype.slice.call(arguments, 1), function (index, source) {
            if (source) {
                for (var prop in source) {
                    obj[prop] = source[prop];
                }
            }
        });
        return obj;
    };


    /**
     *	@desp 命名空间
     */
    var namespace = function (obj, namespace, def_val) {

        if (typeof (obj) === "string") {
            def_val = namespace;
            namespace = obj;
            obj = window;
        }
        var nps = namespace.split(".");
        each(nps, function (i) {
            obj[nps[i]] = obj[nps[i]] ||
                ((i === (nps.length - 1)) ? (def_val || {}) : {});
            obj = obj[nps[i]];
        });

        return obj;
    };


    /**
     *	@desp 从页面获取当前脚本的地址参数信息
     */
    var getCurrentScript = function () {
        var scripts = document.getElementsByTagName("script"),
            script = scripts[scripts.length - 1],
            src = script.src,
            reg = /(?:\?|&)(.*?)=(.*?)(?=&|$)/g,
            res = {},
            temp;
        while ((temp = reg.exec(src)) != null) res[temp[1]] = decodeURIComponent(temp[2]);
        return { "src": src, "params": res };
    };



    /**
     *	@desp 获取location的URL参数
     */
    var getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    };

    /**
     * 配置config
     */
    try {
        var CONFIG_PAGE = namespace("App.config.requirejs");
        var CONFIG_TEST = { baseUrl: "http://localhost:8002/dist/" };
        var query = getCurrentScript();
        var mode = getUrlParam("_feb");
        var regs = query.src.match(/^(http:\/\/[^\/]*\/)([^\/]*)\/\S*$/);
        var version = query.params.version || regs[2] || DEFAULT_VERSION;

        var config_current = mode ? 
            CONFIG_TEST : 
            extend({ baseUrl: regs[1] + version + '/' }, CONFIG_PAGE);


        /**
         *	@desp 设置requirejs的config
         */
        requirejs.config(config_current);


        /**
         *	@desp 默认依赖common.js公共包，由webpack生成
         */
        var myrequire = require;
        require = function () {
            var args = arguments;
            myrequire(["common"], function (common) {
                // common.init({ "publicPath": config_current.baseUrl });
                // common.each = each;
                // common.extend = extend;
                // common.namespace = namespace;
                myrequire.apply(window, args);
                require = myrequire;
            });
        };

    } catch (ex) {
        console.log("error_require_config: " + ex);
    }

}());
