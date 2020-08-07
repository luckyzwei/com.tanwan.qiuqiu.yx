var echo = require('../utils/logger');
var CACHE = require('../utils/cache');
var gameData = require('../utils/gameData');
var kvListToObj = require('../utils/kvListToObj');
/**
 *  -- 服务器
     server  -- 主服务器
     battle_server   -- 对战服务器
 * */
// 代码集
var supportList = {
    // 登录游戏成功
    'rpc_client_brpc_login_return': function() {
        //  rpc_client_brpc_login_return({\"result\":0,\"msg\":\"登录游戏成功\"})
        CACHE.battle.runTimeLeft = Date.now();
        CACHE.battle.bossTrailer = 0;
    },
    // 战斗流程控制开始
    'rpc_client_brpc_proto': function(content) {
        // rpc_client_brpc_proto(\"{\\\"param\\\":{\\\"round\\\":2,\\\"win\\\":1,\\\"seed\\\":0,\\\"record\\\":[]},\\\"action\\\":\\\"battleOver\\\"}\")
        var json = JSON.parse(content);
        /*CTRL_ACTION = {
            ROUND_READY         = "roundReady",
            ROUND_BEGIN         = "roundBegin",
            BOSS_READY          = "bossReady",
            BOSS_BEGIN          = "bossBegin",
            ROUND_OVER          = "roundOver",
            BATTLE_OVER         = "battleOver",
            CONCEDE             = "concede",
            EMOJI               = "emoji",
        }*/
        var action = json.action;
        var param = json.param;
        /*{
            "round": 2,
            "win": 1,
            "seed": 0,
            "record": []
        }*/
        echo("[战斗流程] action:", action);
        if(action === 'battleOver') {
            CACHE.battle.runTimeLeft = -1;
            CACHE.battle.battleType = 0;
            // 回到大厅界面
            return 'local BattlePvpResultPopLayer = require("ui.battle_scene.battle_pvp_result_pop_layer");BattlePvpResultPopLayer:onOKClick();';
        }
    },
    // 客户端战斗帧 - 开始
    'rpc_client_fight_frame_begin': function(frame, gameTime) {
        CACHE.battle.frameBegin = {
            'frame': frame,
            'serverTime': frame * 100,
            'gameTime': gameTime
        };
    },
    // 客户端战斗帧 - 结束
    'rpc_client_fight_frame_end': function() {
        var result = "", i, key, keyList, valueList, _minGrade, allPowenfulBallList,
            playInfo = CACHE.battle.self,
            ballList = playInfo.ballList;
        // 每次处理间隔时间，目前默认配置 500 毫秒
        if(CACHE.battle.runTimeLeft === -1 || Date.now() - CACHE.battle.runTimeLeft < CACHE.battle.runTimeInterval) {
            return;
        }
        CACHE.battle.runTimeLeft = Date.now();
        // 抢救球球过后 3s 时间，再造球球，避免出球太快被暗杀、boss击杀
        if(CACHE.battle.killBallMergeTime > 0 && CACHE.battle.runTimeLeft - CACHE.battle.killBallMergeTime < 3000) {
            return;
        }
        // 有游戏节点
        if(playInfo.cfg) {
            // 取升级球球等级需要 Sp点数
            var getGradeSp = function(minGrade) {
                if(minGrade) {
                    var upgradeSp = gameData.BattleConst.DragonBallUpgradeCost[minGrade.grade]; // 根据等级取升级所需 SP
                    return upgradeSp;
                }
            };
            // 取等级最低球球，max 球球可能返回null
            var getMinGrade = function() {
                var minGrade = null;
                // keyList = Object.keys(playInfo.ballsGrade);
                valueList = Object.values(playInfo.ballsGrade).filter( (item) => {
                    // 非满级 且 不在不升级的纯辅助球球中
                    return item.grade <= 4 && !gameData.BattleConst.notUpgrade.includes(item.dbType);
                });
                // 有需要升级 Lv 的球球
                if(valueList.length > 0) {
                    // 球球属性归类：1.攻、2.控、3.辅、4.召
                    keyList = [0, 1, 3, 4, 2]; // 给球球属性归类建立权重
                    // 目前想法是按照作用大小排序：1.攻、4.召、2.控、3.辅
                    valueList.sort( (a, b) => {
                        if(a.grade === b.grade) {
                            var aBallObj = gameData.getBallObj(a.dbType);
                            var bBallObj = gameData.getBallObj(b.dbType);
                            a.weight = keyList[aBallObj.featureType];
                            b.weight = keyList[bBallObj.featureType];
                            return a.weight - b.weight;
                        } else {
                            return a.grade - b.grade;
                        }
                    });
                } else {
                    // 没有需要升级 Lv 的球球，可以考虑升级辅助球球了。
                    valueList = Object.values(playInfo.ballsGrade).filter( (item) => {
                        var gradeSp = getGradeSp(item);
                        // 非满级 且 不在不升级的纯辅助球球中
                        return item.grade <= 4 && playInfo.cfg.sp >= gradeSp;
                    }).sort( (a, b) => {
                        return a.grade - b.grade;
                    });
                }
                if(valueList.length > 0) {
                    minGrade = valueList[0];
                }
                // 遍历等级最小的、依次升级
                /*for (i=0; i < keyList.length ; i++) {
                    key = keyList[i];
                    var item = playInfo.ballsGrade[key];
                    // 判断不是满级球球Lv.Max 和 不升级的辅助球球
                    if(item.grade <= 4 && !gameData.BattleConst.notUpgrade.includes(item.dbType)) {
                        if(minGrade) {
                            // 等级低的
                            if(item.grade < minGrade.grade) {
                                minGrade = item; // 取得等级低的 龙珠
                            }
                        } else {
                            // 第一个
                            minGrade = item;
                        }
                    }
                }*/
                return minGrade;
            };
            _minGrade = getMinGrade();
            // 升级球球等级 ——> Up Lv.*
            var upGrade = function() {
                if(_minGrade) {
                    var upgradeSp = getGradeSp(_minGrade);
                    if(upgradeSp && CACHE.battle.self.cfg.sp >= upgradeSp) {
                        echo('[升级球球] ' + _minGrade.name + ' 消耗SP:', upgradeSp, "类型:", _minGrade.dbType);
                        return 'battle_server.rpc_server_fight_ball_upgrade(' + _minGrade.dbType + ')'; // 升级球球
                    }
                }
            };
            // 合并球球
            var mergeBall = function(_keyList) {
                var evalStr = "";
                for (i=0; i < _keyList.length ; i++) { // 循环所有球球，寻找可合并的
                    key = _keyList[i];
                    var ballItem = CACHE.getBallMergeId(key);
                    // 存在可以合并的球球
                    if(ballItem) {
                        evalStr += 'battle_server.rpc_server_fight_ball_merge(' + key + ',' + ballItem.ballId + ');';
                        echo('[球球合并] 合并：' + key + ',' + ballItem.ballId);
                        evalStr += 'battle_server.rpc_server_fight_ball_create()'; // 创建球球
                        return evalStr;
                    }
                    /*var ballItem = ballList[key];
                    if(ballItem.ballType === 32 || ballItem.star >= 7) { // 成长球球/七星球球 不合并
                        continue;
                    }
                    for (var j=i+1; j < keyList.length ;j++) {
                        key = keyList[j];
                        var compareBall = ballList[key];
                        var canMerge = ballItem.ballType === compareBall.ballType;
                        if(!canMerge) {
                            canMerge = [
                                20, // 合体球球
                                39, // 升星球球
                                44, // 复制球球
                            ].includes(ballItem.ballType);
                        }
                        if(canMerge && ballItem.star === compareBall.star) {
                            evalStr += 'battle_server.rpc_server_fight_ball_merge(' + ballItem.ballId + ',' + compareBall.ballId + ');';
                            echo('[球球合并] 合并：' + ballItem.ballId + ',' + compareBall.ballId);
                            evalStr += 'battle_server.rpc_server_fight_ball_create()'; // 创建球球
                            return evalStr;
                        }
                    }*/
                }
            };
            // 取棋盘是否存在万能球球
            var getAllPowenfulBallList = function() {
                return Object.values(ballList).filter( (ballItem) => {
                    // 棋盘包含万能球球
                    return gameData.BattleConst.allPowerful.includes(ballItem.ballType);
                });
            };
            allPowenfulBallList = getAllPowenfulBallList();
            // 判断存在万能球，优先合并
            if(allPowenfulBallList.length > 0) {
                keyList = allPowenfulBallList.map((pBall)=> {
                    return pBall.ballId;
                });
                result = mergeBall(keyList);
                if(result) {
                    return result;
                }
            }
            // 判断球球 Lv
            if(_minGrade) { // 有等级最低球球
                keyList = Object.keys(CACHE.battle.self.ballList);
                // 棋盘满了 - 优先提升整体 Lv
                if(keyList.length >= playInfo.ballMaxNum) {
                    // 200+ SP 升级 Lv.3
                    if(playInfo.cfg.cost >= 150 && _minGrade.grade < 2) {
                        // 升级球球
                        return upGrade();
                    } else if(playInfo.cfg.cost >= 200 && _minGrade.grade < 3) {
                        // 升级球球
                        return upGrade();
                    } else if(playInfo.cfg.cost >= 300 && _minGrade.grade < 4) {
                        // 升级球球
                        return upGrade();
                    } else if(playInfo.cfg.cost >= 350 && _minGrade.grade < 5) {
                        // 升级球球
                        return upGrade();
                    }
                }
            }
            // SP 大于创造球球
            if(playInfo.cfg.sp >= playInfo.cfg.cost) {
                // keyList = Object.keys(ballList);
                keyList = CACHE.getBallKeysSort(); // 排序
                // 总球数少于 15 个可以创建球球
                if(keyList.length < playInfo.ballMaxNum) {
                    return 'battle_server.rpc_server_fight_ball_create()'; // 创建球球
                } else {
                    // 球球满了
                    result = mergeBall(keyList);
                    if(result) {
                        return result;
                    } else {
                        return upGrade(); // 升级
                    }
                }
            } else {
                // 判断天胡 开局
                keyList = Object.keys(ballList);
                if(keyList.length === 4) { // 开局四抽
                    var tempBallType = {};
                    for(i=0; i < 4 ;i++) {
                        key = keyList[i++];
                        tempBallType[ballList[key].ballType] = true;
                    }
                    // 合并后的 球球类型 只有一种
                    keyList = Object.keys(tempBallType);
                    if(keyList.length === 1) {
                        // 判断 球球在 天胡自动合并配置中
                        if(gameData.BattleConst.startToMerge.includes(keyList[0])) {
                            return mergeBall(keyList); // 合并球球
                        }
                    }
                }
                // 升级球球
                return upGrade();
            }
        }
    },
    // 游戏结束
    'rpc_client_fight_end': function() {
        // rpc_client_fight_end()
        CACHE.battle.runTimeLeft = -1;
        CACHE.battle.battleType = 0;
        // 回到大厅界面
        return 'local BattlePvpResultPopLayer = require("ui.battle_scene.battle_pvp_result_pop_layer");BattlePvpResultPopLayer:onOKClick();';
    },
    // 在轮次开始之间播放boss预告
    'rpc_client_fight_boss_trailer': function (bossType) {
        /*BattleConst.BossType = {
            Knight = 101,	-- 骑士（转王）
            Magician = 102,	-- 魔术师
            Imprison = 103,	-- 禁锢
            Summoner = 104,	-- 召唤师
            Assassinator = 105,	-- 暗杀大师
        }*/
        CACHE.battle.bossTrailer = bossType;
    },
    // 轮次开始
    'rpc_client_fight_round_begin': function (time, round) {
        // rpc_client_fight_round_begin(120,1)
        // time = BOSS 来临倒计时？
        CACHE.battle.round = round; // 战斗第几回合
        echo('开始第' + round + '回合');
    },
    // 轮次结束
    'rpc_client_fight_round_end': function () {

    },
    /**
     * 战斗球攻击
     * @param ballId
     * @param attackInfo
     *  {
            "targetIds": [33],      攻击目标
            "bulletSpeed": 2000,    子弹速度
            "defaultDamage": 20,    攻击伤害
            "interval": 500         攻击间隔
        }
     */
    'rpc_client_fight_ball_attack': function(ballId, attackInfo) {
        // rpc_client_fight_ball_attack(25,{\"targetIds\":[33],\"bulletSpeed\":2000,\"defaultDamage\":20,\"interval\":500})"]
    },
    /**
     * 怪物受到伤害
     * @param hurtList
     * [{
            "damageList": [{
                "damageType": 0,    // 0:子弹 1:火 2:电 3:毒
                "isCrit": 0,
                "attackStar": 0,
                "damage": [0, 20],
                "extraList": [],
                "attackerId": 45
            }],
            "isFatal": 0,
            "monsterId": 33
        }]
     */
    'rpc_client_fight_monster_hurt': function(hurtList) {
        // rpc_client_fight_monster_hurt([{\"damageList\":[{\"damageType\":0,\"isCrit\":0,\"attackStar\":0,\"damage\":[0,20],\"extraList\":[],\"attackerId\":30},{\"damageType\":0,\"isCrit\":0,\"attackStar\":0,\"damage\":[0,20],\"extraList\":[],\"attackerId\":30}],\"isFatal\":0,\"monsterId\":33}])

    },
    // 同步怪物信息
    'rpc_client_fight_monster_sync_info': function (monsterId, monsterInfo) {
        // hp - 血
        // distance - 距离
        // moveSpeed - 移动速度
        // rpc_client_fight_monster_sync_info(69,{\"infoList\":[{\"k\":\"distance\",\"v\":0}]})
        monsterInfo.infoList = kvListToObj(monsterInfo.infoList);
    },
    /**
     * hp
     * @param side - 敌方、我方
     * @param hp
     */
    'rpc_client_fight_player_hp': function (side, hp) {
        if(CACHE.battle.selfIndex === side) {
            // 更新数据
            if(CACHE.battle.self) {
                CACHE.battle.self.cfg.hp = hp;
            }
        }
    },
    /**
     * sp
     * @param side
     * @param curSp
     * @param nextBallSp
     */
    'rpc_client_fight_player_sp': function (side, curSp, nextBallSp) {
        // 确认玩家
        if(CACHE.battle.selfIndex === side) { // 玩家自己
            // 更新数据
            if(CACHE.battle.self) {
                CACHE.battle.self.cfg.sp = curSp;
                CACHE.battle.self.cfg.cost = nextBallSp;
            }
            // 经费足够升级
            // if (curSp >= nextBallSp) {
                // rpc_client_fight_frame_end 方法中实现
                // return 'battle_server.rpc_server_fight_ball_create()'; // 创建球球
            // }
        }
    },
    // 创建怪物
    'rpc_client_fight_monster_create': function(monsterId, monsterType, monsterBaseInfo) {
        // rpc_client_fight_monster_create(48,1,{\"infoEx\":[],\"moveSpeed\":100,\"hp\":[0,300],\"side\":2,\"distance\":0})"]
        if(CACHE.battle.selfIndex === monsterBaseInfo.side) {
            var monster = gameData.BattleConst.monster[monsterType];
            // 只输出 BOSS 信息，boss ID 区间 101 ~ 105
            if(monsterType >= 101 && monsterType <= 105) {
                echo('BOSS', monster.name, '登场，ID:', monsterId,'描述：', monster.desc);
            }
        }
    },
    // 销毁怪物
    'rpc_client_fight_monster_destroy': function(monsterId) {

    },
    // 怪物状态 - 添加
    'rpc_client_fight_monster_status_add': function (monsterId, statusInfo) {
        // type 类型 参考 gameData.BattleConst.StatusType
        // rpc_client_fight_monster_status_add(22,{"casterId":20,"lv":1,"extraInfo":[],"id":24,"type":"imprison"})
    },
    // 怪物状态 - 升级
    'rpc_client_fight_monster_status_update': function (monsterId, statusInfo) {
        // rpc_client_fight_monster_status_update(82,{"casterId":20,"lv":1,"extraInfo":[],"id":89})
    },
    // 怪物状态 - 删除
    'rpc_client_fight_monster_status_remove': function (monsterId, statusInfo) {

    },
    // 创建球球
    'rpc_client_fight_ball_create': function (ballId, ballType, ballInfo) {
        // rpc_client_fight_ball_create(13,38,{"pos":14,"side":1,"star":1})
        // rpc_client_fight_ball_create(1237,21,{\"pos\":8,\"side\":1,\"star\":2})
        // 确认玩家
        if(ballInfo.side ===  CACHE.battle.selfIndex) {
            // 玩家自己
            var pos = ballInfo.pos; // 服务器是0，js 也是0
            var ballData = {
                ballId: ballId, // 球球实例ID
                ballType: ballType, // 球球ID
                ballName: gameData.getBallObj(ballType).name, // 球球名字
                pos: pos, // 棋盘坐标
                star: ballInfo.star // 球球星级
            };
            CACHE.battle.self.ballList[ballId] = ballData;
            // console.log('[我方] 创造球球：', ballData.ballName, 'ID:', ballData.ballId, 'STAR:', ballData.star);
        }
    },
    // 销毁球球
    'rpc_client_fight_ball_destroy': function(ballId) {
        var ballItem = CACHE.battle.self.ballList[ballId];
        if(ballItem) { // 存在 球球的，对比ID
            // console.log('[我方]', '删除球球:', ballItem.ballName, 'ID:', ballItem.ballId, 'STAR:', ballItem.star);
            delete CACHE.battle.self.ballList[ballId];
        }
    },
    // 球球状态 - 添加
    'rpc_client_fight_ball_status_add': function(ballId, statusInfo) {
        // type 类型 参考 gameData.BattleConst.StatusType
        // "ball_kill",		-- 暗杀龙珠目标
        // "boss_kill",		-- boss摧毁目标
        // rpc_client_fight_ball_status_add(182,{\"casterId\":103,\"lv\":1,\"extraInfo\":[{\"k\":\"fromPos\",\"v\":13}],\"id\":206,\"type\":\"ball_kill\"})
        // rpc_client_fight_ball_status_add(2456,{\"casterId\":2467,\"lv\":1,\"extraInfo\":[{\"k\":\"fromPos\",\"v\":11}],\"id\":2470,\"type\":\"ball_kill\"})
        /*{
            "casterId": 77,
            "lv": 1,
            "extraInfo": [{
                "k": "fromPos",
                "v": 8
            }],
            "id": 113,
            "type": "ball_kill"
        }*/
        var result = "", mergeBall;
        var playInfo = CACHE.battle.self;
        var ballList = playInfo.ballList;
        var ballItem = ballList[ballId];
        // 确认玩家 - 如果在我方棋盘找到 该球球ID 就说明 技能目标是我方球球
        if(ballItem) {
            // 判断 暗杀龙珠目标 且 非合作模式
            if(statusInfo.type === 'ball_kill' && CACHE.battle.battleType != 2) {
                // rpc_server_fight_ball_merge(from, to) 合并
                mergeBall = CACHE.getBallMergeId(ballItem.ballId, true);
                if(mergeBall) {
                    result += 'battle_server.rpc_server_fight_ball_merge(' + ballId + ',' + mergeBall.ballId + ');';
                    echo('[球球合并] 暗杀球球目标抢救，合并：' + ballId + ',' + mergeBall.ballId);
                    CACHE.battle.killBallMergeTime = Date.now();
                }
            }
            // 判断 boss摧毁目标
            if(statusInfo.type === 'boss_kill') {
                // rpc_server_fight_ball_merge(from, to) 合并
                mergeBall = CACHE.getBallMergeId(ballItem.ballId, true);
                if(mergeBall) {
                    result += 'battle_server.rpc_server_fight_ball_merge(' + ballId + ',' + mergeBall.ballId + ');';
                    echo('[球球合并] boss摧毁目标抢救，合并：' + ballId + ',' + mergeBall.ballId);
                    CACHE.battle.killBallMergeTime = Date.now();
                }
            }
        }
        return result;
    },
    // 球球状态 - 升级
    'rpc_client_fight_ball_status_update': function (ballId, statusInfo) {

    },
    // 球球状态 - 删除
    'rpc_client_fight_ball_status_remove': function (ballId, statusId) {
        // rpc_client_fight_ball_status_remove(30,152)
    },
    // 战斗球 Lv 升级
    'rpc_client_fight_ball_upgrade': function(side, ballType, ballGrade) {
        // rpc_client_fight_ball_upgrade(2,24,3)
        // 判断玩家 - 自己
        if(side === CACHE.battle.selfIndex) {
            CACHE.battle.self.ballsGrade[ballType].grade = ballGrade;
        }
    },
    // 路线道具 - 添加
    'rpc_client_fight_creature_add': function(creatureId, creatureInfo) {

    },
    // 路线道具 - 删除
    'rpc_client_fight_creature_remove': function(creatureId) {

    },
    // 发送表情包
    'rpc_client_fight_emoji': function(side, emojiId) {
        if(side !== CACHE.battle.selfIndex) {
            return 'battle_server.rpc_server_fight_emoji(' + emojiId + ');';
        }
    },
    // 暂停
    'rpc_client_fight_pause': function () {},
    // 继续
    'rpc_client_fight_resume': function () {},
    // 战斗怪物刷新
    'rpc_client_fight_monster_refresh': function(monsterList) {
        // rpc_client_fight_monster_refresh([{\"distance\":20,\"id\":654},{\"distance\":20,\"id\":653}])
    },
    // 提示信息1
    'rpc_client_tell_me': function(color, str) {
        // rpc_client_tell_me(6,\"[\\\"更新成功\\\"]\")
        echo('[提示信息]', str);
    },
};
// 战斗：服务器 -> 客户端
function BS_C(handleStr) {
    var result, evalStr;
    if(new RegExp(Object.keys(supportList).join("|")).test(handleStr)) {
        CACHE.DEBUG && echo.log('[记录日志] [BS_C] ' + handleStr);
        // 处理方法
        try{
            evalStr = "supportList." + handleStr;
            //echo("[Eval]", evalStr);
            result = eval(evalStr);
            if(result) {
                // echo('[BS->C 处理代码]', handleStr, "\n[处理结果]", result);
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

module.exports = BS_C;