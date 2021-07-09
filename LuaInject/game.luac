local runic = require("runic")
runic.send("启动游戏")

require("declare")

local LanguageModule = require("tool.language")
game = {}
game.extra_cfg = {}
local cfg_url = "http://protal.q2.175game.com/clientinfo/"

local xhr = cc.XMLHttpRequest:new() -- 创建XMLHttpRequest对象
xhr.timeout = 30 -- 设置超时时间
xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING -- 设置返回内容的类型

xhr:setRequestHeader("Connection", "Keep-Alive")
xhr:open("GET", cfg_url) -- 设置向服务器发送请求的类型（通常为"GET"或"POST"）和请求的目标URL
local function httpCallback()
    gLogger.info("xhr.readyState", xhr.readyState)
    gLogger.info("xhr.status", xhr.status)
    gLogger.info("xhr.statusText", xhr.statusText)
    gLogger.info("xhr.responseText", xhr.responseText)
    local list = json.decode(xhr.responseText)
    dump(list)
    gLogger.info("xhr.response", xhr.response)
    if xhr.status ~= 200 then
        return
    end
    game.extra_cfg = json.decode(xhr.responseText) or {}
end

xhr:registerScriptHandler(httpCallback) -- 注册监听，服务器返回时触发回调函数
xhr:send()

game.curRunningScene = nil
game.isExit = false

function game.getCurSceneIsMainScene()
    local curScene = game.curRunningScene
    if curScene and "MainScene" == curScene.__cname then
        return true
    end
    return false
end

function game.onFocusMainSceneShopType(shopType, shopId)
    if nil == shopType or not game.getCurSceneIsMainScene() then
        return
    end
    local ThemeActivityData = require("module.pto_data.theme_activity_data")
    gEventMgr.trigEvent(gEventConst.EVENT_CLOSE_PANEL, {name = "pnl_theme_activity"})
    game.curRunningScene:getUILayer():onFocusShopType(shopType, shopId)
end

function game.onFocusMainScene(index, noAction)
    if nil == index or not game.getCurSceneIsMainScene() then
        return
    end
    game.curRunningScene:getUILayer():onFocusIndex(index, noAction)
end

local function doReEnterGame(bool, isLogout)
    -- from background to foreground, there doesn't need to confirm
    if isLogout then
        gHasLoaded = false
    end

    gEventMgr.trigEvent(gEventConst.EV_REENTER_GAME)
    if bool == true then
        require("module.network.connect").disconnect()
        require("module.network.connect_battle").disconnect()
        return game.enterLoginScene(true)
    end
end

function game.reEnterGame(bool, isLogout)
    if CLIENT_VERSION == 1 then
        doReEnterGame(bool, isLogout)
        return
    end

    checkIsMaintenanceAndVersion(
        function()
            doReEnterGame(bool, isLogout)
        end
    )
end

gLastInBackgroundTime = 0
gEnterForegroundTS = 0
gEnterBackgroundTS = 0
function game.enterForeground()
    gLastInBackgroundTime = os.time() - gEnterBackgroundTS
    gEnterForegroundTS = os.time()
    gLogger.debug(gEventConst.APP_ENTER_FOREGROUND_EVENT, gLastInBackgroundTime)
    gEventMgr.trigEvent(gEventConst.APP_ENTER_FOREGROUND_EVENT, gLastInBackgroundTime)
end

function game.enterBackground()
    gEnterBackgroundTS = os.time()
    gLogger.debug(gEventConst.APP_ENTER_BACKGROUND_EVENT, gEnterBackgroundTS)
    gEventMgr.trigEvent(gEventConst.APP_ENTER_BACKGROUND_EVENT)
end

local eventDispatcher = cc.Director:getInstance():getEventDispatcher()
eventDispatcher:addCustomEventListener(
    gEventConst.APP_ENTER_BACKGROUND_EVENT,
    function()
        game.enterBackground()
    end
)

eventDispatcher:addCustomEventListener(
    gEventConst.APP_ENTER_FOREGROUND_EVENT,
    function()
        game.enterForeground()
    end
)

local function doStartup()
    cc.Director:getInstance():setDisplayStats(CC_SHOW_FPS)
    game.enterLoginScene()
end

function game.startup()
    if CLIENT_VERSION == 1 then
        doStartup()
        return
    end

    checkIsMaintenanceAndVersion(doStartup)
end

function game.exit()
    cc.Director:getInstance():endToLua()
    game.isExit = true
end

function game.enterLoginScene(isReEnter)
    local userDefault = cc.UserDefault:sharedUserDefault()
    local musicVol = userDefault:getIntegerForKey("system_musicVol", 100)
    local effectVol = userDefault:getIntegerForKey("system_effectVol", 100)
    gAudioTool.setEffectVolume(effectVol)
    gAudioTool.setMusicVolume(musicVol)

    if isReEnter then
        local LoginScene = require("scene.login_scene")
        local scene = LoginScene.new()
        local ts = cc.TransitionFade:create(1, scene)
        cc.Director:getInstance():replaceScene(ts)
        return
    end

    local LoginScene = require("scene.login_scene")
    local scene = LoginScene.new()
    cc.Director:getInstance():replaceScene(scene)
end

-- 退出战斗场景
function game.exitBattleScene()
    local BattleReturnScene = require("scene.battle_return_scene")
    local battleReturnScene = BattleReturnScene.new()
    if battleReturnScene then
        local ts = cc.TransitionFade:create(0.5, battleReturnScene)
        cc.Director:getInstance():replaceScene(ts)
    end
end

function game:startBattle()
    assert(self._curBattle == nil)

    local Battle = require("battle.battle")
    self._curBattle = Battle.new()

    return self._curBattle
end

function game:getBattle()
    return self._curBattle
end

function game:destroyBattle()
    if self._curBattle then
        self._curBattle:destroy()
        self._curBattle = nil
    end
end

game.m_currentScene = nil
function game.getCurrentScene()
    return game.m_currentScene
end

function game.getCurrentSceneType()
    return game.m_currentScene.m_scene
end

function game.setCurrentScene(scene)
    game.m_currentScene = scene
end

function game.getUILayer()
    return game.m_currentScene:getUILayer()
end

function game.__init__()
    -- quick-cocos2dx has helped us set randomseed, see framework.__init__
    -- initRandom()

    if gFrameRate then
        cc.Director:getInstance():setAnimationInterval(1 / gFrameRate)
    end

    cc.Director:getInstance():setProjection(0)

    local FileUtils = cc.FileUtils:getInstance()
    local p = FileUtils:getWritablePath() .. "q2.game.qtz.com/"

    FileUtils:addSearchPath(p, true)
    FileUtils:addSearchPath(p .. "src/", true)
end

game.__init__()
