var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var url = require('url');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//*************************** handler ***************************
var handlers = {
    'get': {
        '/api/test': {
            getKey: 'Welcome to Simple Node  WebServer!!!'
        },
        '/api/test1': 'test1',
        '/api/test2': 'test2'
    },
    'post': {
        '/test': {
            postKey: 'post测试数据'
        }
    },
    'options': {
        '/*': {
            status: 'options ok!'
        }
    }
};

function createJsonp(data, jsonp) {
    return jsonp + '(' + data + ')';
}

function doHandler(method, handle) {
    for (var path in handle) {
        if (handle.hasOwnProperty(path)) {
            (function (path) {
                // ajax
                // app[method](path, function (req, res) {
                //     res.writeHeader(200, {
                //         'Content-Type': 'text/json;charset=UTF-8',
                //         'Access-Control-Allow-Credentials': true,
                //         'Access-Control-Allow-Headers': 'x-requested-with,Content-Type',
                //         'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                //         'Access-Control-Allow-Origin': req.headers.origin || req.headers.host || "*",
                //         'Access-Control-Max-Age': 3600,
                //         'Server': 'Node Mock Server',
                //         'Website': 'https://github.com/Louiszhai/node-webserver'
                //     });
                //     res.write(JSON.stringify(handle[path]));
                //     res.end();
                // });

                // jsonp形式
                app[method](path, function (req, res) {
                    var query = req.query;
                    var jsonp = query.callback ? query.callback : '';
                    console.log(req.query, req.path, req.url);
                    console.log(url.parse(req.url));
                    if (jsonp) {
                        res.writeHeader(200, {
                            "Content-Type": "application/javascript",
                            "Server": "Node Mock Server"
                        });
                        res.write(createJsonp(JSON.stringify(handle[path]), jsonp));
                    } else {
                        res.writeHeader(200, {
                            "Content-Type": "application/json",
                            "Server": "Node Mock Server"
                        });
                        res.write(JSON.stringify(handle[path]));
                    }

                    res.end();
                });
            })(path);
        }
    }
}

for (var method in handlers) {
    if (handlers.hasOwnProperty(method)) {
        doHandler(method, handlers[method]);
    }
}
//*************************** handler ***************************
//var bodyParser = require('body-parser');
//app.use(bodyParser({ uploadDir: './upload' }));

app.use(express.static('./'));

app.listen(7788, function () {
    console.log('listening on *:7788');
});
