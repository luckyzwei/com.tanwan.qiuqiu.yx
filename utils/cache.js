var fs = require('fs');
var path = require('path');
var gameData = require('./gameData');

var filePath = path.join(__dirname, './cache.json');

var CACHE = {
    'DEBUG': false, // 开关调试日志记录
    'refreshShopAdvert': true, // 自动点击商店广告刷新免费商品，领取奖励
    'autoPlay': {
        'pvpAdvertType': true,   // 竞技
        'cooperateAdvertType': false,  // 合作
    },

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
        /*BattleConst.BossType = {
            Knight = 101,	-- 骑士（转王）
            Magician = 102,	-- 魔术师
            Imprison = 103,	-- 禁锢
            Summoner = 104,	-- 召唤师
            Assassinator = 105,	-- 暗杀大师
        }*/
        bossTrailer: 0, // boss 预告
        battleType: 0, // 对战类型：1.正常排位 2.合作模式 3.竞技场
        runTimeLeft: -1, // 登录游戏时间
        runTimeInterval: 1000, // 游戏帧处理间隔
        killBallMergeTime: -1, // 抢救球球 时间
        // 我方玩家 信息
        self: {
            cfg: {},
            ballMaxNum: 15,
            ballList: {},
            ballsGrade: {}
        },
        roundMonsterCount:0,
        currentRound:0,
        
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
        'cooperateAdvertLimit': true // 合作广告限制
    },

    '_advertList': {},
    '_curNum': 0, // 当前龙珠数
    '_vipType': 0, // 0是免费。1是vip
    '_times': 0, // 当前刷新次数
    '_curTime': 0, // 剩余刷新时间
    '_noticeList': [], // 通用广告
    '_cheapPackIsOpen': false, // 1元礼包。6元礼包
    '_cheapPackData': [], // 1元礼包。6元礼包
    'NotMergeCount':6,
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
 * 根据 ID 取 缓存数据中的球球对象
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
CACHE.getBallMergeId = function(ballId, isKillBall) {
    var mergeFromObj = CACHE.getBallById(ballId);
    var mergeFromObjIsAllPowerfulBall = gameData.BattleConst.allPowerful.includes(mergeFromObj.ballType); // 合并球球是否万能球球
    var mergeFromObjIsNotMerge = gameData.BattleConst.notMerge.includes(mergeFromObj.ballType); // 不升级球

    var mergeToObj = null;
    var ballList = CACHE.battle.self.ballList;

    // 不合并 - 七星球球
    if(mergeFromObj.star >= 7 ||mergeFromObjIsNotMerge||mergeFromObj.ballType === 40 ) {
        return false;
    }
    // 成长球球 非暗杀模式，还是会尝试抢救！32.成长 44.复制
    if(!isKillBall && [32, 44].includes(mergeFromObj.ballType)){
        var hasCopyBall = Object.values(ballList).filter( (ballItem) => {
            // 找出复制球球、生长球球 进行复制
            if(ballId !== ballItem.ballId
                && ballItem.ballType !== mergeFromObj.ballType
                && ballItem.star === mergeFromObj.star
                && [32, 44].includes(ballItem.ballType)) {
                return true;
            }
        });
        if(hasCopyBall.length > 0) {
            return hasCopyBall[0];
        }
    }
    // 暗杀抢救模式 且 复制球球，需要变更为 合并同类，挪坑才能防止掉星。
    if(isKillBall && mergeFromObj.ballType === 44) {
        mergeFromObjIsAllPowerfulBall = false;
    }
    var canMergeList = Object.values(ballList).filter((ballItem) => {
        var result = false,
            mergeToObjIsAllPowerfulBall = false;

        if(ballId !== ballItem.ballId) {
            // （万能球 或 相同球） 且 星星相同
            if(ballItem.star === mergeFromObj.star) {
                // 被合并球球是 万能合并球球
                mergeToObjIsAllPowerfulBall = gameData.BattleConst.allPowerful.includes(ballItem.ballType);
                // 暗杀模式 且 被合并球球是复制球球，忽略
                if(isKillBall && ballItem.ballType === 44) {
                    mergeToObjIsAllPowerfulBall = false;
                }
                if(mergeFromObj.ballType==44 && ballItem.ballType === 40){
                    return false
                }
                if(mergeFromObj.ballType==39 && ballItem.ballType === 40){
                    return false
                }
                // 非暗杀
                if(!isKillBall) {
                    // 生长球球，不相互合并
                    if(mergeFromObj.ballType === 32 && ballItem.ballType === 32) {
                        return false;
                    }
                    // 复制球球，不相互复制合并
                    if(mergeFromObj.ballType === 44 && ballItem.ballType === 44) {
                        return false;
                    }
                    
                }
                // 主球球 是万能球
                if(mergeFromObjIsAllPowerfulBall || mergeToObjIsAllPowerfulBall) {
                    result = true;
                }
                // 球球类型相同
                if(ballItem.ballType === mergeFromObj.ballType) {
                    result = true;
                }
            }
        }
        return result;
    });
    if(canMergeList.length > 0) {
        canMergeList.sort( (a, b) => {
            if (gameData.BattleConst.notMerge.includes(a.ballType)){
                return -1000;
            }
            if (gameData.BattleConst.notMerge.includes(b.ballType)){
                return 1000;
            }
            var aBallObj = gameData.getBallObj(a.ballType);
            var bBallObj = gameData.getBallObj(b.ballType);
            a.weight = gameData.BattleConst.featureWeight[ aBallObj.featureType ];
            b.weight = gameData.BattleConst.featureWeight[ bBallObj.featureType ];
            return a.weight - b.weight;
        });
        mergeToObj = canMergeList[0];
    }
    return mergeToObj;
};


CACHE.getUnMergeBallId = function(ballId) {
    var mergeFromObj = CACHE.getBallById(ballId);
    var mergeFromObjIsAllPowerfulBall = gameData.BattleConst.allPowerful.includes(mergeFromObj.ballType); // 合并球球是否万能球球
    var mergeToObj = null;
    var ballList = CACHE.battle.self.ballList;
    var isNotMerge = gameData.BattleConst.notMerge.includes(mergeFromObj.ballType); 
    var issummoner = mergeFromObj.ballType ===40;

    // 不合并 - 七星球球
    if(mergeFromObj.star >= 7) {
        return;
    }
    // 成长球球 非暗杀模式，还是会尝试抢救！32.成长 44.复制
    // 只处理UnMergeBallList 和召唤球 40召唤 notMerge 大于6个才合并
    var ballList = Object.values(ballList).filter((ballItem) =>{
        return gameData.BattleConst.notMerge.includes(ballItem.ballType);
       
    }   );
    var mergeNotMerge = false
    if (ballList.length>CACHE.NotMergeCount){
        mergeNotMerge = true

    }
    //不是召唤球也不在不可合成列表里
    if(!isNotMerge && !issummoner){
        return;
    }
    //不属于不可合成列表，并且不是召唤球
    if ( (!mergeNotMerge && isNotMerge)){
        return ;
    }


    var canMergeList = Object.values(ballList).filter((ballItem) => {
        result = false;
        if(ballId !== ballItem.ballId) {
            // （万能球 或 相同球） 且 星星相同
			if(ballList.length<4 && ballItem.star>=3 && ballItem.ballType==40){
				return false;
			}
            if(ballItem.star === mergeFromObj.star) {
                mergeToObjIsAllPowerfulBall = gameData.BattleConst.allPowerful.includes(ballItem.ballType);
               
                }
                if(mergeToObjIsAllPowerfulBall){
                    result = true;
                }
                if(ballItem.ballType === mergeFromObj.ballType) {
                    result = true;
                }

            }
        return result;
    })

    
    if(canMergeList.length > 0) {
        canMergeList.sort( (a, b) => {
            var aweight = a.ballType ===40? 10+a.star:a.star
            var bweight = b.ballType ===40? 10+b.star:b.star
           
            return aweight - bweight;
        });
        mergeToObj = canMergeList[0];
    }
	echo("to type:",mergeToObj.ballType,"from_type:",mergeFromObj.ballType)
    return mergeToObj;
};


// 排序球球列表 - 根据 球球星星
CACHE.getBallKeysSort = function() {
    var ballList = Object.values(CACHE.battle.self.ballList);
    ballList.sort((a, b) => {
        // 暗杀大师 优先升级低星球球
        if(CACHE.battle.bossTrailer == 105) {
            return a.star - b.star; // 排序：低到高 - 升序
        } else {
            return b.star - a.star; // 排序：高到低 - 降序
        }
    });
    return ballList.map( (ballItem) => ballItem.ballId); // 取球球实例 ID 数组
};

// 读取缓存还原数据
CACHE.readCache();

module.exports = CACHE;