var echo = require('../utils/logger');
var CACHE = require('../utils/cache');
// 代码集
var supportList = {
    // 登录
    'rpc_server_brpc_login': function() {
        // rpc_server_brpc_login({\"randomSeed\":0,\"uid\":1465967,\"roomId\":19})
    },
    // 创建球球
    'rpc_server_fight_ball_create': function () {
        // rpc_server_fight_ball_create
    },
    // 升级球球
    'rpc_server_fight_ball_upgrade': function (type) {
        // rpc_server_fight_ball_upgrade(2)
    },
    // 合并球球
    'rpc_server_fight_ball_merge': function(ballIdFrom, ballIdTo) {
        // rpc_server_fight_ball_merge(573,230)
    },
    // 战斗信息请求 - 同步怪物信息
    'rpc_server_fight_info_request': function(monsterType) {
        // 1.怪物信息 - BattleConst.BattleInfoRequestType.Monster
    },
};
// 战斗：客户端 -> 服务器
function C_BS(handleStr) {
    var result, evalStr;
    if(new RegExp(Object.keys(supportList).join("|")).test(handleStr)) {
        CACHE.DEBUG && echo.log('[记录日志] [C_BS] ' + handleStr);
        // 处理方法
        try{
            evalStr = "supportList." + handleStr;
            //echo("[Eval]", evalStr);
            result = eval(evalStr);
            if(result) {
                // echo('[C->BS 处理代码]', handleStr, "\n[处理结果]", result);
            } else {
                result = "DEBUG = 4"; // 空代码执行
                // echo('[无法处理代码]', handleStr);
            }
        }catch (e) {
            echo('[不支持的执行代码]', handleStr, e.message);
        }
    } else {
        // 未处理
    }
    return result;
}

module.exports = C_BS;