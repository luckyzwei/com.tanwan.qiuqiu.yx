# 使用说明
> Lua 脚本 配合 《球球英雄》 客户端使用，该项目仅供学习参考！
> 目前支持自动 看广告、合作模式、竞技模式领取免费广告宝箱等。
> 球球会自动升级，合并球球。
> 推荐模拟器 《雷电模拟器》

# 项目部署
> 1.安装运行依赖 `npm install`
> 2.启动当前 node 项目 `npm run start`
> 3.修改 Lua 注入文件中的 url 参数 为当前项目 ip，不能是 127.0.0.1 安卓设备内部不识别。
> 4.拷贝 当前目录下的 game.luac 和 runic.lua 到 安卓设备 `/data/data/com.tanwan.qiuqiu.yx/file/com.tanwan.qiuqiu.yx/src/` 目录下，启动游戏即可。

```lua
local url = "http://192.168.0.100:5147/api.php" -- 根据使用环境，修改此处 IP
```
