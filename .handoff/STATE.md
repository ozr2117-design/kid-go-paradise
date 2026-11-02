# 全局交接状态档案 (STATE.md)
*更新时间：2026-11-02 20:40:00 (UTC+8)*
*项目：森森围棋基地 (kid-go-paradise)*
*当前版本：v9.2*
*线上服务：https://weiqi-kids.pages.dev/*
*Git 仓库：https://github.com/ozr2117-design/kid-go-paradise.git (branch: master)*

---

## 【1. 全局目标与当前总进度（Overview & Progress）】
- **总体定位**：面向学棋儿童（冲刺业余 1 段至 5 段 / 国家二级运动员水准）的离线 PWA 极简围棋基地。
- **最新完成（v9.0 -> v9.1 -> v9.2）**：
  1. **v9.0 神经龙尊满血升级**：纯前端内嵌轻量 Policy-Value 神经网络与 PUCT 蒙特卡洛搜寻（WebGPU/骁龙 8+ 显卡直通与 CPU 降级混合驱动），彻底修复 19x19 中盘被围投降的死局缺陷。
  2. **v9.1 平板横屏紧凑适配**：针对小米平板 6 Pro 横屏视界，精简右侧侧边栏介绍与选项内边距，实现底部 4 大功能按钮（悔棋、停一手、数气点、看地盘）100% 常驻直显，免上下滑动；重构居中版本更新与强制清缓存弹窗。
  3. **v9.2 冲段天梯重构（业1段 至 业5段）**：全面退役低效的“菜鸟(15K)/中鸟(10K)”，重构为贴合儿童实战进阶的 4 阶对手梯队：
     - `🦅 老鸟` (业余 1 段·守门名宿，现行 MCTS，孩子稳赢 80%+ 的信心充电桩)；
     - `🦊 战灵狐` (业余 2-3 段·中盘刺客，专注断点切断与双打吃 + MCTS 220 步)；
     - `🦄 踏浪麒麟` (业余 4 段·大局宗师，深度 Policy 先验 + MCTS 320 步)；
     - `🐲 极·龙尊` (业余 5 段·国家二级大招，全盘神经网络，支持让 4 至 6 子大国手指导棋)。
  4. **全量自动化测试**：60 项单元测试 100% 绿灯全过（Vitest）。
  5. **生产部署闭环**：单文件构建 (466 kB) 成功通过专线代理推送到 Cloudflare Pages 并同步至 GitHub master 分支。

---

## 【2. 踩坑挑战与死胡同（Challenges & Failed Attempts）】
1. **Cloudflare CLI 直连握手超时 (死胡同)**：
   - *现象*：Windows 终端下直接运行 `npx wrangler pages deploy` 容易出现 `Request to Cloudflare's API timed out`。
   - *铁律解法*：必须显式注入本地代理环境变量：
     `$env:https_proxy="http://127.0.0.1:7890"; $env:http_proxy="http://127.0.0.1:7890"` 并携带 `CLOUDFLARE_API_TOKEN` 与 `CLOUDFLARE_ACCOUNT_ID`。
2. **平板开 Clash Meta 无法加载网页 (死胡同)**：
   - *根因*：移动端 Clash 默认分流规则常将 `*.pages.dev` 导流到公共机场节点，触发 Cloudflare 边缘人机验证盾或安卓 UDP/QUIC 丢包。
   - *铁律解法*：在平板 Clash 中添加 `DOMAIN-SUFFIX,pages.dev,DIRECT`，或者依靠 Service Worker 离线缓存运行。
3. **MCTS 内部角部阵地判定越界 (历史 Bug 已修复)**：
   - 在 7x7 等小盘测试时，`cornerChecks` 硬编码坐标 `[15, 15]` 曾导致 `Cannot read properties of undefined (reading '3')`。已统一改为动态计算 `cornerOffset` 防越界。

---

## 【3. 跑通的成功经验（Successes & Key Patterns）】
1. **极简单文件架构 (Singlefile Vite)**：
   - 依赖 `vite-plugin-singlefile` 将 HTML、CSS、JS、WebAssembly 全部打成单文件 `dist/index.html`。
   - 配合 `public/sw.js` 的缓存版本控制（每次发版修改 `CACHE_NAME` 如 `weiqi-kids-offline-v9.2`），即跑即走，断网可用。
2. **测试与打包一体化命令**：
   - 测试：`npm run test`
   - 构建：`npm run build`
   - 部署：
     ```powershell
     $env:https_proxy="http://127.0.0.1:7890"
     $env:http_proxy="http://127.0.0.1:7890"
     # 凭据自本地环境或 Cloudflare 账户加载
     npx wrangler pages deploy dist --project-name=weiqi-kids --commit-dirty=true
     ```

---

## 【4. 下一棒唯一待办（Next Problem to Solve）】
- **业务主线**：引导孩子训练重心全面向 **19x19 标准大盘** 转移。
- **潜在功能点**：
  1. 考虑在“AI全盘对弈”界面中，默认选中路数改为 `19x19`（目前默认是 13x13），或记录上次玩家选择的路数状态。
  2. 观察孩子与 `🦊 战灵狐` 和 `🦄 麒麟` 的 19x19 实战对弈反馈，必要时微调让子预设。

---

## 【5. 核心重要文件清单（Important Files ONLY）】
- `src/components/FullGameSparringView.tsx` (L35-L67: 对手 Profile 配置; L185-L235: 开局提示与语音台词; L580-L990: 紧凑布局与侧边栏控件)
- `src/engine/go-ai.ts` (L415-L445: 对手分流调度; L880-L985: 麒麟与战灵狐核心决策算法; L1090-L1250: 龙尊神经网络 MCTS)
- `src/components/KidNavbar.tsx` (L43-L75: Service Worker 强刷更新弹窗逻辑)
- `src/version.ts` (当前版本号控制与展示文本)
- `public/sw.js` (Service Worker 离线缓存名称定义)
