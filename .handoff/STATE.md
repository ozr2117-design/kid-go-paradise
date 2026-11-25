# 全局状态与交接档案 (STATE.md)

## 1. 全局目标与当前总进度 (Overview & Progress)
- **阶段目标**：围绕 11 月 28 日考级与棋院 19 路吃子大赛，为孩子（森森，大三班）打造全功能、高童趣的少儿围棋自适应训练系统。
- **本次会话完成事项 (v9.58)**：
  1. **周六赛前特训题库上线**：在 `src/data/stages.ts` 顶部新增 `id: 0`「周六赛前特训：悬崖边线防送子」（默认全解锁，含 4 道 9 路互动题：1路别硬爬掉头站起、绝境反吃大灰狼尾巴、把对手赶进1路关门吃、2气大龙接回家延气）。
  2. **平板全屏底边裁切修复 (`v9.57`)**：在 `src/components/GoBoard.tsx` 修正全屏高度计算，彻底解决底边 1 路棋子只显示半颗的问题。
  3. **PC 算力并发升级**：`katago_server/server.py` 升级为 `ThreadingHTTPServer`，当前服务运行中；因路由器 `GOOGLE-5G` 存在同频隔离，平板切至 `GOOGLE`（2.4G）后局域网 `192.168.10.135:8765` 与云端 D1 存谱均已实测畅通。
- **构建与测试**：
  - Vitest 11 个测试套件、161 项单元测试 100% PASS；
  - 生产构建 `npm run build` 单文件通过（633.3 kB，gzip 178.4 kB），Service Worker 缓存递增至 `v9.54`。

---

## 2. 踩坑挑战与死胡同 (Challenges & Failed Attempts)
1. **主动进攻必须严守大盘安全气数阈值**：
   - 在 19 路大盘上发起主动猎杀叫吃与切断时，AI 落点后自身剩余气数必须严格保证 `>= 3` 气（`const minSelfLibs = size === 19 ? 3 : 2;`）。若落子后自身只有 2 气，极易贴到孩子已有厚势上沦为反送死。
2. **多引擎异步调度前置守卫**：
   - 吃子大赛必须 100% 直通战术规则引擎，杜绝全盘大局观 ONNX 模型截胡。
3. **PowerShell 管道语法**：
   - Windows PowerShell 下连接命令必须使用分号 `;`，严禁使用 `&&`。

---

## 3. 跑通的成功经验 (Successes & Key Patterns)
1. **执白对弈的双倍磨炼价值**：
   - 执黑先手让孩子形成“追着别人打”的舒适圈；执白后手逼迫孩子面对电脑的先发制人，学会“防守补断点”与“借力反叫吃”，是攻克真实赛场猜先的关键钥匙。
2. **恶狼主动猎杀与大龙死守结合**：
   - 在确保己方大龙不被吃的前提下，主动扑击对手 2 气弱棋与薄弱断点，大幅提升对弈对抗感。

---

## 4. 下一棒唯一待办 (Next Problem to Solve)
- **下一阶段唯一待办**：指导家长在小米平板 6 Pro 上刷新页面（更新至 v9.54），让孩子选择「执白后手」或「🎲 猜先」挑战 15K 冲锋机，体验主动猎杀与后手抗压的全新难度。

---

## 5. 核心重要文件清单 (Important Files ONLY)
- `src/components/CaptureBattleView.tsx`（19路吃子大赛：支持执黑/执白/猜先与全屏侧栏）
- `src/engine/go-ai.ts`（AI 核心引擎：`findFerociousHuntingMove` 恶狼主动猎杀算子）
- `src/components/FullGameSparringView.tsx`（AI全盘对弈：19路全屏沉浸对弈与常规视窗）
- `src/components/GoBoard.tsx`（棋盘核心组件：支持 `isImmersiveFullscreen` 高度无损自适应放大）
- `src/version.ts` 与 `public/sw.js`（当前版本 `v9.54`）
