var echo = require('../utils/logger');
var CACHE = require('../utils/cache');
// 代码集
var supportList = {
    // 服务器心跳
    'rpc_server_heartbeat': function() {
        if(CACHE.battle.battleType === 0) {
            // 合作模式
            /*if(CACHE._times > 0) {
                return 'server.rpc_server_start_game(2)'; // 合作模式
            } else {
                if(CACHE.AdvertData.cooperateAdvertLimit) {
                    return 'server.rpc_server_start_game(1)'; // 竞技模式
                }
            }*/
        }
    },
    // 登录
    'rpc_server_login': function(data) {
        CACHE.loginInfo = data;
    },
    // 版本信息
    'rpc_server_version': function(appVer, codeVer, hash, channel) {
        // rpc_server_version(\"1.4.1\",\"1.1.9\",\"c43055b8d3d34b67d050a5e1fbd3e8dd\",\"db_20003\")
        CACHE.version = {
            appVer,
            codeVer,
            hash,
            channel
        };
    },
    // 龙珠升级
    'rpc_server_dragon_ball_upgrade': function(dbType) {},
    // 设置卡组
    'rpc_server_dragon_ball_set_deck': function(index, ballData) {},
    // 切换卡组
    'rpc_server_dragon_ball_switch_deck': function(index) {
        CACHE.dragonBallInfo.dragonBallDeckIndex = index + 1;
    },
    /**
     * 开始游戏
     * @param battleType - 1.正常排位 2.合作模式 3.竞技场
     */
    'rpc_server_start_game': function(battleType) {

    },
    // 购买物品
    'rpc_server_market_daily_special_buy': function(itemId) {

    },
    // 视频广告刷新信息
    'rpc_server_video_ads_refresh_info': function(adType) {},
    // 视频广告点击观看
    'rpc_server_video_ads_click_watch': function(adType) {},
};
// 客户端 -> 服务器
function C_S(handleStr) {
    var result, evalStr;
    if(new RegExp(Object.keys(supportList).join("|")).test(handleStr)) {
        // echo.log('[记录日志] [C_S] ' + handleStr);
        // 处理方法
        try{
            evalStr = "supportList." + handleStr;
            //echo("[Eval]", evalStr);
            result = eval(evalStr);
            if(result) {
                // echo('[C->S 处理代码]', handleStr, "\n[处理结果]", result);
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

module.exports = C_S;