var net = require('net');
//模块引入
var listenPort = 5148;//监听端口
var server = net.createServer(function(socket){
    // 创建socket服务端
    console.log('connect: ' + socket.remoteAddress + ':' + socket.remotePort);
    socket.setEncoding('binary');

    //接收到数据
    socket.on('data', function(data){
        console.log('client send:' + data);
    });

    socket.write('Hello client!\r\n');
    // socket.pipe(socket);

    //数据错误事件
    socket.on('error',function(exception){
        console.log('socket error:' + exception);
        socket.end();
    });

    //客户端关闭事件
    socket.on('close',function(data){
        console.log('client closed!');
        // socket.remoteAddress + ' ' + socket.remotePort);
    });
}).listen(listenPort);

//服务器监听事件
server.on('listening',function(){
    console.log("server listening:" + server.address().port);
});

//服务器错误事件
server.on("error",function(exception){
    console.log("server error:" + exception);
});