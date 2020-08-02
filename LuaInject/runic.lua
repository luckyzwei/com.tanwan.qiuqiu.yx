--[[
在 game.lua 中注入该 lua 可以试试看有啥可扩展的操作
local runic = require("runic")
runic.send("启动游戏")

修改 lua 后需要删除 app缓存目录/shared_prefs/ 文件夹
]]
local Runic = {}
local callback
local url = "http://192.168.0.100:5147/api.php" -- 根据使用环境，修改此处 IP

_G["DEBUG"] = 4
_G["LOG_LEVEL"] = 1
_G["RPC_LOG_LEVEL"] = "verbose"

-- 如果没有开启调试，默认开启
if nil == _G["RUNIC"] then
    _G["RUNIC"] = true
end

-- 提交请求记录
function Runic.send(msg)
    -- 关闭调试
    if _G["RUNIC"] == false then
        return
    end

    local event = {
        --["DEBUG"] = DEBUG,
        --["RPC_LOG_LEVEL"] = RPC_LOG_LEVEL,
        --["LOG_LEVEL"] = LOG_LEVEL,
        ["msg"] = msg
        --["msg"] = msg
    }

    local xhr = cc.XMLHttpRequest:new()  -- 创建XMLHttpRequest对象
    xhr.timeout = 30  -- 设置超时时间
    xhr:setRequestHeader("Connection", "Keep-Alive")
    -- response回调函数
    local function responseCallback()
        if xhr.status ~= 200 then
            return
        end
        -- Runic.show("XHR: " .. xhr.responseText)
        local obj = json.decode(xhr.responseText)
        if nil ~= callback and nil ~= obj then
            callback(obj)
        end
    end
    -- 设置返回值类型及回调函数
    xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING
    xhr:registerScriptHandler(responseCallback)

    xhr:open("POST", url)  -- 设置向服务器发送请求的类型（通常为"GET"或"POST"）和请求的目标URL
    xhr:send(json.encode(event))
end

-- 请求回调
callback = function(jsonObj)
    if _G["RUNIC"] == false then
        return
    end
    -- tryCatch
    xpcall(function()
        -- 处理代码
        if nil ~= jsonObj and jsonObj.code == 0 then
            if jsonObj.data.debug then
                -- 调试中
                local evalStr = jsonObj.data.eval
                if nil ~= evalStr then
                    -- 动态执行 lua 代码
                    loadstring(evalStr)()
                end
            else
                -- 关闭调试，不在继续请求
                _G["RUNIC"] = false
                Runic.show("[Runic] - 关闭调试")
            end
        end
    end , function(err)
        -- 异常回调
        Runic.show(err)
    end)
end

-- 合并可选参数
function Runic.average(...)
    local result = ""
    local num = select('#', ...)
    local addStr = "|@|"
    for i = 1, num do  -->获取参数总数
        local arg = select(i, ...); -->读取参数
        if i == num then
            -- 最后一个
            addStr = ""
        end
        result = result .. tostring(arg) .. addStr
    end
    result = result .. ""
    return result
end

-- 提示信息
function Runic.show(msg)
    --local CommonMessagePopLayer = require("ui.common_message_pop_layer")
    --CommonMessagePopLayer.open(msg or "Nil Msg")
    release_print(msg)

    local AlertPopLayer = require("boot.alert_pop_layer")
    local alert = AlertPopLayer.new()
    alert:setCloseEnable(false)
    alert:setMsgContent(msg)
    alert:hideCancelBtn()
    alert:popUp()
end

-- hook 日志打印
_G["release_print"] = function (...)
    local msg = Runic.average(...);
    -- HTTP 协议
    Runic.send(msg)
    -- socket 协议
    --runic_rpc:rpc_call(msg)
end
-- _G["print"] = _G["release_print"]

return Runic