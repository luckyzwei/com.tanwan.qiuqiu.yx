
// 球球列表 Name，ID - 1 对应 js 数组
var ballNameList = ['火球球','电球球','风球球','毒球球','冰球球','强攻球球','疯狂球球','幸运球球','禁锢球球','能源球球','极速球球','荆棘球球','破甲球球','暴击球球','能量球球','祭品球球','致命球球','瞬移球球','光线球球','合体球球','辐射球球','雷暴球球','吸能球球','狂风球球','换位球球','共鸣球球','火炮球球','圣光球球','地狱球球','冰墙球球','暴雪球球','成长球球','繁衍球球','火拳球球','暗杀球球','残像球球','忍者球球','飓风球球','升星球球','召唤球球','时光球球','爆弹球球','旋涡球球','复制球球','泡泡球球','流星球球','连击球球'];

// 战斗常量
var BattleConst = {
    // 不升级的纯辅助球球
    notUpgrade: [
        16, // 祭品球球
        32, // 成长球球
        35, // 暗杀球球
        44, // 复制球球
    ],
    // 参考文件 - battle_const.luac
    DragonBallUpgradeCost: {
        '1': 100,
        '2': 200,
        '3': 400,
        '4': 700,
    },
    // 参考文件 - cfg_dragon_ball.luac
    StatusType: {
        // monster
        Frozen: "frozen",			// 冰冻
        Imprison: "imprison",		// 禁锢
        Poison: "poison",			// 毒
        BreakUp: "breakUp",		// 破甲
        Radiative: "radiative",	// 辐射
        Absorb: "absorb",			// 吸收sp
        SnowStorm: "snowStorm",	// 暴风雪

        // boss
        SkillCast: "skill_cast",	// 技能吟唱

        // dragon ball
        SpeedUp: "atk_speed_up",	// 攻速提升
        ProduceSp: "produce_sp",	// 生产sp
        CriticalUp: "critical_up",	// 暴击提升
        WindUp: "wind_up",			// 狂风球球攻速提升
        PowerUpByLink: "power_up_by_link",	// 共鸣球球根据连接数提升攻击力
        FatalUp: "fatal_up",		// 致命概率提升
        FireFist: "fire_fist",		// 火拳龙珠变身
        ShadowBall: "shadow_ball",	// 残像龙珠
        StormUp: "storm_up",		// 飓风一阶变身
        StormUpEx: "storm_up_ex",	// 飓风二阶变身
        SpeedDownByTime: "speed_down_by_time",	// 时光球球让对手攻速下降
        Lock: "lock",				// 被禁锢
        Combo: "combo",				// 组合球层数

        BallKill: "ball_kill",		// 暗杀龙珠目标
        BossKill: "boss_kill",		// boss摧毁目标
    },
    // 参考文件 - cfg_monster.luac
    monster: {
        // 小怪
        '1': {
            'name': '普通怪',
            'desc': '每10秒出现并且没10秒增加100血量'
        },
        '2': {
            'name': '速度怪',
            'desc': '每15出现一次'
        },
        '3': {
            'name': '精英怪',
            'desc': '每20秒出现一次'
        },
        '4': {
            'name': '球球召唤怪',
            'desc': '球球合并时产生'
        },
        '5': {
            'name': '球球召唤sp怪',
            'desc': '球球合并时产生'
        },
        // BOSS
        '101': {
            'name': '阴阳玄黄',
            'desc': '释放技能会对战场上所有的球球进行随机转换'
        },
        '102': {
            'name': '混沌三体',
            'desc': '三个技能顺序释放，摧毁战场上随机一个球球、清除所有障碍物、自我回复血量'
        },
        '103': {
            'name': '禁锢大圣',
            'desc': '释放技能随机对战场上的球球进行禁锢'
        },
        '104': {
            'name': '孕育之王',
            'desc': '释放技能会召唤怪物'
        },
        '105': {
            'name': '暗杀大师',
            'desc': '释放第一段技能会对场上所有球球造成降低星级的效果，第二段技能会向前方冲刺一段距离'
        },
    }
};

module.exports = {
    ballNameList,
    BattleConst
};