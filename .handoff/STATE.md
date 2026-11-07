# 全局交接状态档案 (STATE.md)
*更新时间：2026-11-07 13:10:00 (UTC+8)*
*项目：森森围棋基地 (kid-go-paradise)*
*当前版本：v9.42 (全员大师大局观架构 · 101 官方真题库接入与 18K 至 15K 标准点目对弈)*
*线上服务：https://weiqi-kids.pages.dev/*
*棋谱接口：https://weiqi-kids.pages.dev/api/record (Cloudflare D1 直连)*
*Git 仓库：https://github.com/ozr2117-design/kid-go-paradise.git (branch: master)*

---

## 【1. 全局目标与当前总进度（Overview & Progress）】
- **总体定位**：面向学棋儿童冲刺 11 月 28 日考级（101 围棋网实战题型与机器人），全面切换为正规中国规则点目对弈与 101 考级手筋真题宝典。
- **本阶段完成并全量测试通过的改动**：
  1. **彻底肃清低幼街机规则**：
     - 从导航栏彻底移除「萌宠吃子战」，仅保留四大核心模块：`⭐ 每日打卡`、`🥋 101 考级宝典`、`⚔️ AI 全盘对弈`、`🎨 自由沙盒`；
     - 彻底废除 15 分钟倒计时吃子战与吃 5 颗即死模式，全盘对弈 100% 锁死 **101 围棋公开赛标准中国规则数子法（19 路贴 3 又 3/4 子 / 13 路贴 2 又 3/4 子）**，双 Pass 触发点目。
  2. **101 官方真题库正式入库打通**：
     - 新建 `src/data/puzzles-101-bank.ts`，涵盖 101 考级 6 大必考专项（双打吃、门吃、抱吃、枷吃与征子、倒扑与接不归、两眼做活与破假眼、对杀紧气）；
     - 每一题均经引擎实测通过（`puzzles-101-bank.test.ts` 22 项测试全绿），全量合并入 `daily-challenges.ts` 的每日 15 题轮换题库。
  3. **18K 至 16K 全员武装「Dragon Policy 大师大局观骨架」**：
     - 查明 18K 之前行棋散漫的根因：原逻辑剥离了大局观，仅运行 100 次盲目 MCTS；
     - 全量将 15K 的 `Dragon Policy` 势力打分下沉至 18K、17K、16K：前 20 至 32 手堂堂正正占角占边（星位、小目、三三、大飞拆边），严惩二路盲目爬行，大龙 2 气死守；
     - 18K 精准保留实战手筋弱点：不防双打、不防倒扑、不防门吃，给孩子练习考级手筋留出克敌制胜的破局点；
     - 修复移动端 ONNX 预热 3 秒超时误降级，容忍度放宽至 10 秒。
  4. **全量构建与部署（v9.42）**：
     - 10 个测试套件、101 项 Vitest 单元与回归测试 100% 通过；
     - `npm run build` 单文件打包成功（产物 539 kB，gzip 159 kB）；
     - 代码已提交推送至 GitHub master，Cloudflare Pages 实时部署生效。

---

## 【2. 踩坑挑战与死胡同（Challenges & Failed Attempts）】
1. **18K 机器人脱离大局观导致的“形散与弱智感” (死胡同，已彻底修正)**：
   - *踩坑记录*：之前为了降低难度，对 18K 采用了“剥离全局估值、单靠 100 次随机 MCTS”的方案。在 19 路 361 点上，100 次 MCTS 无异于盲目乱下，甚至导致 18K 被叫吃不逃、见吃不提，表现极其低幼。
   - *明确警告*：**严禁在围棋 AI 中通过“剥离大局观”来降低难度！** 101 围棋网的低级位机器人之所以让人觉得“水平高”，是因为开局全员使用大师大局观（金角银边、占大场），降级只能发生在“局部接触战的读秒算路与盲区”。
2. **移动端 ONNX 预热 3 秒超时导致的误降级 (已修正)**：
   - *踩坑记录*：`KataGoONNXEngine` 中曾设置 3000ms 超时。在低配平板初次编译 WASM 时，容易因超时直接回退至启发式引擎。
   - *解法*：将超时放宽至 10000ms，杜绝移动端冷启动误杀。
3. **死活题自杀坐标逻辑假死 (已修正)**：
   - *踩坑记录*：在手搓直三点杀死活题时，若被包围方无外气且点入子未提子，会触发禁着点（自杀）。所有题目必须经 `puzzles-101-bank.test.ts` 严格断言其合法性。

---

## 【3. 跑通的成功经验（Successes & Key Patterns）】
1. **“大师骨架 + 手筋盲区”的梯度控制法**：
   - 18K 至 15K 全员共享 `evaluateDragonPolicy`（星位小目金角银边 + 高低搭配 + 严惩二路爬行）；
   - 18K 叫吃必逃、见吃必提，但中盘不识双打与倒扑；15K 则全盘绝杀、大龙死守。这种设计既保证了 AI 行棋的大师姿态，又为孩子提供了清晰的教学成就感。
2. **自动化题库数学验收规范**：
   - 任何新增 SGF 或 JSON 题库，必须通过 `GoCore.isLegalMove` 与 `GoCore.playMove` 自动断言，确保坐标无重叠、首步完全合法。
3. **单文件 PWA 极简离线交付**：
   - Vite 采用单文件打包内联 CSS/JS，大型 ONNX 模型与 WASM 二进制交由 Service Worker 独立预缓存，既保持了单 HTML 分发的极简，又实现了离线秒开。

---

## 【4. 下一棒唯一待办（Next Problem to Solve）】
- **任务目标**：根据孩子今日在平板上的实测反馈（18K 小智机对弈、每日打卡 101 真题），评估对弈手感与做题体验：
  - 若孩子反馈 18K 手感已完全贴合 101，且每日打卡顺畅，则继续扩充 Chapter 2 至 Chapter 6 的 101 进阶手筋（门吃、抱吃、枷吃、征子、倒扑、接不归专项关卡）；
  - 若用户需要体验更极致的 100% 满血 KataGo，可启动 **方案 B（本地电脑 i7 后端轻量服务）**，实现平板在局域网内直连 PC 满血版 KataGo。

---

## 【5. 核心重要文件清单（Important Files ONLY）】
下一个接力 Agent 必须优先阅读并遵守以下文件：
1. [src/engine/go-ai.ts](file:///C:/Users/A/Desktop/others/F/src/engine/go-ai.ts) (`evaluateDragonPolicy` L1120-L1250, `getNovice18kFullGameMove` L1335-L1410, `getFullGameSparringMove` L610-L670)：AI 对弈决策中枢与全员大师骨架。
2. [src/data/puzzles-101-bank.ts](file:///C:/Users/A/Desktop/others/F/src/data/puzzles-101-bank.ts)：101 官方分级考级真题库数据。
3. [src/data/daily-challenges.ts](file:///C:/Users/A/Desktop/others/F/src/data/daily-challenges.ts) (L605-L660)：每日打卡 15 题动态轮换池。
4. [src/components/FullGameSparringView.tsx](file:///C:/Users/A/Desktop/others/F/src/components/FullGameSparringView.tsx) (L40-L70, L355-L420)：对弈大厅、机器人档案配置与点目终局控制。
5. [src/engine/puzzles-101-bank.test.ts](file:///C:/Users/A/Desktop/others/F/src/engine/puzzles-101-bank.test.ts)：题库自动化数学测试套件。
