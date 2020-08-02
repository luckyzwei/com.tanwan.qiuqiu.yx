var querystring = require('querystring');
var util = require('util');
function getPost(request, response){
    return new Promise((resolve, reject) => {
        // console.log('[POST] get data ...');
        // 定义了一个post变量，用于暂存请求体的信息
        var post = '';

        // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
        request.on('data', function(chunk){
            // console.log('[POST] chunk data ...');
            post += chunk;
        });

        // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
        request.on('end', function(){
            // console.log('[POST] get data end.');
            // post = querystring.parse(post);
            // response.end();
            // util.inspect(post)
            resolve(post);
        });
    });
}

module.exports = getPost;