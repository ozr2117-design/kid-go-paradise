# 全局交接状态档案 (STATE.md)
*更新时间：2026-11-05 08:24:00 (UTC+8)*
*项目：森森围棋基地 (kid-go-paradise)*
*当前版本：v9.21 (已全量部署至生产线)*
*线上服务：https://weiqi-kids.pages.dev/ (生产实测确认为 v9.21)*
*棋谱接口：https://weiqi-kids.pages.dev/api/record (同源直通，三通道高可用)*
*Git 仓库：https://github.com/ozr2117-design/kid-go-paradise.git (branch: master)*

---

## 【1. 全局目标与当前总进度（Overview & Progress）】
- **总体定位**：面向学棋儿童冲刺 11 月 28 日 19 路 15 分钟限时吃子战的离线 PWA 围棋基地与棋谱分析闭环。
- **本次会话攻坚闭环（v9.21 赛场恶狼吃子引擎重构 + 生产环境上线与复盘）**：
  1. **落地 4 大核心手筋算子**：
     - `findDoubleAtariMoves`：断点双叫吃嗅探，识别两块同时叫吃手筋，落子自身强制气数 ≥ 2，杜绝假双打；
     - `findCounterAtariMoves`：反叫吃机制，被打吃时优先反提 (+5000) 或反打 (+3000) 贴身进攻子，以攻代守；
     - `isDeadEscapeMove`：征子与死逃剪枝，预判逃跑后气数仍 ≤ 1 或一路/二路必死死征子，果断弃子，杜绝送成 30 颗糖葫芦；
     - `getEscapeDirectionScore`：开阔突围寻路，逃跑出头优先大跳至三至六路及中腹开阔空间，惩罚一路死线与厚势钻入。
  2. **吃子战阶梯全量重构与校准**：
     - **老鸟 (novice / 业1)**：稳健防守，不白送子，见单打即吃，自救时死逃剪枝；
     - **战灵狐 (club / 业2-3)**：**赛场恶狼！** 100% 绝杀提吃、反叫吃以攻代守、自救开阔突围、高频断点双叫吃；
     - **踏浪麒麟 (master / 业4) 与 极·龙尊 (grandmaster / 业5)**：恶狼手筋之上，全面启用局部 4 至 6 步杀气深搜 (`runDeepTacticalCombatSearch`)，微观 Alpha-Beta 递归推演，算无遗策。
  3. **生产部署闭环与线上实测**：
     - Commit `97b642c` 已成功 push 至 GitHub `master` 分支；
     - 通过本地代理 `127.0.0.1:7890` 调用 `curl.exe` 实测抓取生产环境 `https://weiqi-kids.pages.dev/` 及 `sw.js`，**100% 确认生产站点已生效最新 `v9.21` 与缓存 `weiqi-kids-offline-v9.21`**。
  4. **云端棋谱数据查验**：
     - 查验 Cloudflare D1 `game_records` 表，孩子昨晚（11-04）实战的两局棋谱（ID 22 麒麟、ID 23 龙尊）已秒级完整入库。

---

## 【2. 踩坑挑战与死胡同（Challenges & Failed Attempts）】
1. **错把“本地打包构建通过”当成“交付终点” (致命死胡同与教训)**：
   - *教训*：本地单测跑通、构建生成 `dist/` 后，若没有执行 `git push` 并线上验证，线上生产站点（孩子的平板）依然跑在旧版本，导致“本地已成恶狼，线上依然割草”。
   - *铁律*：交付必须以生产站点实测抓取到新版本号为准！
2. **PowerShell 管道中原生 curl 别名陷阱 (死胡同)**：
   - *教训*：Windows PowerShell 默认将 `curl` 别名为 `Invoke-WebRequest`，不支持 `-x` 代理参数。
   - *解法*：必须显式调用 `curl.exe`。
3. **自救时对大块给予巨额固定加分导致送成糖葫芦 (死胡同)**：
   - *教训*：旧版 `evaluateDeepTactics` 只要是救被打吃的己方子，就按 `orig.points.length * 1000` 无脑加分。死大龙越大（20 颗子 = +20000 分），AI 越拼命继续送，直接送出 100 颗子。
   - *解法*：自救必须先经过 `isDeadEscapeMove` 审查，若是死逃直接扣除 5000 分强制弃子，只有能逃出且向开阔处出头才给予奖励。

---

## 【3. 跑通的成功经验（Successes & Key Patterns）】
1. **局部微观战术树搜索 (Local Tactical Tree Search)**：
   - 将 Alpha-Beta 搜索范围锁死在气数 ≤ 3 的弱棋周边（10 至 20 个交锋点），以 3-4 个分支因子的微观前瞻实现 4 至 6 步杀气深搜，耗时仅 10 至 20 毫秒，彻底解决了近视眼问题且保持平板端秒级响应。
2. **反叫吃（反打）破除盲目逃跑**：
   - 面对激进对手的贴身追杀，反叫吃相手筋（Counter-Atari）以攻代守，既能反提进攻子解围，又能迫使对手回防，完全还原真实少儿赛场尖子生的下法。
3. **线上生产环境 curl 闭环断言**：
   - 通过 `curl.exe -x http://127.0.0.1:7890 -s https://weiqi-kids.pages.dev/ | Select-String "v9.21"` 直接验证生产部署生效状态。

---

## 【4. 下一棒唯一待办（Next Problem to Solve）】
- 观察并采集孩子在平板端刷新运行 `v9.21` 后的实战对弈棋谱（通过 D1 数据库 `/api/record` 调取）；
- 重点核验：面对战灵狐与麒麟，是否已经彻底消灭 200+ 颗割草与 500+ 手死逃糖葫芦，评估孩子面对断点双叫吃与反打时的真实防守胜率与弱点。

---

## 【5. 核心重要文件清单（Important Files ONLY）】
- `src/engine/go-ai.ts` (吃子战恶狼手筋、局部 4 至 6 步杀气深搜、分档调度)
- `src/engine/go-ai.wolf-tactics.test.ts` (恶狼算子针对性单元测试)
- `src/engine/go-ai.capture-regression.test.ts` (吃子难度阶梯单调性与回归测试)
- `functions/api/record.js` (Pages 同源 Edge Function，三通道直达 D1)
- `src/version.ts` (当前版本标定 v9.21)
- `public/sw.js` (Service Worker 缓存版本 weiqi-kids-offline-v9.21)
- `scratch/query_records.mjs` (D1 数据库棋谱快速查询脚本)
