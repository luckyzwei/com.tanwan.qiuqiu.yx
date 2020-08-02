var fs = require('fs');
var path = require('path');
var filePath = path.join(__dirname, '../log/runtime.log');

// 清空 log 内容
fs.writeFile(filePath, '', function (err) {
    if(err){
        console.log(err);
    }
});

// 调试输出 并 写入文件
function echo() {
    var args = [].concat.apply([], arguments);
    echo.log(args.join(' ') + "\n");
    console.log.apply(console, args);
}

echo.log = function(str) {
    // fs.appendFileSync(filePath, str);
    fs.appendFile(filePath, str, (err) => {
        if (err) {
            console.log('appendFile Err#', err);
        }
    });
};

module.exports = echo;