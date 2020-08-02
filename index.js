var express = require('express');
var app = express();
var api = require('./lib/api');
var logger = require('./utils/logger');
var port = 5147;
var CACHE = require('./utils/cache');
// require('./socket');

var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    logger("应用实例，访问地址为 http://%s:%s", host, port)
});

// 主页
app.get('/', function (req, res) {
    CACHE.saveCache(); // 缓存写到文件
    res.send(JSON.stringify(CACHE));
});

// api
app.post('/api.php', api);
