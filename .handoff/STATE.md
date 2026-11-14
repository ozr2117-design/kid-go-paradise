# 全局状态与交接档案 (STATE.md)

## 1. 全局目标与当前总进度 (Overview & Progress)
- **阶段目标**：围绕 11 月 28 日考级与棋院 19 路吃子大赛，为孩子（森森，大三班）打造全功能、高童趣的少儿围棋自适应训练系统。
- **本次会话完成事项 (v9.53)**：
  1. **彻底修复吃子战被全盘 ONNX 截胡导致各级别难度过低的关键 Bug（方案一落地）**：
     - **Bug 根因**：在 `src/engine/go-ai.ts` 的 `getBestMoveAsync` 异步入口中，第 109 行本地 `KataGoONNXEngine.isReady()` 分支中遗漏了 `!options.captureTarget` 判定，导致吃子战全部被 KataGo 全盘大局观模型截胡。KataGo 大局观模型满脑子围地和占角，在局部接触战中频繁脱先弃子，导致各级别对孩子而言均极其容易。
     - **方案一精准修复**：在 ONNX 直觉推理分支添加 `(options.isFullGame || !options.captureTarget)` 前置守卫。吃子大赛 100% 直通本地专属战术恶狼引擎，杜绝脱先送子，17K 巡逻机、16K 哨兵机、15K 冲锋机即刻恢复凶悍防守与双打反击战斗力。
  2. **19路棋盘顶天立地满屏与系统级黑条彻底消除 (v9.52 成果稳固)**：
     - 吃子大赛与 19 路全盘对弈均享有完全顶天立地、左右悬浮翼的清爽满屏体验。
- **构建与测试**：
  - Vitest 11 个测试套件、160 项单元测试 100% PASS；
  - 生产构建 `npm run build` 单文件通过（627.5 kB，gzip 177.5 kB），Service Worker 缓存递增至 `v9.53`。

---

## 2. 踩坑挑战与死胡同 (Challenges & Failed Attempts)
1. **多引擎异步调度前置守卫遗漏**：
   - 当系统同时集成 PC KataGo、本地 KataGo ONNX 与本地纯规则战术引擎时，必须对每个引擎的适用场景（全盘点目 vs 吃子战）做严格的前置隔离。一旦 ONNX 守卫遗漏，就会全盘通吃，导致专用于吃子的战术算法被完全旁路。
2. **PowerShell 管道与引号语法陷阱**：
   - 在 Windows PowerShell 下使用 `&&` 连接命令会报错 `The token '&&' is not a valid statement separator`，必须使用分号 `;` 分隔多条命令。
3. **PWA 离线缓存名称必须与静态构建强一致**：
   - 每次 `version.ts` 变更版本号后，必须同步修改 `public/sw.js` 与 `dist/sw.js` 中的 `CACHE_NAME`（如 `weiqi-kids-offline-v9.53`）。

---

## 3. 跑通的成功经验 (Successes & Key Patterns)
1. **吃子战术恶狼引擎的核心威力**：
   - 吃子比赛不同于全盘围地，核心是“死守己方弱子、嗅探断点双叫吃、反打以攻代守、死逃剪枝”。本地纯规则引擎在该模式下的紧迫感与对抗性远胜全盘大局观模型。
2. **16:10 宽屏平板黄金布局法**：
   - 正方形 1:1 棋盘在 16:10 平板横屏下，高度为唯一尺寸瓶颈。消灭顶部栏位，将所有比分与按钮转移至左右富余侧翼，棋盘面积可直接扩大到硬件极限。
3. **KataGo 后台长进程与单机自适应**：
   - PC 端 KataGo 后台守护进程持续在 `0.0.0.0:8765` 稳定监听（当前任务号：`task-349`），支持 `23k`、`18k`、`17k`、`16k`、`15k` 全档位动态切换，断网时前端自动平滑降级至本地战术规则引擎。

---

## 4. 下一棒唯一待办 (Next Problem to Solve)
- **下一阶段唯一待办**：指导家长在小米平板 6 Pro 上刷新页面（更新至 v9.53），让孩子重新对战 17K 巡逻机、16K 哨兵机与 15K 冲锋机，体验战术引擎激活后的真实对抗难度。

---

## 5. 核心重要文件清单 (Important Files ONLY)
- `src/engine/go-ai.ts`（AI 核心引擎路由：全盘 ONNX 与吃子战术引擎分流）
- `src/components/CaptureBattleView.tsx`（19路吃子大赛：全屏对弈与备战大厅）
- `src/components/FullGameSparringView.tsx`（AI全盘对弈：19路全屏沉浸对弈与常规视窗）
- `src/components/GoBoard.tsx`（棋盘核心组件：支持 `isImmersiveFullscreen` 高度无损自适应放大）
- `src/components/WeeklyReportCardModal.tsx`（打卡证书与荣誉卡弹窗）
- `src/components/AdventureMap.tsx`（“围棋题库”闯关地图与章节列表）
- `src/components/KidNavbar.tsx`（顶部导航栏模式切换）
- `src/version.ts` 与 `public/sw.js`（当前版本 `v9.51`）
