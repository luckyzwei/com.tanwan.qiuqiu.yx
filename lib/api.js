// 接口实现
var getPost = require('../utils/getPost');
var echo = require('../utils/logger');
var CACHE = require('../utils/cache');
// 主界面
var C_S = require('./C_S');
var S_C = require('./S_C');
// 战斗
var BS_C = require('./BS_C');
var C_BS = require('./C_BS');
// 执行代码、缓存
var eval = null;

function Realize(request, response) {
    // console.log('[API] handle ...');
    getPost(request, response).then((post) => {
        // console.log('[POST]', post);
        var json, result;
        try{
            post = post.replace(/'/g,'"');
            json = JSON.parse(beforeHandleMsg(post));
        }catch (e) {
            return console.error('[-不支持的内容]', post,e.message);
        }
        handleMsg(json.msg);
        result = JSON.stringify({
            'code': 0,
            'msg': '请求成功',
            // 配置信息
            'data' : {
                'eval': eval || undefined,
                'debug': true, // 调试开关
                'ip': '127.0.0.1',
            }
        });
        response.send(result);
    });
}

// 处理消息前 - str
function beforeHandleMsg(str) {
    var result = str;
    // 返回内容置空
    var setNil = function() {
        result = '{"msg":""}';
    };
    // 屏蔽函数列表
    var shieldList = [

    ];
    var shieldStrList = [
        '\\|@\\|[\\-]?\d+$',
        'LUA ERROR',
        'stack traceback:',
        'rpc_parse error',
        'pool size is',
        'Cannot read property',
        'prepare rpc_server_heartbeat_pto',
        '该商品列表在表中是属于id',
    ];
    if(shieldStrList.length && new RegExp(shieldStrList.join("|")).test(result)) {
        setNil();
        // echo('[NotShowMsg] 不展示 Lua 执行错误！')
    } else if(shieldList.length && new RegExp(shieldList.join("|")).test(result)) {
        setNil();
        // echo('[NotShowMsg] 不展示函数内容！')
    }
    // echo('result', result);
    return result;
}
// 处理消息
function handleMsg(msg) {
    if(!msg) return;
    // 分割约定标识 “|@|”
    var msgList = (msg||"").split("|@|");
    var msgListClone = Clone(msgList);
    var logStr = "";
    if(msgList.length > 0) {
        if(/^\[\w+\]:$/.test(msgList[0])) {
            if(msgList[0] === "[QTZ_DEBUG]:") {
                logStr = "[调试] ";
            } else if(msgList[0] === "[QTZ_INFO]:") {
                logStr = "[信息] ";
            } else if(msgList[0] === "[QTZ_ERROR]:") {
                logStr = "[错误] ";
            } else {
                logStr = msgList[0];
            }
            // 匹配 “[****]:” 格式
            msgList.splice(0,1); // 删除开头数组
            // 因为上面删除了 第一个，数组下标重新开始计数
            if(msgList.length > 0) {
                if(isExclude(msgListClone)) {
                    return;
                }
                eval = acquireEval(msgList);
                // echo("[acquireEval]", eval);
            }
        }
        logStr = logStr + JSON.stringify(msgList);
    } else {
        logStr = JSON.stringify(msgList);
    }
    // 处理过的消息不提示，由处理方法自行提示
    if(!eval) {
        echo('[HandleMsg]', logStr);
    }
}

// 处理消息并返回 eval
function acquireEval(msgList) {
    var evalStr, msgItem;
    var handleFunc = {
        // 客户端 -> 服务器
        'C_S': C_S,
        // 服务器 -> 客户端
        'S_C': S_C,
        // 战斗：客户端 -> 服务器
        'BS_C': BS_C,
        // 战斗：服务器 -> 客户端
        'C_BS': C_BS,
    };
    if(msgList.length > 0) {
        msgItem = msgList[0];
        if(/^\[C->S\]/.test(msgItem)) {
            evalStr = handleFunc.C_S(msgItem.substr(7));
        } else if(/^\[S->C\]/.test(msgItem)) {
            evalStr = handleFunc.S_C(msgItem.substr(7));
        } else if(/^\[BS->C\]/.test(msgItem)) {
            evalStr = handleFunc.BS_C(msgItem.substr(8));
        } else if(/^\[C->BS\]/.test(msgItem)) {
            evalStr = handleFunc.C_BS(msgItem.substr(8));
        }
    }
    return evalStr;
}
// 排除消息
function isExclude(msgList) {
    var result = false;
    // 此处匹配集合
    var excludeList = [
        /^load csb:/, // 资源加载不打印
        /^cur pop layer num/ // 视图数
    ];
    var msgItem = msgList[1];
    for (var i=0; i < excludeList.length ;i++) {
        var regexp = excludeList[i];
        if(regexp.test(msgItem)) {
            result = true; // 匹配内容跳出，不打印
            break;
        }
    }
    return result;
}
// 克隆
function Clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
// 输出
/*function echo() {
    console.log.apply(console, [].concat.apply([], arguments))
}*/
module.exports = Realize;