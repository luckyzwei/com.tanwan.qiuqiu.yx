var fs = require('fs');
var path = require('path');
var gameData = require('./gameData');

var filePath = path.join(__dirname, './cache.json');

var CACHE = {
    'DEBUG': false, // 开关调试日志记录
    'version': {}, // 版本相关信息
    'mailList': [], // 邮箱数据
    'gonggaoBoard': {}, // 公告数据
    'honorTokenInfo': {}, // 荣誉令牌信息
    'chatList': [], // 聊天记录
    'friendList': [], // 好友列表
    'LegionData': { myLegionInfo: {}, membersInfo:[] }, // 军团数据
    'LegionGoalData': {}, // 军团的目标数据
    'arenaData': {}, // 竞技场数据
    'userInfo': {}, // 用户信息
    'loginInfo': {}, // 登录信息
    // 对局信息
    'battle': {
        battleType: 0, // 对战类型：1.正常排位 2.合作模式 3.竞技场
        runTimeLeft: -1, // 登录游戏时间
        runTimeInterval: 500, // 游戏帧处理间隔
        killBallMergeTime: -1, // 抢救球球 时间
        // 我方玩家 信息
        self: {
            cfg: {},
            ballMaxNum: 15,
            ballList: {},
            ballsGrade: {}
        }
    },
    'ads_can': {},
    'adsWatchCnt': 0,  // 每日广告播放次数
    'dragonBallInfo': {}, // 龙珠信息
    // 广告类型
    'AdvertData': {
        'shopAdvertType': 1,  // 商店
        'pvpAdvertType': 2,   // 竞技
        'cooperateAdvertType': 3,  // 合作
        'getRewardAdvertType': 4,  // 支援宝箱
        'missionAdvertType': 5,  // 任务
        'legionContributeAdvertType': 6,  // 球队捐献广告
        'shopAdvertLimit': false, // 商店广告限制
        'hasVideoAdsBuff': false, // 竞技BUFF
        'cooperateAdvertLimit': false // 合作广告限制
    },

    '_advertList': {},
    '_curNum': 0, // 当前龙珠数
    '_vipType': 0, // 0是免费。1是vip
    '_times': 0, // 当前刷新次数
    '_curTime': 0, // 剩余刷新时间
    '_noticeList': [], // 通用广告
    '_cheapPackIsOpen': false, // 1元礼包。6元礼包
    '_cheapPackData': [], // 1元礼包。6元礼包
};

// 读入文件到缓存
CACHE.readCache = function() {
    fs.readFile(filePath, 'utf8', function(err, data){
        if (err) {
            // 可能文件不存在之类的错误
            // console.error(err);
            return;
        }
        var json = JSON.parse(data);
        Object.assign(CACHE, json);
    });
};

// 缓存到文件数据
CACHE.saveCache = function() {
    // 清空内容
    fs.writeFile(filePath, JSON.stringify(CACHE), function (err) {
        if(err){
            console.log(err);
        }
    });
};

// 创建玩家空白节点
CACHE.clearPlay = function() {
    CACHE.battle.self.ballList = {};
};

/**
 * 取球球名称
 * @param ballType
 * @returns {string}
 */
CACHE.getBallName = function(ballType) {
    return gameData.ballNameList[ ballType - 1 ]; // 球球 name 等于 ballType-1 / JS 数组下标
};

/**
 * 根据 ID 取 球球对象
 * @param {number} ballId
 * @returns { {ballId: number, ballType: number, pos: number, star: number} }
 */
CACHE.getBallById = function(ballId) {
    /*{
        ballId: ballId, // 球球创建ID
        ballType: ballType, // 球球ID
        ballName: 'xxxxx', // 球球名称
        pos: pos, // 棋盘坐标
        star: ballInfo.star // 球球星级
    }*/
    return CACHE.battle.self.ballList[ballId];
};

// 合并球球判断 - 根据传入球球 ID 查询相同类型同等级的球球
CACHE.getBallMergeId = function(ballId) {
    var mergeFromObj = CACHE.getBallById(ballId);
    var mergeToObj = null;
    var ballList = CACHE.battle.self.ballList;
    var keysList = Object.keys(ballList);
    for (var i=0; i < keysList.length ;i++) {
        var key = keysList[i];
        var ballItem = ballList[key];
        if(ballId !== ballItem.ballId) {
            if(ballItem.ballType === mergeFromObj.ballType && ballItem.star === mergeFromObj.star) {
                mergeToObj = ballItem;
                break;
            }
        }
    }
    return mergeToObj;
};

// 排序球球列表 - 根据 球球星星
CACHE.getBallKeysSort = function() {
    var i, j, temp,
        ballList = CACHE.battle.self.ballList,
        keyList = Object.keys(ballList);
	// 从第到高排序
    for(i=0; i < keyList.length - 1 ; i++) {
        for(j=0; j < keyList.length - 1 - i ; j++) {
            var key1 = keyList[j],
                key2 = keyList[j + 1];
            if(ballList[key1].star > ballList[key2].star) {
                temp = key1;
                keyList[j] = key2;
                keyList[j + 1] = temp;
            }
        }
    }
	// 反转结果 高到低
    return keyList.reverse();
};

// 读取缓存还原数据
CACHE.readCache();

module.exports = CACHE;