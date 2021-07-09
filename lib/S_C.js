var echo = require('../utils/logger');
var CACHE = require('../utils/cache');
var gameData = require('../utils/gameData');
/**
 * -- 服务器
    server  -- 主服务器
    battle_server   -- 对战服务器
 * -- 广告类型
     AdvertData.shopAdvertType = 1  -- 商店
     AdvertData.pvpAdvertType = 2   -- 竞技
     AdvertData.cooperateAdvertType = 3  -- 合作
     AdvertData.getRewardAdvertType = 4  -- 支援宝箱
     AdvertData.missionAdvertType = 5  -- 任务
     AdvertData.legionContributeAdvertType = 6  -- 球队捐献广告
 * */
// 代码集
var supportList = {
    // 登录结果返回 - 可用于初始化参数
    'rpc_client_login_return': function (ret) {
        var result = '';
        // rpc_client_login_return({\"result\":0,\"msg\":\"登录游戏成功\"})
        CACHE.battle.runTimeLeft = -1;
        CACHE.battle.battleType = 0;
        result += 'server.rpc_server_get_share_reward();'; // [失效] 分享，每日首次 可以得到 50 钻石
        result += 'server.rpc_server_video_ads_click_watch(5,0);'; // 任务视频
        result += 'server.rpc_server_video_ads_click_watch(5,0);'; // 任务视频
        result += 'server.rpc_server_video_ads_click_watch(5,0);'; // 任务视频
        result += 'server.rpc_server_daily_reward_get_reward(1);'; // 任务视频
        result += 'server.rpc_server_daily_reward_get_reward(2);'; // 任务视频
        result += 'server.rpc_server_daily_reward_get_reward(3);'; // 任务视频
        return result;
    },
    /**
     * 开始游戏
     * @param battleType - 1.正常排位 2.合作模式 3.竞技场
     * @param code
     */
    'rpc_client_start_game': function (battleType, code) {
        if(code == 0) {
            // 开始游戏 ？
            CACHE.battle.battleType = battleType;
            echo('[开始游戏] battleType:', battleType, ', code:', code);
        }
    },
    // 设置编码集
    'rpc_client_version_return': function(state, encoding) {
        // rpc_client_version_return(0,\"UTF-8\")
    },
    // 邮箱列表
    'rpc_client_mail_list': function(mailList, unreadNum) {
        // rpc_client_mail_list([{"from":21,"isPicked":1,"sender":{"honor":0,"legion_name":"","uid":0,"legion_icon":"","name":"","legion_id":""},"reward":"{\"DBRAN2\":30}","type":4,"time":134889,"message":{"type":0,"msg":"游戏已维护完毕，特奉上礼包一份，以表达各位球宝耐心与理解的感谢。"},"glbkey":"125700000000yE"},{"from":21,"isPicked":1,"sender":{"honor":0,"legion_name":"","uid":0,"legion_icon":"","name":"","legion_id":""},"reward":"{\"DBRAN1\":30}","type":4,"time":134889,"message":{"type":0,"msg":"游戏已维护完毕，特奉上礼包一份，以表达各位球宝耐心与理解的感谢。"},"glbkey":"125700000000yD"},{"from":21,"isPicked":1,"sender":{"honor":0,"legion_name":"","uid":0,"legion_icon":"","name":"","legion_id":""},"reward":"{\"DBRAN1\":20}","type":4,"time":76301,"message":{"type":0,"msg":"游戏将于7月31日早上9点进行维护更新，给各位球宝造成不便敬请谅解。"},"glbkey":"12570000000964"}],26)
        CACHE.mailList = mailList;
    },
    // 公告
    'rpc_client_gonggao_board': function(list, joinGroupInfo) {
        // rpc_client_mail_list([{"from":21,"isPicked":1,"sender":{"honor":0,"legion_name":"","uid":0,"legion_icon":"","name":"","legion_id":""},"reward":"{\"DBRAN2\":30}","type":4,"time":134889,\"message":{"type":0,"msg":"游戏已维护完毕，特奉上礼包一份，以表达各位球宝耐心与理解的感谢。"},"glbkey":"125700000000yE"},{"from":21,"isPicked":1,"sender":{"honor":0,"legion_name":"","uid":0,"legion_icon":"","name":"",\"legion_id":""},"reward":"{\"DBRAN1\":30}","type":4,"time":134889,"message":{"type":0,"msg":"游戏已维护完毕，特奉上礼包一份，以表达各位球宝耐心与理解的感谢。"},"glbkey":"125700000000yD"},{"from":21,"isPicked":1,"sender\":{"honor":0,"legion_name":"","uid":0,"legion_icon":"","name":"","legion_id":""},"reward":"{\"DBRAN1\":20}","type":4,"time":76301,"message":{"type":0,"msg":"游戏将于7月31日早上9点进行维护更新，给各位球宝造成不便敬请谅解。"},"glbkey":"12570000000964"}],26)"][HandleMsg] [信息] ["[S->C] rpc_client_gonggao_board([{"version":"2020.6.28","content":"各位球迷大家好：\n第一期球球暑假活动开始啦！\n【活动时间】7月18日-7月24日\n【活动内容】\n1、关注微信公众号【球球竞技手游】，点击下方菜单栏【每日签到】，即可进入【每日签到】活动页面。\n2、点击游戏内悬浮球进入【游戏圈】，进入球球竞技圈子，根据要求发布你的最强球球组合，点赞评论数最高的20位玩家，将有机会获得神秘球球宝箱！\n球球运营组\n\n》》》 联系方式《《《《\n官方QQ群2：975620610\n\nQQ公众号：4000812557\n\n微信公众号：球球竞技手游\n\n官网信息：http://m.tanwan.com/qqjj\n\n温馨提示：提供bug和建议更有机会获得惊喜大礼包\n\n","title":"开服公告","id":5}],"{\"groupKey\":\"RrhdQqU6fvnnPSEpxPYyvFxGZZ1oxa2p\",\"groupNum\":\"975620610\"}")"]
        CACHE.gonggaoBoard.list = list;
        CACHE.gonggaoBoard.joinGroupInfo = joinGroupInfo;
    },
    // 荣誉令牌信息
    'rpc_client_honor_token_info': function(season, monEnd, plan, tokenType, rwd, vipRwd, seasonMaxHonor) {
        CACHE.honorTokenInfo = {
            season, monEnd, plan, tokenType, rwd, vipRwd, seasonMaxHonor
        };
    },
    // 我的球队
    'rpc_client_my_legion_status': function(legionId, legionName, position, flag, lv) {
        Object.assign(CACHE.LegionData.myLegionInfo, {
            legionId, legionName, position, flag, lv
        });
    },
    // 我的军团响应
    'rpc_client_my_legion_response': function(info) {
        Object.assign(CACHE.LegionData.myLegionInfo, info);
    },
    // 军团贡献
    'rpc_client_contribute_legion_times': function(contributeCount, contributeCostCount) {
        Object.assign(CACHE.LegionData.myLegionInfo, {contributeCount, contributeCostCount});
    },
    // 军团成员
    'rpc_client_legion_member': function(legionId, members) {
        CACHE.LegionData.membersInfo = members;
        CACHE.LegionData.myLegionInfo.currentMember = members.length;
    },
    // 聊天记录
    'rpc_client_chat_list': function(list) {
        CACHE.chatList = list;
    },
    // 聊天记录
    'rpc_client_chat': function(list) {
        
    },
    // 获得行动信息
    'rpc_client_legion_win_act_info': function(goalInfo) {
        CACHE.LegionGoalData.goalInfo = goalInfo
    },
    // 提示信息2
    'rpc_client_message_box': function(mType, jsonStr) {
        // rpc_client_message_box(0,\"[\\\"捐献成功\\\"]\")
    },
    // 好友列表
    'rpc_client_friend_list': function(friends) {
        CACHE.friendList = friends;
    },
    // 月卡
    'rpc_client_month_card_info': function (remainDay) {
        CACHE._monthCardRemainDay = remainDay;
    },
    // 战斗合作信息
    'rpc_client_battle_cooperate_info': function (vipType, times, ballNum, refreshTime, advTimes) {
        CACHE._curNum = ballNum; // 当前龙珠数
        CACHE._vipType = vipType; // 0是免费。1是vip
        CACHE._times = times; // 当前刷新次数
        CACHE._curTime = refreshTime; // 剩余刷新时间
    },
    // 竞技场数据
    'rpc_client_battle_arena_info': function (state, curBalls, win, lose, rwdStatus) {
        // rpc_client_battle_arena_info(0,[],0,0,[])
        CACHE.arenaData.curState = state;
        CACHE.arenaData.curBalls = curBalls;
        CACHE.arenaData.win = win;
        CACHE.arenaData.lose = lose;
        CACHE.arenaData.rwdStatus = rwdStatus;
    },
    // 通用广告
    'rpc_client_common_ads': function(adsInfo) {
        // rpc_client_common_ads([{\"type\":1,\"extra\":\"\"},{\"type\":3,\"extra\":\"\"}])
        CACHE._noticeList = adsInfo
    },
    // 视频 buff？
    'rpc_client_video_ads_has_buff': function (status) {
        CACHE.AdvertData.hasVideoAdsBuff = (1 == status);
    },
    // 更新所有任务
    'rpc_client_mission_list': function (missions, leftCnt) {
        // rpc_client_mission_list([{\"state\":2,\"progress\":1,\"id\":\"mr10004\"},{\"state\":4,\"progress\":50,\"id\":\"mr10011\"},{\"state\":4,\"progress\":1,\"id\":\"xd10001\"},{\"state\":4,\"progress\":26,\"id\":\"mr10002\"}],0)

    },
    // 限时折扣商店
    'rpc_client_market_limit_discount_info': function (data) {
        // rpc_client_market_limit_discount_info([{\"k\":12,\"v\":0,\"time\":11274,\"type\":0}])
    },
    // 1元礼包。6元礼包
    'rpc_client_cheap_pack_info': function (buyInfo, isOpen) {
        // rpc_client_cheap_pack_info([1,2],0)
        CACHE._cheapPackIsOpen = (1 == isOpen);
        CACHE._cheapPackData = buyInfo;
    },
    // 每日奖励信息
    'rpc_client_daily_reward_info': function(data) {
        // rpc_client_daily_reward_info([3,2,1])
        var result = "";
        // 每日奖励 1/2/3
        if(!data.includes(1)) {
            echo('[任务] 点击每日任务1');
            result += "server.rpc_server_daily_reward_get_reward(1);";
        }
        if(!data.includes(2)) {
            echo('[任务] 点击每日任务2');
            result += "server.rpc_server_daily_reward_get_reward(2);";
        }
        if(!data.includes(3)) {
            echo('[任务] 点击每日任务3');
            result += "server.rpc_server_daily_reward_get_reward(3);";
        }
        if(data.includes(4)) {
            echo('[宝箱] 点击支援宝箱');
            // 点击广告
            return 'server.rpc_server_video_ads_click_watch(' + CACHE.AdvertData.missionAdvertType + ',0)';
        }
        return result;
    },
    // 对局结果 - 加减经验
    'rpc_client_battle_result_data': function (scoreDelta, winCombo, advFlag, winExp, loseExp) {
        // rpc_client_battle_result_data(34,0,1,10,-8)
    },
    // 战斗信息
    'rpc_client_battle_info': function (serverInfo, gameParams, selfIndex, playerInfoList) {
        CACHE.clearPlay();
        // rpc_client_battle_info({"domain":"fightd1-dt.gzyueyou.cn","roomId":19,"randomSeed":0,"ip":"fightd1-dt.gzyueyou.cn","port":13050},{"logicFPS":50,"oneRoundTime":120,"keyFrameInterval":5},1,[{"cfg":{"critChance":100,"cost":10,"sp":100,"hp":3,"critDamage":4290,"costDelta":10},"baseInfo":{"icon":0,"grade":4,"sex":0,"honor":1137,"uid":1465967,"vserverId":0,"lose":646,"iconFrame":0,"name":"呵呵","win":475},"balls":[{"dbType":2,"lv":11},{"dbType":4,"lv":11},{"dbType":31,"lv":7},{"dbType":21,"lv":11},{"dbType":32,"lv":7}],"skinId":0},{"cfg":{"critChance":100,"cost":10,"sp":100,"hp":3,"critDamage":3630,"costDelta":10},"baseInfo":{"icon":0,"grade":3,"sex":0,"honor":1207,"uid":1051886,"vserverId":0,"lose":291,"iconFrame":0,"name":"泡泡球","win":258},"balls":[{"dbType":13,"lv":10},{"dbType":35,"lv":7},{"dbType":38,"lv":7},{"dbType":42,"lv":7},{"dbType":18,"lv":10}],"skinId":0}])
        /*{
            "domain": "fightd1-dt.gzyueyou.cn",
            "roomId": 19,
            "randomSeed": 0,
            "ip": "fightd1-dt.gzyueyou.cn",
            "port": 13050
        }*/
        CACHE.battle.serverInfo = serverInfo;
        /*{
            "logicFPS": 50,
            "oneRoundTime": 120,
            "keyFrameInterval": 5
        }*/
        CACHE.battle.gameParams = gameParams;
        // 当前玩家是哪一个  服务器返回的是 lua数组下标 1 开始
        CACHE.battle.selfIndex = selfIndex;
        /*{
            "cfg":{"critChance":100,"cost":10,"sp":100,"hp":3,"critDamage":4290,"costDelta":10},
            "baseInfo":{"icon":0,"grade":4,"sex":0,"honor":1137,"uid":1465967,"vserverId":0,"lose":646,"iconFrame":0,"name":"呵呵","win":475},
            "balls":[{"dbType":2,"lv":11},{"dbType":4,"lv":11},{"dbType":31,"lv":7},{"dbType":21,"lv":11},{"dbType":32,"lv":7}],
            "skinId":0
        }*/
        Object.assign(CACHE.battle.self, playerInfoList[selfIndex - 1]);
        // 建立我方 balls obj
        CACHE.battle.self.ballsGrade = {};
        CACHE.battle.self.balls.forEach((item) => {
            CACHE.battle.self.ballsGrade[item.dbType] = {
                dbType: item.dbType, // 球球类型
                name: gameData.getBallObj(item.dbType).name, // 球球名字
                grade: item.grade || 1, // 游戏等级 Lv.1 - Lv.Max
            };
        });
        // 玩家信息
        CACHE.battle.playerInfoList = playerInfoList;
    },
    /**
     * 可以看广告
     * @param {number} type - AdvertData
     * @param {number} isCan - 0.不能看、1.可以看
     */
    'rpc_client_video_ads_can_watch': function(adType, states) {
        // echo('[ECHO]', 'rpc_client_video_ads_can_watch', JSON.stringify({adType, states}));
        var canWatch = (states === 1),
            advertItem, leftTime;
        CACHE.ads_can['ads_can_' + adType] = canWatch;
        // 6.球队捐献广告
        //if(adType === CACHE.AdvertData.legionContributeAdvertType && canWatch) {
       //     echo('[广告] 点击球队捐献广告');
       //     // 点击广告
       //     return 'server.rpc_server_video_ads_click_watch(' + adType + ',0)';
       // }
        // 4.支援宝箱
        if(adType === CACHE.AdvertData.getRewardAdvertType && canWatch) {
            echo('[宝箱] 点击支援宝箱');
            // 点击广告
            return 'server.rpc_server_video_ads_click_watch(' + adType + ',0)';
        }
        // 3.合作模式 - 广告 (代码参考 Lua：src/module/pto_data/advert_data.luac)
        if(adType === CACHE.AdvertData.cooperateAdvertType) {
            if(0 === states) {
                CACHE.AdvertData.cooperateAdvertLimit = true; // 广告限制
            } else {
                CACHE.AdvertData.cooperateAdvertLimit = false;
                if(CACHE._times <= 0) {
                    echo('[广告] 点击合作模式广告');
                    // 点击广告
                    return 'server.rpc_server_video_ads_click_watch(' + adType + ',0)';
                }
            }
        }
        // 2.竞技 buff
        if(adType === CACHE.AdvertData.pvpAdvertType && !CACHE.AdvertData.hasVideoAdsBuff) {
            advertItem = CACHE._advertList[adType] || {};
            leftTime = advertItem.leftTime - Date.now();
            if(leftTime <= 0) {
                echo('[广告] 点击竞技BUFF广告');
                // 点击广告
                return 'server.rpc_server_video_ads_click_watch(' + adType + ',0)';
            }
        }
        // 1.商店广告
        if(adType === CACHE.AdvertData.shopAdvertType) {
            if(0 === states) {
                CACHE.AdvertData.shopAdvertLimit = true; // 广告限制
            } else {
                CACHE.AdvertData.shopAdvertLimit = false;
                advertItem = CACHE._advertList[adType] || {};
                leftTime = advertItem.leftTime - Date.now();
                if(leftTime <= 0 && CACHE.refreshShopAdvert) {
                    echo('[广告] 点击商店刷新球球广告');
                    // 点击广告
                    return 'server.rpc_server_video_ads_click_watch(' + adType + ',0)';
                }
            }
        }
    },
    // 刷新广告信息
    'rpc_client_video_ads_refresh_info': function(type, countDownTime) {
        // echo('[ECHO]', 'rpc_client_video_ads_refresh_info', JSON.stringify({type, countDownTime}));
        var stamp = countDownTime + Date.now();
        CACHE._advertList[type] = {
            type: type,
            leftTime: stamp,
            leftTimeStr: echo.format(new Date(stamp), 'yyyy-MM-dd hh:mm:ss')
        };
        /*if(CACHE.ads_can['ads_can_' + type] && countDownTime === 0) {
            // 点击广告代码
            return 'server.rpc_server_video_ads_click_watch(' + type + ')';
        }*/
    },
    // 每日广告播放次数
    'rpc_client_daily_reward_video_ads_info': function(watchCnt) {
		echo("------>rpc_client_daily_reward_video_ads_info",watchCnt)
        CACHE.adsWatchCnt = watchCnt;
    },
    /**
     * 商店 - 广告宝箱
     * @param data
     * 免费宝箱：
     * 1 - diamond - 钻石 10
     * 2 - gold - 金币 100
     * 3 - box212 - 箱子 1
     */
    'rpc_client_market_daily_special_info': function(data) {
        var result = "",
            autoPayList = [1, 2, 3,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,167,166];
        if(data && data.length) {
            for (var i=0; i < data.length ;i++) {
                // { k: 3, v: 1, time: 1499, type: 0 },
                // k = key, v = 是否领取
                echo('[商店奖励] ID: ',data[i].k)
                if(data[i].v === 0 && autoPayList.includes(data[i].k)) {
                    result += "server.rpc_server_market_daily_special_buy(" + data[i].k + ");";
                    echo('[领取商店免费奖励] ID: ', data[i].k);
                }
            }
        }
        return result;
    },
    // 客户在线状态更新
    'rpc_client_friend_status_sync': function(uid, state) {
        // state：0.离线 1.在线 2.战斗中
    },
    // 用户信息
    'rpc_client_user_prop': function(data) {
        CACHE.userInfo = data;
    },
    // 新手进度
    'rpc_client_newbie_status': function(newbieStatus) {
        CACHE['newbieStatus'] = newbieStatus;
    },
    // 龙珠数据
    'rpc_client_dragon_ball_info': function(balls, critDmg) {
        CACHE.dragonBallInfo.balls = balls;
        CACHE.dragonBallInfo.critDmg = critDmg;
    },
    /**
     * 卡组数据
     * @param {object} data - 编队数据 [{\"ballList\":[37,29,31,39,9]},{\"ballList\":[2,4,31,21,32]},{\"ballList\":[2,31,8,39,20]}]
     * @param {number} activateIdx - 激活编队下标 数组1开始
     */
    'rpc_client_dragon_ball_deck': function(data, using) {
        CACHE.dragonBallInfo.dragonBallDeck = data;
        CACHE.dragonBallInfo.dragonBallDeckIndex = using + 1;
    },
    // 获得奖励 - 处理奖励领取金币和宝箱
    'rpc_client_common_reward': function(from, rewardShow, rewardAdd, boxKey) {
        // rpc_client_common_reward(\"market.dailySpecialBuy\",[],[{\"k\":3,\"v\":8},{\"k\":4,\"v\":2}],\"box212\")
    },
    // 通用扣东西
    'rpc_client_common_sub_reward': function(from, list) {
        // rpc_client_common_sub_reward(\"market.dailySpecialBuy\",[{\"k\":1,\"v\":268}])
    },
    'rpc_client_chatroom_enter_rv': function(id,succ,subchannel,num){

        echo('进入聊天室状态：',succ,'聊天室编号：',subchannel,'当前人数:',num)
    }
};
// 服务器 -> 客户端
function S_C(handleStr) {
    var result, evalStr;
    if(new RegExp(Object.keys(supportList).join("|")).test(handleStr)) {
        CACHE.DEBUG && echo.log('[记录日志] [S_C] ' + handleStr);
        // 处理方法
        try{
            evalStr = "supportList." + handleStr;
            //echo("[Eval]", evalStr);
            result = eval(evalStr);
            if(result) {
                // echo('[S->C 处理代码]', handleStr, "\n[处理结果]", result);
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
module.exports = S_C;