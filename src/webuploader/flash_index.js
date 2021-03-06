var $ = require('jquery');
var swfobject = require('./script/swfobject.js');

function SWFUpload(a) {
    this.initSWFUpload(a);
}

SWFUpload.prototype.initSWFUpload = function(b) {
    try {
        this.customSettings = {};
        this.settings = b;
        this.eventQueue = [];
        this.movieName = "SWFUpload_" + SWFUpload.movieCount++;
        this.movieElement = null;
        SWFUpload.instances[this.movieName] = this;
        this.initSettings();
        this.loadFlash();
        this.displayDebugInfo();
    } catch (a) {
        throw delete SWFUpload.instances[this.movieName], a;
    }
}

SWFUpload.instances = {};
SWFUpload.movieCount = 0;
SWFUpload.version = "2.2.0 2009-03-25";
SWFUpload.QUEUE_ERROR = {
    "QUEUE_LIMIT_EXCEEDED": -100,
    "FILE_EXCEEDS_SIZE_LIMIT": -110,
    "ZERO_BYTE_FILE": -120,
    "INVALID_FILETYPE": -130
};
SWFUpload.UPLOAD_ERROR = {
    "HTTP_ERROR": -200,
    "MISSING_UPLOAD_URL": -210,
    "IO_ERROR": -220,
    "SECURITY_ERROR": -230,
    "UPLOAD_LIMIT_EXCEEDED": -240,
    "UPLOAD_FAILED": -250,
    "SPECIFIED_FILE_ID_NOT_FOUND": -260,
    "FILE_VALIDATION_FAILED": -270,
    "FILE_CANCELLED": -280,
    "UPLOAD_STOPPED": -290
};
SWFUpload.FILE_STATUS = {
    "QUEUED": -1,
    "IN_PROGRESS": -2,
    "ERROR": -3,
    "COMPLETE": -4,
    "CANCELLED": -5
}, SWFUpload.BUTTON_ACTION = {
    "SELECT_FILE": -100,
    "SELECT_FILES": -110,
    "START_UPLOAD": -120
}, SWFUpload.CURSOR = {
    "ARROW": -1,
    "HAND": -2
}, SWFUpload.WINDOW_MODE = {
    "WINDOW": "window",
    "TRANSPARENT": "transparent",
    "OPAQUE": "opaque"
};
SWFUpload.completeURL = function(a) {
    if (typeof a != "string" || a.match(/^https?:\/\//i) || a.match(/^\//)) return a;
    var c = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : ""),
        b = window.location.pathname.lastIndexOf("/");
    return b <= 0 ? path = "/" : path = window.location.pathname.substr(0, b) + "/", path + a;
};

SWFUpload.prototype.initSettings = function() {
    this.ensureDefault = function(b, a) {
        this.settings[b] = this.settings[b] == undefined ? a : this.settings[b];
    };
    this.ensureDefault("upload_url", "");
    this.ensureDefault("preserve_relative_urls", !1);
    this.ensureDefault("file_post_name", "Filedata");
    this.ensureDefault("post_params", {});
    this.ensureDefault("use_query_string", !1);
    this.ensureDefault("requeue_on_error", !1);
    this.ensureDefault("http_success", []);
    this.ensureDefault("assume_success_timeout", 0);
    this.ensureDefault("file_types", "*.*");
    this.ensureDefault("file_types_description", "All Files");
    this.ensureDefault("file_size_limit", 0);
    this.ensureDefault("file_upload_limit", 0);
    this.ensureDefault("file_queue_limit", 0);
    this.ensureDefault("flash_url", "swfupload.swf");
    this.ensureDefault("prevent_swf_caching", !0);
    this.ensureDefault("button_image_url", "");
    this.ensureDefault("button_width", 1);
    this.ensureDefault("button_height", 1);
    this.ensureDefault("button_text", "");
    this.ensureDefault("button_text_style", "color: #000000; font-size: 16pt;");
    this.ensureDefault("button_text_top_padding", 0);
    this.ensureDefault("button_text_left_padding", 0);
    this.ensureDefault("button_action", SWFUpload.BUTTON_ACTION.SELECT_FILES);
    this.ensureDefault("button_disabled", !1);
    this.ensureDefault("button_placeholder_id", "");
    this.ensureDefault("button_placeholder", null);
    this.ensureDefault("button_cursor", SWFUpload.CURSOR.ARROW);
    this.ensureDefault("button_window_mode", SWFUpload.WINDOW_MODE.WINDOW);
    this.ensureDefault("debug", !1); 
    this.settings.debug_enabled = this.settings.debug;
    this.settings.return_upload_start_handler = this.returnUploadStart;
    this.ensureDefault("swfupload_loaded_handler", null);
    this.ensureDefault("file_dialog_start_handler", null);
    this.ensureDefault("file_queued_handler", null);
    this.ensureDefault("file_queue_error_handler", null);
    this.ensureDefault("file_dialog_complete_handler", null);
    this.ensureDefault("upload_start_handler", null);
    this.ensureDefault("upload_progress_handler", null);
    this.ensureDefault("upload_error_handler", null);
    this.ensureDefault("upload_success_handler", null);
    this.ensureDefault("upload_complete_handler", null);
    this.ensureDefault("debug_handler", this.debugMessage);
    this.ensureDefault("custom_settings", {});
    this.customSettings = this.settings.custom_settings;
    !this.settings.prevent_swf_caching || (this.settings.flash_url = this.settings.flash_url + (this.settings.flash_url.indexOf("?") < 0 ? "?" : "&") + "preventswfcaching=" + (new Date).getTime());
    this.settings.preserve_relative_urls || (this.settings.upload_url = SWFUpload.completeURL(this.settings.upload_url), this.settings.button_image_url = SWFUpload.completeURL(this.settings.button_image_url));
    delete this.ensureDefault;
};
SWFUpload.prototype.loadFlash = function() {
    var a, b;
    if (document.getElementById(this.movieName) !== null) {
        throw "ID " + this.movieName + " is already in use. The Flash Object could not be added";
    }
    a = document.getElementById(this.settings.button_placeholder_id) || this.settings.button_placeholder;
    if (a == undefined) {
        throw "Could not find the placeholder element: " + this.settings.button_placeholder_id;
    }
    b = document.createElement("div");
    b.innerHTML = this.getFlashHTML();
    a.parentNode.replaceChild(b.firstChild, a);
    window[this.movieName] == undefined && (window[this.movieName] = this.getMovieElement());
};
SWFUpload.prototype.getFlashHTML = function() {
    return ['<object id="', this.movieName, '" type="application/x-shockwave-flash" data="', this.settings.flash_url, '" width="', this.settings.button_width, '" height="', this.settings.button_height, '" class="swfupload">', '<param name="wmode" value="', this.settings.button_window_mode, '" />', '<param name="movie" value="', this.settings.flash_url, '" />', '<param name="quality" value="high" />', '<param name="menu" value="false" />', '<param name="allowScriptAccess" value="always" />', '<param name="flashvars" value="' + this.getFlashVars() + '" />', "</object>"].join("");
};
SWFUpload.prototype.getFlashVars = function() {
    var b = this.buildParamString(),
        a = this.settings.http_success.join(",");
    return ["movieName=", encodeURIComponent(this.movieName), "&amp;uploadURL=", encodeURIComponent(this.settings.upload_url), "&amp;useQueryString=", encodeURIComponent(this.settings.use_query_string), "&amp;requeueOnError=", encodeURIComponent(this.settings.requeue_on_error), "&amp;httpSuccess=", encodeURIComponent(a), "&amp;assumeSuccessTimeout=", encodeURIComponent(this.settings.assume_success_timeout), "&amp;params=", encodeURIComponent(b), "&amp;filePostName=", encodeURIComponent(this.settings.file_post_name), "&amp;fileTypes=", encodeURIComponent(this.settings.file_types), "&amp;fileTypesDescription=", encodeURIComponent(this.settings.file_types_description), "&amp;fileSizeLimit=", encodeURIComponent(this.settings.file_size_limit), "&amp;fileUploadLimit=", encodeURIComponent(this.settings.file_upload_limit), "&amp;fileQueueLimit=", encodeURIComponent(this.settings.file_queue_limit), "&amp;debugEnabled=", encodeURIComponent(this.settings.debug_enabled), "&amp;buttonImageURL=", encodeURIComponent(this.settings.button_image_url), "&amp;buttonWidth=", encodeURIComponent(this.settings.button_width), "&amp;buttonHeight=", encodeURIComponent(this.settings.button_height), "&amp;buttonText=", encodeURIComponent(this.settings.button_text), "&amp;buttonTextTopPadding=", encodeURIComponent(this.settings.button_text_top_padding), "&amp;buttonTextLeftPadding=", encodeURIComponent(this.settings.button_text_left_padding), "&amp;buttonTextStyle=", encodeURIComponent(this.settings.button_text_style), "&amp;buttonAction=", encodeURIComponent(this.settings.button_action), "&amp;buttonDisabled=", encodeURIComponent(this.settings.button_disabled), "&amp;buttonCursor=", encodeURIComponent(this.settings.button_cursor)].join("");
};
SWFUpload.prototype.getMovieElement = function() {
    this.movieElement == undefined && (this.movieElement = document.getElementById(this.movieName));
    if (this.movieElement === null) throw "Could not find Flash element";
    return this.movieElement;
};
SWFUpload.prototype.buildParamString = function() {
    var c = this.settings.post_params,
        b = [];
    if (typeof c == "object")
        for (var a in c) c.hasOwnProperty(a) && b.push(encodeURIComponent(a.toString()) + "=" + encodeURIComponent(c[a].toString()));
    return b.join("&amp;");
};
SWFUpload.prototype.destroy = function() {
    try {
        this.cancelUpload(null, !1);
        var a = null;
        a = this.getMovieElement();
        if (a && typeof a.CallFunction == "unknown") {
            for (var c in a) try {
                typeof a[c] == "function" && (a[c] = null);
            } catch (e) {}
            try {
                a.parentNode.removeChild(a);
            } catch (b) {}
        }
        return window[this.movieName] = null, SWFUpload.instances[this.movieName] = null, delete SWFUpload.instances[this.movieName], this.movieElement = null, this.settings = null, this.customSettings = null, this.eventQueue = null, this.movieName = null, !0;
    } catch (d) {
        return !1;
    }
};
SWFUpload.prototype.displayDebugInfo = function() {
    this.debug(["---SWFUpload Instance Info---\n", "Version: ", SWFUpload.version, "\n", "Movie Name: ", this.movieName, "\n", "Settings:\n", " ", "upload_url:               ", this.settings.upload_url, "\n", "  ", "flash_url:                ", this.settings.flash_url, "\n", "   ", "use_query_string:         ", this.settings.use_query_string.toString(), "\n", " ", "requeue_on_error:         ", this.settings.requeue_on_error.toString(), "\n", " ", "http_success:             ", this.settings.http_success.join(", "), "\n", " ", "assume_success_timeout:   ", this.settings.assume_success_timeout, "\n", "  ", "file_post_name:           ", this.settings.file_post_name, "\n", "  ", "post_params:              ", this.settings.post_params.toString(), "\n", "  ", "file_types:               ", this.settings.file_types, "\n", "  ", "file_types_description:   ", this.settings.file_types_description, "\n", "  ", "file_size_limit:          ", this.settings.file_size_limit, "\n", " ", "file_upload_limit:        ", this.settings.file_upload_limit, "\n", "   ", "file_queue_limit:         ", this.settings.file_queue_limit, "\n", "    ", "debug:                    ", this.settings.debug.toString(), "\n", "    ", "prevent_swf_caching:      ", this.settings.prevent_swf_caching.toString(), "\n", "  ", "button_placeholder_id:    ", this.settings.button_placeholder_id.toString(), "\n", "    ", "button_placeholder:       ", this.settings.button_placeholder ? "Set" : "Not Set", "\n", "  ", "button_image_url:         ", this.settings.button_image_url.toString(), "\n", " ", "button_width:             ", this.settings.button_width.toString(), "\n", " ", "button_height:            ", this.settings.button_height.toString(), "\n", "    ", "button_text:              ", this.settings.button_text.toString(), "\n", "  ", "button_text_style:        ", this.settings.button_text_style.toString(), "\n", "    ", "button_text_top_padding:  ", this.settings.button_text_top_padding.toString(), "\n", "  ", "button_text_left_padding: ", this.settings.button_text_left_padding.toString(), "\n", " ", "button_action:            ", this.settings.button_action.toString(), "\n", "    ", "button_disabled:          ", this.settings.button_disabled.toString(), "\n", "  ", "custom_settings:          ", this.settings.custom_settings.toString(), "\n", "Event Handlers:\n", " ", "swfupload_loaded_handler assigned:  ", (typeof this.settings.swfupload_loaded_handler == "function").toString(), "\n", "    ", "file_dialog_start_handler assigned: ", (typeof this.settings.file_dialog_start_handler == "function").toString(), "\n", "   ", "file_queued_handler assigned:       ", (typeof this.settings.file_queued_handler == "function").toString(), "\n", " ", "file_queue_error_handler assigned:  ", (typeof this.settings.file_queue_error_handler == "function").toString(), "\n", "    ", "upload_start_handler assigned:      ", (typeof this.settings.upload_start_handler == "function").toString(), "\n", "    ", "upload_progress_handler assigned:   ", (typeof this.settings.upload_progress_handler == "function").toString(), "\n", " ", "upload_error_handler assigned:      ", (typeof this.settings.upload_error_handler == "function").toString(), "\n", "    ", "upload_success_handler assigned:    ", (typeof this.settings.upload_success_handler == "function").toString(), "\n", "  ", "upload_complete_handler assigned:   ", (typeof this.settings.upload_complete_handler == "function").toString(), "\n", " ", "debug_handler assigned:             ", (typeof this.settings.debug_handler == "function").toString(), "\n"].join(""));
};
SWFUpload.prototype.addSetting = function(b, c, a) {
    return c == undefined ? this.settings[b] = a : this.settings[b] = c;
};
SWFUpload.prototype.getSetting = function(a) {
    return this.settings[a] != undefined ? this.settings[a] : "";
};
SWFUpload.prototype.callFlash = function(functionName, argumentArray) {
    argumentArray = argumentArray || [];
    var movieElement = this.getMovieElement(),
        returnValue, returnString;
    try {
        returnString = movieElement.CallFunction('<invoke name="' + functionName + '" returntype="javascript">' + __flash__argumentsToXML(argumentArray, 0) + "</invoke>"), returnValue = eval(returnString);
    } catch (ex) {
        throw "Call to " + functionName + " failed";
    }
    return returnValue != undefined && typeof returnValue.post == "object" && (returnValue = this.unescapeFilePostParams(returnValue)), returnValue;
};
SWFUpload.prototype.selectFile = function() {
    this.callFlash("SelectFile");
};
SWFUpload.prototype.selectFiles = function() {
    this.callFlash("SelectFiles");
};
SWFUpload.prototype.startUpload = function(a) {
    this.callFlash("StartUpload", [a]);
};
SWFUpload.prototype.cancelUpload = function(a, b) {
    b !== !1 && (b = !0), this.callFlash("CancelUpload", [a, b]);
};
SWFUpload.prototype.stopUpload = function() {
    this.callFlash("StopUpload");
};
SWFUpload.prototype.getStats = function() {
    return this.callFlash("GetStats");
};
SWFUpload.prototype.setStats = function(a) {
    this.callFlash("SetStats", [a]);
};
SWFUpload.prototype.getFile = function(a) {
    return typeof a == "number" ? this.callFlash("GetFileByIndex", [a]) : this.callFlash("GetFile", [a]);
};
SWFUpload.prototype.addFileParam = function(a, b, c) {
    return this.callFlash("AddFileParam", [a, b, c]);
};
SWFUpload.prototype.removeFileParam = function(a, b) {
    this.callFlash("RemoveFileParam", [a, b]);
};
SWFUpload.prototype.setUploadURL = function(a) {
    this.settings.upload_url = a.toString(), this.callFlash("SetUploadURL", [a]);
};
SWFUpload.prototype.setPostParams = function(a) {
    this.settings.post_params = a, this.callFlash("SetPostParams", [a]);
};
SWFUpload.prototype.addPostParam = function(a, b) {
    this.settings.post_params[a] = b, this.callFlash("SetPostParams", [this.settings.post_params]);
};
SWFUpload.prototype.removePostParam = function(a) {
    delete this.settings.post_params[a], this.callFlash("SetPostParams", [this.settings.post_params]);
};
SWFUpload.prototype.setFileTypes = function(a, b) {
    this.settings.file_types = a, this.settings.file_types_description = b, this.callFlash("SetFileTypes", [a, b]);
};
SWFUpload.prototype.setFileSizeLimit = function(a) {
    this.settings.file_size_limit = a, this.callFlash("SetFileSizeLimit", [a]);
};
SWFUpload.prototype.setFileUploadLimit = function(a) {
    this.settings.file_upload_limit = a, this.callFlash("SetFileUploadLimit", [a]);
};
SWFUpload.prototype.setFileQueueLimit = function(a) {
    this.settings.file_queue_limit = a, this.callFlash("SetFileQueueLimit", [a]);
};
SWFUpload.prototype.setFilePostName = function(a) {
    this.settings.file_post_name = a, this.callFlash("SetFilePostName", [a]);
};
SWFUpload.prototype.setUseQueryString = function(a) {
    this.settings.use_query_string = a, this.callFlash("SetUseQueryString", [a]);
};
SWFUpload.prototype.setRequeueOnError = function(a) {
    this.settings.requeue_on_error = a, this.callFlash("SetRequeueOnError", [a]);
};
SWFUpload.prototype.setHTTPSuccess = function(a) {
    typeof a == "string" && (a = a.replace(" ", "").split(",")), this.settings.http_success = a, this.callFlash("SetHTTPSuccess", [a]);
};
SWFUpload.prototype.setAssumeSuccessTimeout = function(a) {
    this.settings.assume_success_timeout = a, this.callFlash("SetAssumeSuccessTimeout", [a]);
};
SWFUpload.prototype.setDebugEnabled = function(a) {
    this.settings.debug_enabled = a, this.callFlash("SetDebugEnabled", [a]);
};
SWFUpload.prototype.setButtonImageURL = function(a) {
    a == undefined && (a = ""), this.settings.button_image_url = a, this.callFlash("SetButtonImageURL", [a]);
};
SWFUpload.prototype.setButtonDimensions = function(c, a) {
    this.settings.button_width = c, this.settings.button_height = a;
    var b = this.getMovieElement();
    b != undefined && (b.style.width = c + "px", b.style.height = a + "px"), this.callFlash("SetButtonDimensions", [c, a]);
};
SWFUpload.prototype.setButtonText = function(a) {
    this.settings.button_text = a, this.callFlash("SetButtonText", [a]);
};
SWFUpload.prototype.setButtonTextPadding = function(b, a) {
    this.settings.button_text_top_padding = a, this.settings.button_text_left_padding = b, this.callFlash("SetButtonTextPadding", [b, a]);
};
SWFUpload.prototype.setButtonTextStyle = function(a) {
    this.settings.button_text_style = a, this.callFlash("SetButtonTextStyle", [a]);
};
SWFUpload.prototype.setButtonDisabled = function(a) {
    this.settings.button_disabled = a, this.callFlash("SetButtonDisabled", [a]);
};
SWFUpload.prototype.setButtonAction = function(a) {
    this.settings.button_action = a, this.callFlash("SetButtonAction", [a]);
};
SWFUpload.prototype.setButtonCursor = function(a) {
    this.settings.button_cursor = a, this.callFlash("SetButtonCursor", [a]);
};
SWFUpload.prototype.queueEvent = function(b, c) {
    c == undefined ? c = [] : c instanceof Array || (c = [c]);
    var a = this;
    if (typeof this.settings[b] == "function") this.eventQueue.push(function() {
        this.settings[b].apply(this, c);
    }), setTimeout(function() {
        a.executeNextEvent();
    }, 0);
    else if (this.settings[b] !== null) throw "Event handler " + b + " is unknown or is not a function";
};
SWFUpload.prototype.executeNextEvent = function() {
    var a = this.eventQueue ? this.eventQueue.shift() : null;
    typeof a == "function" && a.apply(this);
};
SWFUpload.prototype.unescapeFilePostParams = function(c) {
    var e = /[$]([0-9a-f]{4})/i,
        f = {},
        d;
    if (c != undefined) {
        for (var a in c.post)
            if (c.post.hasOwnProperty(a)) {
                d = a;
                var b;
                while ((b = e.exec(d)) !== null) d = d.replace(b[0], String.fromCharCode(parseInt("0x" + b[1], 16)));
                f[d] = c.post[a];
            }
        c.post = f;
    }
    return c;
};
SWFUpload.prototype.testExternalInterface = function() {
    try {
        return this.callFlash("TestExternalInterface");
    } catch (a) {
        return !1;
    }
};
SWFUpload.prototype.flashReady = function() {
    var a = this.getMovieElement();
    if (!a) {
        this.debug("Flash called back ready but the flash movie can't be found.");
        return;
    }
    this.cleanUp(a), this.queueEvent("swfupload_loaded_handler");
};
SWFUpload.prototype.cleanUp = function(a) {
    try {
        if (this.movieElement && typeof a.CallFunction == "unknown") {
            this.debug("Removing Flash functions hooks (this should only run in IE and should prevent memory leaks)");
            for (var c in a) try {
                typeof a[c] == "function" && (a[c] = null);
            } catch (b) {}
        }
    } catch (d) {}
    window.__flash__removeCallback = function(e, f) {
        try {
            e && (e[f] = null);
        } catch (g) {}
    };
};
SWFUpload.prototype.fileDialogStart = function() {
    this.queueEvent("file_dialog_start_handler");
};
SWFUpload.prototype.fileQueued = function(a) {
    a = this.unescapeFilePostParams(a), this.queueEvent("file_queued_handler", a);
};
SWFUpload.prototype.fileQueueError = function(a, c, b) {
    a = this.unescapeFilePostParams(a), this.queueEvent("file_queue_error_handler", [a, c, b]);
};
SWFUpload.prototype.fileDialogComplete = function(b, c, a) {
    this.queueEvent("file_dialog_complete_handler", [b, c, a]);
};
SWFUpload.prototype.uploadStart = function(a) {
    a = this.unescapeFilePostParams(a), this.queueEvent("return_upload_start_handler", a);
};
SWFUpload.prototype.returnUploadStart = function(a) {
    var b;
    if (typeof this.settings.upload_start_handler == "function") a = this.unescapeFilePostParams(a), b = this.settings.upload_start_handler.call(this, a);
    else if (this.settings.upload_start_handler != undefined) throw "upload_start_handler must be a function";
    b === undefined && (b = !0), b = !!b, this.callFlash("ReturnUploadStart", [b]);
};
SWFUpload.prototype.uploadProgress = function(a, c, b) {
    a = this.unescapeFilePostParams(a), this.queueEvent("upload_progress_handler", [a, c, b]);
};
SWFUpload.prototype.uploadError = function(a, c, b) {
    a = this.unescapeFilePostParams(a), this.queueEvent("upload_error_handler", [a, c, b]);
};
SWFUpload.prototype.uploadSuccess = function(b, a, c) {
    b = this.unescapeFilePostParams(b), this.queueEvent("upload_success_handler", [b, a, c]);
};
SWFUpload.prototype.uploadComplete = function(a) {
    a = this.unescapeFilePostParams(a), this.queueEvent("upload_complete_handler", a);
};
SWFUpload.prototype.debug = function(a) {
    this.queueEvent("debug_handler", a);
};
SWFUpload.prototype.debugMessage = function(c) {
    if (this.settings.debug) {
        var a, d = [];
        if (typeof c == "object" && typeof c.name == "string" && typeof c.message == "string") {
            for (var b in c) c.hasOwnProperty(b) && d.push(b + ": " + c[b]);
            a = d.join("\n") || "", d = a.split("\n"), a = "EXCEPTION: " + d.join("\nEXCEPTION: "), SWFUpload.Console.writeLine(a);
        } else SWFUpload.Console.writeLine(c);
    }
};

SWFUpload.Console = {};

SWFUpload.Console.writeLine = function(d) {
    var b, a;
    try {
        b = document.getElementById("SWFUpload_Console"), b || (a = document.createElement("form"), document.getElementsByTagName("body")[0].appendChild(a), b = document.createElement("textarea"), b.id = "SWFUpload_Console", b.style.fontFamily = "monospace", b.setAttribute("wrap", "off"), b.wrap = "off", b.style.overflow = "auto", b.style.width = "700px", b.style.height = "350px", b.style.margin = "5px", a.appendChild(b)), b.value += d + "\n", b.scrollTop = b.scrollHeight - b.clientHeight;
    } catch (c) {
        alert("Exception: " + c.name + " Message: " + c.message);
    }
};

(function($) {
    var methods = {
            "init": function(options, swfUploadOptions) {
                return this.each(function() {
                    var $this = $(this),
                        $clone = $this.clone(),
                        settings = $.extend({
                            "id": $this.attr("id"),
                            "swf": "uploadify.swf",
                            "uploader": "uploadify.php",
                            "auto": !0,
                            "buttonClass": "",
                            "buttonCursor": "hand",
                            "buttonImage": null,
                            "buttonText": "SELECT FILES",
                            "checkExisting": !1,
                            "debug": !1,
                            "fileObjName": "Filedata",
                            "fileSizeLimit": 0,
                            "fileTypeDesc": "All Files",
                            "fileTypeExts": "*.*",
                            "height": 30,
                            "itemTemplate": !1,
                            "method": "post",
                            "multi": !0,
                            "formData": {},
                            "preventCaching": !0,
                            "progressData": "percentage",
                            "queueID": !1,
                            "queueSizeLimit": 999,
                            "removeCompleted": !0,
                            "removeTimeout": 3,
                            "requeueErrors": !1,
                            "successTimeout": 30,
                            "uploadLimit": 0,
                            "width": 120,
                            "overrideEvents": []
                        }, options),
                        swfUploadSettings = {
                            "assume_success_timeout": settings.successTimeout,
                            "button_placeholder_id": settings.id,
                            "button_width": settings.width,
                            "button_height": settings.height,
                            "button_text": null,
                            "button_text_style": null,
                            "button_text_top_padding": 0,
                            "button_text_left_padding": 0,
                            "button_action": settings.multi ? SWFUpload.BUTTON_ACTION.SELECT_FILES : SWFUpload.BUTTON_ACTION.SELECT_FILE,
                            "button_disabled": !1,
                            "button_cursor": settings.buttonCursor == "arrow" ? SWFUpload.CURSOR.ARROW : SWFUpload.CURSOR.HAND,
                            "button_window_mode": SWFUpload.WINDOW_MODE.TRANSPARENT,
                            "debug": settings.debug,
                            "requeue_on_error": settings.requeueErrors,
                            "file_post_name": settings.fileObjName,
                            "file_size_limit": settings.fileSizeLimit,
                            "file_types": settings.fileTypeExts,
                            "file_types_description": settings.fileTypeDesc,
                            "file_queue_limit": settings.queueSizeLimit,
                            "file_upload_limit": settings.uploadLimit,
                            "flash_url": settings.swf,
                            "prevent_swf_caching": settings.preventCaching,
                            "post_params": settings.formData,
                            "upload_url": settings.uploader,
                            "use_query_string": settings.method == "get",
                            "file_dialog_complete_handler": handlers.onDialogClose,
                            "file_dialog_start_handler": handlers.onDialogOpen,
                            "file_queued_handler": handlers.onSelect,
                            "file_queue_error_handler": handlers.onSelectError,
                            "swfupload_loaded_handler": settings.onSWFReady,
                            "upload_complete_handler": handlers.onUploadComplete,
                            "upload_error_handler": handlers.onUploadError,
                            "upload_progress_handler": handlers.onUploadProgress,
                            "upload_start_handler": handlers.onUploadStart,
                            "upload_success_handler": handlers.onUploadSuccess
                        };
                    swfUploadOptions && (swfUploadSettings = $.extend(swfUploadSettings, swfUploadOptions));
                    swfUploadSettings = $.extend(swfUploadSettings, settings);
                    var playerVersion = swfobject.getFlashPlayerVersion(),
                        flashInstalled = playerVersion.major >= 9;
                    if (flashInstalled) {
                        window["uploadify_" + settings.id] = new SWFUpload(swfUploadSettings);
                        var swfuploadify = window["uploadify_" + settings.id];
                        $this.data("uploadify", swfuploadify);
                        var $wrapper = $("<div />", {
                            "id": settings.id,
                            "class": "uploadify",
                            "css": {
                                "height": settings.height + "px",
                                "width": settings.width + "px"
                            }
                        });
                        $("#" + swfuploadify.movieName).wrap($wrapper);
                        $wrapper = $("#" + settings.id);
                        $wrapper.data("uploadify", swfuploadify);
                        var $button = $("<div />", {
                            "id": settings.id + "-button",
                            "class": "uploadify-button " + settings.buttonClass
                        });
                        settings.buttonImage && $button.css({
                            "background-image": "url('" + settings.buttonImage + "')",
                            "text-indent": "-9999px"
                        });
                        $button.html('<span class="uploadify-button-text">' + settings.buttonText + "</span>").css({
                            "height": settings.height + "px",
                            "line-height": settings.height + "px",
                            "width": settings.width + "px"
                        });
                        $wrapper.append($button);
                        $("#" + swfuploadify.movieName).css({
                            "position": "absolute",
                            "z-index": 1
                        });
                        if (!settings.queueID) {
                            var $queue = $("<div />", {
                                "id": settings.id + "-queue",
                                "class": "uploadify-queue"
                            });
                            $wrapper.after($queue), swfuploadify.settings.queueID = settings.id + "-queue", swfuploadify.settings.defaultQueue = !0;
                        }
                        swfuploadify.queueData = {
                            "files": {},
                            "filesSelected": 0,
                            "filesQueued": 0,
                            "filesReplaced": 0,
                            "filesCancelled": 0,
                            "filesErrored": 0,
                            "uploadsSuccessful": 0,
                            "uploadsErrored": 0,
                            "averageSpeed": 0,
                            "queueLength": 0,
                            "queueSize": 0,
                            "uploadSize": 0,
                            "queueBytesUploaded": 0,
                            "uploadQueue": [],
                            "errorMsg": "Some files were not added to the queue:"
                        };
                        swfuploadify.original = $clone;
                        swfuploadify.wrapper = $wrapper;
                        swfuploadify.button = $button;
                        swfuploadify.queue = $queue;
                        settings.onInit && settings.onInit.call($this, swfuploadify);
                    } else {
                        settings.onFallback && settings.onFallback.call($this);
                    }
                });
            },
            "cancel": function(fileID, supressEvent) {
                var args = arguments;
                this.each(function() {
                    var $this = $(this),
                        swfuploadify = $this.data("uploadify"),
                        settings = swfuploadify.settings,
                        delay = -1;
                    if (args[0])
                        if (args[0] == "*") {
                            var queueItemCount = swfuploadify.queueData.queueLength;
                            $("#" + settings.queueID).find(".uploadify-queue-item").each(function() {
                                delay++, args[1] === !0 ? swfuploadify.cancelUpload($(this).attr("id"), !1) : swfuploadify.cancelUpload($(this).attr("id")), $(this).find(".data").removeClass("data").html(" - Cancelled"), $(this).find(".uploadify-progress-bar").remove(), $(this).delay(1e3 + 100 * delay).fadeOut(500, function() {
                                    $(this).remove();
                                });
                            }), swfuploadify.queueData.queueSize = 0, swfuploadify.queueData.queueLength = 0, settings.onClearQueue && settings.onClearQueue.call($this, queueItemCount);
                        } else
                            for (var n = 0; n < args.length; n++) swfuploadify.cancelUpload(args[n]), $("#" + args[n]).find(".data").removeClass("data").html(" - Cancelled"), $("#" + args[n]).find(".uploadify-progress-bar").remove(), $("#" + args[n]).delay(1e3 + 100 * n).fadeOut(500, function() {
                                $(this).remove();
                            });
                    else {
                        var item = $("#" + settings.queueID).find(".uploadify-queue-item").get(0);
                        $item = $(item), swfuploadify.cancelUpload($item.attr("id")), $item.find(".data").removeClass("data").html(" - Cancelled"), $item.find(".uploadify-progress-bar").remove(), $item.delay(1e3).fadeOut(500, function() {
                            $(this).remove();
                        });
                    }
                });
            },
            "destroy": function() {
                this.each(function() {
                    var $this = $(this),
                        swfuploadify = $this.data("uploadify"),
                        settings = swfuploadify.settings;
                    swfuploadify.destroy(), settings.defaultQueue && $("#" + settings.queueID).remove(), $("#" + settings.id).replaceWith(swfuploadify.original), settings.onDestroy && settings.onDestroy.call(this), swfuploadify = null;
                });
            },
            "disable": function(isDisabled) {
                this.each(function() {
                    var $this = $(this),
                        swfuploadify = $this.data("uploadify"),
                        settings = swfuploadify.settings;
                    isDisabled ? (swfuploadify.button.addClass("disabled"), settings.onDisable && settings.onDisable.call(this)) : (swfuploadify.button.removeClass("disabled"), settings.onEnable && settings.onEnable.call(this)), swfuploadify.setButtonDisabled(isDisabled);
                });
            },
            "settings": function(name, value, resetObjects) {
                var args = arguments,
                    returnValue = value;
                this.each(function() {
                    var $this = $(this),
                        swfuploadify = $this.data("uploadify"),
                        settings = swfuploadify.settings;
                    if (typeof args[0] == "object")
                        for (var n in value) setData(n, value[n]);
                    if (args.length === 1) returnValue = settings[name];
                    else {
                        switch (name) {
                            case "uploader":
                                swfuploadify.setUploadURL(value);
                                break;
                            case "formData":
                                resetObjects || (value = $.extend(settings.formData, value)), swfuploadify.setPostParams(settings.formData);
                                break;
                            case "method":
                                value == "get" ? swfuploadify.setUseQueryString(!0) : swfuploadify.setUseQueryString(!1);
                                break;
                            case "fileObjName":
                                swfuploadify.setFilePostName(value);
                                break;
                            case "fileTypeExts":
                                swfuploadify.setFileTypes(value, settings.fileTypeDesc);
                                break;
                            case "fileTypeDesc":
                                swfuploadify.setFileTypes(settings.fileTypeExts, value);
                                break;
                            case "fileSizeLimit":
                                swfuploadify.setFileSizeLimit(value);
                                break;
                            case "uploadLimit":
                                swfuploadify.setFileUploadLimit(value);
                                break;
                            case "queueSizeLimit":
                                swfuploadify.setFileQueueLimit(value);
                                break;
                            case "buttonImage":
                                swfuploadify.button.css("background-image", settingValue);
                                break;
                            case "buttonCursor":
                                value == "arrow" ? swfuploadify.setButtonCursor(SWFUpload.CURSOR.ARROW) : swfuploadify.setButtonCursor(SWFUpload.CURSOR.HAND);
                                break;
                            case "buttonText":
                                $("#" + settings.id + "-button").find(".uploadify-button-text").html(value);
                                break;
                            case "width":
                                swfuploadify.setButtonDimensions(value, settings.height);
                                break;
                            case "height":
                                swfuploadify.setButtonDimensions(settings.width, value);
                                break;
                            case "multi":
                                value ? swfuploadify.setButtonAction(SWFUpload.BUTTON_ACTION.SELECT_FILES) : swfuploadify.setButtonAction(SWFUpload.BUTTON_ACTION.SELECT_FILE);
                        }
                        settings[name] = value;
                    }
                });
                if (args.length === 1) return returnValue;
            },
            "stop": function() {
                this.each(function() {
                    var $this = $(this),
                        swfuploadify = $this.data("uploadify");
                    swfuploadify.queueData.averageSpeed = 0, swfuploadify.queueData.uploadSize = 0, swfuploadify.queueData.bytesUploaded = 0, swfuploadify.queueData.uploadQueue = [], swfuploadify.stopUpload();
                });
            },
            "upload": function() {
                var args = arguments;
                this.each(function() {
                    var $this = $(this),
                        swfuploadify = $this.data("uploadify");
                    swfuploadify.queueData.averageSpeed = 0, swfuploadify.queueData.uploadSize = 0, swfuploadify.queueData.bytesUploaded = 0, swfuploadify.queueData.uploadQueue = [];
                    if (args[0])
                        if (args[0] == "*") swfuploadify.queueData.uploadSize = swfuploadify.queueData.queueSize, swfuploadify.queueData.uploadQueue.push("*"), swfuploadify.startUpload();
                        else {
                            for (var n = 0; n < args.length; n++) swfuploadify.queueData.uploadSize += swfuploadify.queueData.files[args[n]].size, swfuploadify.queueData.uploadQueue.push(args[n]);
                            swfuploadify.startUpload(swfuploadify.queueData.uploadQueue.shift());
                        }
                    else swfuploadify.startUpload();
                });
            }
        },
        handlers = {
            "onDialogOpen": function() {
                var settings = this.settings;
                this.queueData.errorMsg = "Some files were not added to the queue:", this.queueData.filesReplaced = 0, this.queueData.filesCancelled = 0, settings.onDialogOpen && settings.onDialogOpen.call(this);
            },
            "onDialogClose": function(filesSelected, filesQueued, queueLength) {
                var settings = this.settings;
                this.queueData.filesErrored = filesSelected - filesQueued, this.queueData.filesSelected = filesSelected, this.queueData.filesQueued = filesQueued - this.queueData.filesCancelled, this.queueData.queueLength = queueLength, $.inArray("onDialogClose", settings.overrideEvents) < 0 && this.queueData.filesErrored > 0 && alert(this.queueData.errorMsg), settings.onDialogClose && settings.onDialogClose.call(this, this.queueData), settings.auto && $("#" + settings.id).uploadify("upload", "*");
            },
            "onSelect": function(file) {
                var settings = this.settings,
                    queuedFile = {};
                for (var n in this.queueData.files) {
                    queuedFile = this.queueData.files[n];
                    if (queuedFile.uploaded != 1 && queuedFile.name == file.name) {
                        var replaceQueueItem = confirm('The file named "' + file.name + '" is already in the queue.\nDo you want to replace the existing item in the queue?');
                        if (!replaceQueueItem) return this.cancelUpload(file.id), this.queueData.filesCancelled++, !1;
                        $("#" + queuedFile.id).remove(), this.cancelUpload(queuedFile.id), this.queueData.filesReplaced++;
                    }
                }
                var fileSize = Math.round(file.size / 1024),
                    suffix = "KB";
                fileSize > 1e3 && (fileSize = Math.round(fileSize / 1e3), suffix = "MB");
                var fileSizeParts = fileSize.toString().split(".");
                fileSize = fileSizeParts[0], fileSizeParts.length > 1 && (fileSize += "." + fileSizeParts[1].substr(0, 2)), fileSize += suffix;
                var fileName = file.name;
                fileName.length > 25 && (fileName = fileName.substr(0, 25) + "..."), itemData = {
                    "fileID": file.id,
                    "instanceID": settings.id,
                    "fileName": fileName,
                    "fileSize": fileSize
                }, settings.itemTemplate == 0 && (settings.itemTemplate = '<div id="${fileID}" class="uploadify-queue-item">                    <div class="cancel">                        <a href="javascript:$(\'#${instanceID}\').uploadify(\'cancel\', \'${fileID}\')">X</a>                   </div>                  <span class="fileName">${fileName} (${fileSize})</span><span class="data"></span>                   <div class="uploadify-progress">                        <div class="uploadify-progress-bar"><!--Progress Bar--></div>                   </div>              </div>');
                if ($.inArray("onSelect", settings.overrideEvents) < 0) {
                    itemHTML = settings.itemTemplate;
                    for (var d in itemData) itemHTML = itemHTML.replace(new RegExp("\\$\\{" + d + "\\}", "g"), itemData[d]);
                    $("#" + settings.queueID).append(itemHTML);
                }
                this.queueData.queueSize += file.size, this.queueData.files[file.id] = file, settings.onSelect && settings.onSelect.apply(this, arguments);
            },
            "onSelectError": function(file, errorCode, errorMsg) {
                var settings = this.settings;
                if ($.inArray("onSelectError", settings.overrideEvents) < 0) switch (errorCode) {
                    case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
                        settings.queueSizeLimit > errorMsg ? this.queueData.errorMsg += "\nThe number of files selected exceeds the remaining upload limit (" + errorMsg + ")." : this.queueData.errorMsg += "\nThe number of files selected exceeds the queue size limit (" + settings.queueSizeLimit + ").";
                        break;
                    case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                        this.queueData.errorMsg += '\nThe file "' + file.name + '" exceeds the size limit (' + settings.fileSizeLimit + ").";
                        break;
                    case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
                        this.queueData.errorMsg += '\nThe file "' + file.name + '" is empty.';
                        break;
                    case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                        this.queueData.errorMsg += '\nThe file "' + file.name + '" is not an accepted file type (' + settings.fileTypeDesc + ").";
                }
                errorCode != SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED && delete this.queueData.files[file.id], settings.onSelectError && settings.onSelectError.apply(this, arguments);
            },
            "onQueueComplete": function() {
                this.settings.onQueueComplete && this.settings.onQueueComplete.call(this, this.settings.queueData);
            },
            "onUploadComplete": function(file) {
                var settings = this.settings,
                    swfuploadify = this,
                    stats = this.getStats();
                this.queueData.queueLength = stats.files_queued, this.queueData.uploadQueue[0] == "*" ? this.queueData.queueLength > 0 ? this.startUpload() : (this.queueData.uploadQueue = [], settings.onQueueComplete && settings.onQueueComplete.call(this, this.queueData)) : this.queueData.uploadQueue.length > 0 ? this.startUpload(this.queueData.uploadQueue.shift()) : (this.queueData.uploadQueue = [], settings.onQueueComplete && settings.onQueueComplete.call(this, this.queueData));
                if ($.inArray("onUploadComplete", settings.overrideEvents) < 0)
                    if (settings.removeCompleted) switch (file.filestatus) {
                        case SWFUpload.FILE_STATUS.COMPLETE:
                            setTimeout(function() {
                                $("#" + file.id) && (swfuploadify.queueData.queueSize -= file.size, swfuploadify.queueData.queueLength -= 1, delete swfuploadify.queueData.files[file.id], $("#" + file.id).fadeOut(500, function() {
                                    $(this).remove();
                                }));
                            }, settings.removeTimeout * 1e3);
                            break;
                        case SWFUpload.FILE_STATUS.ERROR:
                            settings.requeueErrors || setTimeout(function() {
                                $("#" + file.id) && (swfuploadify.queueData.queueSize -= file.size, swfuploadify.queueData.queueLength -= 1, delete swfuploadify.queueData.files[file.id], $("#" + file.id).fadeOut(500, function() {
                                    $(this).remove();
                                }));
                            }, settings.removeTimeout * 1e3);
                    } else file.uploaded = !0;
                settings.onUploadComplete && settings.onUploadComplete.call(this, file);
            },
            "onUploadError": function(file, errorCode, errorMsg) {
                var settings = this.settings,
                    errorString = "Error";
                switch (errorCode) {
                    case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
                        errorString = "HTTP Error (" + errorMsg + ")";
                        break;
                    case SWFUpload.UPLOAD_ERROR.MISSING_UPLOAD_URL:
                        errorString = "Missing Upload URL";
                        break;
                    case SWFUpload.UPLOAD_ERROR.IO_ERROR:
                        errorString = "IO Error";
                        break;
                    case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
                        errorString = "Security Error";
                        break;
                    case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
                        alert("The upload limit has been reached (" + errorMsg + ")."), errorString = "Exceeds Upload Limit";
                        break;
                    case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
                        errorString = "Failed";
                        break;
                    case SWFUpload.UPLOAD_ERROR.SPECIFIED_FILE_ID_NOT_FOUND:
                        break;
                    case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
                        errorString = "Validation Error";
                        break;
                    case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
                        errorString = "Cancelled", this.queueData.queueSize -= file.size, this.queueData.queueLength -= 1;
                        if (file.status == SWFUpload.FILE_STATUS.IN_PROGRESS || $.inArray(file.id, this.queueData.uploadQueue) >= 0) this.queueData.uploadSize -= file.size;
                        settings.onCancel && settings.onCancel.call(this, file), delete this.queueData.files[file.id];
                        break;
                    case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
                        errorString = "Stopped";
                }
                $.inArray("onUploadError", settings.overrideEvents) < 0 && (errorCode != SWFUpload.UPLOAD_ERROR.FILE_CANCELLED && errorCode != SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED && $("#" + file.id).addClass("uploadify-error"), $("#" + file.id).find(".uploadify-progress-bar").css("width", "1px"), errorCode != SWFUpload.UPLOAD_ERROR.SPECIFIED_FILE_ID_NOT_FOUND && file.status != SWFUpload.FILE_STATUS.COMPLETE && $("#" + file.id).find(".data").html(" - " + errorString));
                var stats = this.getStats();
                this.queueData.uploadsErrored = stats.upload_errors, settings.onUploadError && settings.onUploadError.call(this, file, errorCode, errorMsg, errorString);
            },
            "onUploadProgress": function(file, fileBytesLoaded, fileTotalBytes) {
                var settings = this.settings,
                    timer = new Date,
                    newTime = timer.getTime(),
                    lapsedTime = newTime - this.timer;
                lapsedTime > 500 && (this.timer = newTime);
                var lapsedBytes = fileBytesLoaded - this.bytesLoaded;
                this.bytesLoaded = fileBytesLoaded;
                var queueBytesLoaded = this.queueData.queueBytesUploaded + fileBytesLoaded,
                    percentage = Math.round(fileBytesLoaded / fileTotalBytes * 100),
                    suffix = "KB/s",
                    mbs = 0,
                    kbs = lapsedBytes / 1024 / (lapsedTime / 1e3);
                kbs = Math.floor(kbs * 10) / 10, this.queueData.averageSpeed > 0 ? this.queueData.averageSpeed = Math.floor((this.queueData.averageSpeed + kbs) / 2) : this.queueData.averageSpeed = Math.floor(kbs), kbs > 1e3 && (mbs = kbs * .001, this.queueData.averageSpeed = Math.floor(mbs), suffix = "MB/s"), $.inArray("onUploadProgress", settings.overrideEvents) < 0 && (settings.progressData == "percentage" ? $("#" + file.id).find(".data").html(" - " + percentage + "%") : settings.progressData == "speed" && lapsedTime > 500 && $("#" + file.id).find(".data").html(" - " + this.queueData.averageSpeed + suffix), $("#" + file.id).find(".uploadify-progress-bar").css("width", percentage + "%")), settings.onUploadProgress && settings.onUploadProgress.call(this, file, fileBytesLoaded, fileTotalBytes, queueBytesLoaded, this.queueData.uploadSize);
            },
            "onUploadStart": function(file) {
                var settings = this.settings,
                    timer = new Date;
                this.timer = timer.getTime(), this.bytesLoaded = 0, this.queueData.uploadQueue.length == 0 && (this.queueData.uploadSize = file.size), settings.checkExisting && $.ajax({
                    "type": "POST",
                    "async": !1,
                    "url": settings.checkExisting,
                    "data": {
                        "filename": file.name
                    },
                    "success": function(data) {
                        if (data == 1) {
                            var overwrite = confirm('A file with the name "' + file.name + '" already exists on the server.\nWould you like to replace the existing file?');
                            overwrite || (this.cancelUpload(file.id), $("#" + file.id).remove(), this.queueData.uploadQueue.length > 0 && this.queueData.queueLength > 0 && (this.queueData.uploadQueue[0] == "*" ? this.startUpload() : this.startUpload(this.queueData.uploadQueue.shift())));
                        }
                    }
                }), settings.onUploadStart && settings.onUploadStart.call(this, file);
            },
            "onUploadSuccess": function(file, data, response) {
                var settings = this.settings,
                    stats = this.getStats();
                this.queueData.uploadsSuccessful = stats.successful_uploads, this.queueData.queueBytesUploaded += file.size, $.inArray("onUploadSuccess", settings.overrideEvents) < 0 && $("#" + file.id).find(".data").html(" - Complete"), settings.onUploadSuccess && settings.onUploadSuccess.call(this, file, data, response);
            }
        };
    $.fn.uploadify = function(method) {
        if (methods[method]) return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        if (typeof method == "object" || !method) return methods.init.apply(this, arguments);
        $.error("The method " + method + " does not exist in $.uploadify");
    };
})($);