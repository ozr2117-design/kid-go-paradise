# 全局交接状态档案 (STATE.md)
*更新时间：2026-11-03 22:00:00 (UTC+8)*
*项目：森森围棋基地 (kid-go-paradise)*
*当前版本：v9.21*
*线上服务：https://weiqi-kids.pages.dev/*
*棋谱接口：https://weiqi-kids.pages.dev/api/record (同源直通，三通道高可用)*
*Git 仓库：https://github.com/ozr2117-design/kid-go-paradise.git (branch: master)*

---

## 【1. 全局目标与当前总进度（Overview & Progress）】
- **总体定位**：面向学棋儿童冲刺 11 月 28 日 19 路 15 分钟限时吃子战的离线 PWA 围棋基地与棋谱分析闭环。
- **本次会话攻坚闭环（v9.21 赛场恶狼吃子引擎重构）**：
  1. **落地 4 大核心手筋算子**：
     - `findDoubleAtariMoves`：断点双叫吃嗅探，能同时让两块敌棋陷入 1 气叫吃，且强制校验落子自身安全（气数 ≥ 2），杜绝自杀性假双打；
     - `findCounterAtariMoves`：反叫吃与反提机制，己方被打吃时优先反击对方贴身进攻子（反提 +5000 / 反打 +3000），以攻代守打破对手节奏；
     - `isDeadEscapeMove`：征子与死逃剪枝，预判一路/二路死线爬行及深陷敌阵包围的必死逃跑，果断弃子换先手（Tenuki），从物理根源上彻底斩断送成 30 颗“糖葫芦”的弊病；
     - `getEscapeDirectionScore`：开阔突围寻路，逃跑出头优先大跳至三至六路及中腹开阔空间，大幅惩罚死线爬行与敌军厚势。
  2. **吃子战阶梯全量重构与校准**：
     - **老鸟 (novice / 业1)**：稳健防守，不白送子，见单打即吃，自救时死逃剪枝，不再无脑连送；
     - **战灵狐 (club / 业2-3)**：**真正的赛场恶狼！** 100% 绝杀提吃、优先反叫吃以攻代守、自救结合开阔突围、高频断点双叫吃与消除对手双打威胁；
     - **踏浪麒麟 (master / 业4) 与 极·龙尊 (grandmaster / 业5)**：在恶狼手筋基础上全面搭载 **局部 4 至 6 步杀气深搜 (`runDeepTacticalCombatSearch`)**，聚焦弱棋交锋区进行微观 Alpha-Beta 递归推演，算无遗策。
  3. **质量断言与测试闭环**：
     - 新增 [src/engine/go-ai.wolf-tactics.test.ts](file:///c:/Users/A/Desktop/others/F/src/engine/go-ai.wolf-tactics.test.ts)，全量验证 4 大手筋算子与战灵狐 19 路双叫吃实战表现；
     - 全量回归测试 [src/engine/go-ai.capture-regression.test.ts](file:///c:/Users/A/Desktop/others/F/src/engine/go-ai.capture-regression.test.ts) 10 项全部通过（战灵狐吃子量单调超越老鸟，难度映射 100% 吻合）；
     - 生产环境构建 `npm run build` 0 报错通过，静态内联单文件生成完毕，Service Worker 缓存版本递增至 `weiqi-kids-offline-v9.21`。

---

## 【2. 踩坑挑战与死胡同（Challenges & Failed Attempts）】
1. **GitHub Secret Scanning 拦截 `cfut_` 关键字 (死胡同)**：
   - *教训*：直接在代码提交带 `cfut_` 前缀的字符串会触发 GitHub Push Protection 阻断推送。
   - *解法*：优先使用同源 `/api/record` 与 Worker 骨干网内部通道，无需任何 Token。
2. **Pages Functions 与 `dist/_worker.js` 文件冲突 (死胡同)**：
   - *教训*：若 `dist/` 下同时存在 `_worker.js` 与根目录 `functions/`，Wrangler 会报错拒绝部署。
   - *解法*：彻底移除静态 `_worker.js`，由 Pages 原生编译 `functions/api/record.js`。
3. **自救时对大块给予巨额固定加分导致送成糖葫芦 (死胡同)**：
   - *教训*：旧版 `evaluateDeepTactics` 只要是救被打吃的己方子，就按 `orig.points.length * 1000` 无脑加分。死大龙越大（20 颗子 = +20000 分），AI 越拼命继续送，直接送出 100 颗子。
   - *解法*：自救必须先经过 `isDeadEscapeMove` 审查，若是死逃直接扣除 5000 分强制弃子，只有能逃出且向开阔处出头才给予奖励。

---

## 【3. 跑通的成功经验（Successes & Key Patterns）】
1. **局部微观战术树搜索 (Local Tactical Tree Search)**：
   - 19 路全盘搜索复杂度极高，但在吃子战中，所有生死交锋仅发生在气数 ≤ 3 的弱棋周边（10 至 20 个交锋点）。
   - 将 Alpha-Beta 搜索范围锁死在战术活跃区，以 3-4 个分支因子的微观前瞻实现 4 至 6 步杀气深搜，耗时仅 10 至 20 毫秒，彻底解决了近视眼问题且保持平板端秒级响应。
2. **反叫吃（反打）破除盲目逃跑**：
   - 面对激进对手的贴身追杀，反叫吃相手筋（Counter-Atari）以攻代守，既能反提进攻子解围，又能迫使对手回防，完全还原真实少儿赛场尖子生的下法。

---

## 【4. 下一棒待办建议（Next Problem to Solve）】
- 观察孩子在平板端对弈 `v9.21` 战灵狐与麒麟的实战棋谱数据（通过 D1 数据库 `/api/record` 收集）；
- 根据小选手的战术失误率，在名师复盘（AiSensei）中增设针对“漏防双叫吃”与“一路盲目爬行”的针对性语音提示。

---

## 【5. 核心重要文件清单（Important Files ONLY）】
- `src/engine/go-ai.ts` (吃子战恶狼手筋、局部 4 至 6 步杀气深搜、分档调度)
- `src/engine/go-ai.wolf-tactics.test.ts` (恶狼算子针对性单元测试)
- `src/engine/go-ai.capture-regression.test.ts` (吃子难度阶梯单调性与回归测试)
- `functions/api/record.js` (Pages 同源 Edge Function，三通道直达 D1)
- `src/engine/cloud-recorder.ts` (前端异步上传与自动挽救补传器)
- `src/engine/game-recorder.ts` (棋谱格式定义、localStorage 归档与未同步检索)
- `src/components/FullGameSparringView.tsx` (全盘对弈交互、规则与手数控制)
- `src/version.ts` (当前版本标定 v9.21)
- `public/sw.js` (Service Worker 缓存版本 weiqi-kids-offline-v9.21)
