# 全局交接状态档案 (STATE.md)
*更新时间：2026-11-05 10:56:00 (UTC+8)*
*项目：森森围棋基地 (kid-go-paradise)*
*当前版本：v9.22 (已全量推送到生产线并公网验证)*
*线上服务：https://weiqi-kids.pages.dev/ (生产实测确认为 v9.22)*
*棋谱接口：https://weiqi-kids.pages.dev/api/record (同源直通，三通道高可用)*
*Git 仓库：https://github.com/ozr2117-design/kid-go-paradise.git (branch: master, commit: 0613af3)*

---

## 【1. 全局目标与当前总进度（Overview & Progress）】
- **总体定位**：面向学棋儿童冲刺 11 月 28 日 19 路 15 分钟限时吃子战的离线 PWA 围棋基地与棋谱分析闭环。
- **本次会话攻坚闭环（v9.22 吃子战术深搜静止剪枝优化 + 开局近战磁吸 + 生产环境发布）**：
  1. **彻底根治深搜倒挂盲区**：
     - 彻底废除 `validMoves.slice(0, 3)` 裸切片逻辑；
     - 引入强迫手生成器 `getSortedTacticalBranchMoves`，每一层严格按照：绝杀提吃手（10000分） > 反打/反提（8000分） > 死逃剪枝出头（7000分） > 断点双叫吃（6000分） > 紧 2 气弱棋（4500分） 排序推演；
     - 引入静止剪枝（Quiescence Cutoff）：无强迫手时直接终止递归进入叶子评估，将单步最慢耗时从 2094 毫秒稳健压缩至 250 至 780 毫秒以内。
  2. **注入开局近战缠斗磁吸（Contact Opening / Engagement Drive）**：
     - 吃子模式下开局前 12 手，大幅压低远离战场的空盘拆边（-1000 分）；
     - 仅当对手贴近棋子为厚势（>=2子且>=3气）时才惩罚弱气靠贴；对手若为孤子或弱棋，大力鼓励靠贴与跨断（+650 至 +750 分），前 4 手即强制进入短兵相接，彻底消灭前 70 手 0 提子的假和平。
  3. **修复重块死守与死逃剪枝边界漏洞（isDeadEscapeMove）**：
     - 废除原代码中针对 3 子以上重块的死逃豁免漏洞；
     - 严格锁死一路边线死爬：凡边线逃跑后仍 <= 1 气或对手下一手直接二路下扳再次叫吃者，判定为死逃强制弃子；
     - 对棋子数 >= 2 或 >= 3 的关键大块，严禁因逃跑后暂剩 1 气而将其作为死逃放弃，死守大龙。
  4. **全量无头天梯测试闭环与生产全网生效**：
     - `scratch/simulate_ai_match.test.ts` 3 项测试全部通过（老鸟 vs 战灵狐 3:3 平局 0、麒麟 vs 战灵狐 3:3 主场 6 杀提吃、龙尊 vs 麒麟 4 局 0 崩溃）；
     - 8 个测试文件、73/73 项单测全绿通过；
     - 单文件编译生成 `dist/index.html` (497 kB)，缓存递增为 `weiqi-kids-offline-v9.22`；
     - Git Commit `2cf80ee` 与 `0613af3` 成功 push 至 master 分支；实测抓取生产环境确认为 `v9.22`。

---

## 【2. 踩坑挑战与死胡同（Challenges & Failed Attempts）】
1. **递归深搜中在无强迫手时对全盘裸展开导致的算力爆炸 (致命死胡同与教训)**：
   - *教训*：在 `getSortedTacticalBranchMoves` 中，当盘面无强迫手时，曾错误地对全盘 300 多个空闲点调用 `evaluateDeepTactics`，在 6 步 Alpha-Beta 递归下引发节点爆炸，单步耗时超 2000 毫秒导致 Vitest 测试直接超时崩溃。
   - *铁律*：博弈树深搜必须严格执行静止剪枝（Quiescence Search），无强迫战术手时直接返回空数组，调用静态评估函数终止递归！
2. **开局战斗磁吸中对弱气一刀切重罚导致的 70 手 0 提子假和平 (死胡同)**：
   - *教训*：之前在 `evaluateDeepTactics` 中增加判定“只要距离对手 <= 2 且自身块气 < 3 一律惩罚 -800 分”。在 19 路大盘二路或角部接触时，任何贴身靠断初始落子瞬间必然只有 2 气，该惩罚彻底扼杀了所有接触战斗欲望，导致双方 70 手互不接触提 0 子。
   - *解法*：必须区分敌方是厚势还是孤弱！只有敌方是厚势（>=2子且>=3气）才惩罚，敌方是弱棋时大力鼓励靠断。
3. **弃子大块逻辑缺陷引发自杀性崩盘 (死胡同)**：
   - *教训*：`findEscapeAtariMoves` 机械判定“逃跑落子后自身块气必须 >= 2 才算有效自救”，导致 7 子大块在边线逃跑后若仍为 1 气时直接被放弃，被老鸟 0:7 一击秒杀。
   - *解法*：针对 >= 2 或 >= 3 子的核心重块，严禁轻易弃子，必须拼死挣扎自救延长战局。
4. **Git 远程推送中的 HTTP/2 协议阻断 (死胡同)**：
   - *教训*：本地 Clash/Mihomo 代理在处理 Git over HTTPS 时，Git 的 libcurl 默认尝试 HTTP/2 握手，触发 `SSL routines::unexpected eof while reading`。
   - *解法*：执行 `git config --global http.version HTTP/1.1` 强制指定 HTTP/1.1 协议，推送秒级稳定恢复。

---

## 【3. 跑通的成功经验（Successes & Key Patterns）】
1. **战术强迫手优先级队列与静止剪枝**：
   - 深搜分支仅从提吃、反打、出头、双叫吃、紧气 5 大强迫手生成，无强迫手立刻截断，既保证算度又将单步耗时严格压在 800 毫秒内。
2. **开局贴身近战磁吸机制**：
   - 开局前 12 手压低散漫拆边（-1000 分），大幅鼓励对孤弱敌子 1 至 2 格内靠断（+750 分），彻底消灭假和平，让少儿每局都进入短兵相接实战。
3. **本地纯绿色无头批量自对弈（Headless Benchmark）**：
   - 利用 `scratch/simulate_ai_match.test.ts` 进行跨段位 16 局 19 路自动化交叉循环赛，量化胜率、提子数与手筋触发频次，作为上生产前的金标准验收。
4. **版本递增与生产闭环断言**：
   - 每次发布严格同步递增 `src/version.ts` 与 `public/sw.js` 缓存键值；
   - 生产环境发布后通过 `curl.exe --http1.1 -x http://127.0.0.1:7890 -s https://weiqi-kids.pages.dev/ | Select-String "v9.22"` 闭环验证。

---

## 【4. 下一棒唯一待办（Next Problem to Solve）】
- **采集并复盘孩子今晚在平板端实战对弈棋谱**：
  - 孩子今晚刷新平板运行 `v9.22` 后，通过本地 `scratch/query_records.mjs` 直接调取 Cloudflare D1 数据库中新记录的实战棋谱；
  - 重点核验：面对「老鸟」和「战灵狐」，孩子是否能抵挡住开局贴身靠断、是否还会出现一路连送糖葫芦、反打手筋使用情况，输出教练复盘诊断报告。

---

## 【5. 核心重要文件清单（Important Files ONLY）】
- `src/engine/go-ai.ts` (吃子战术强迫手生成、静止剪枝深搜、开局近战磁吸、分档调度)
- `src/engine/go-ai.wolf-tactics.test.ts` (恶狼算子针对性单元测试)
- `src/engine/go-ai.capture-regression.test.ts` (吃子难度阶梯单调性与回归测试)
- `scratch/simulate_ai_match.test.ts` (19 路吃子全天梯无头自对弈基准测试)
- `functions/api/record.js` (Pages 同源 Edge Function，三通道直达 D1)
- `src/version.ts` (当前版本标定 v9.22)
- `public/sw.js` (Service Worker 缓存版本 weiqi-kids-offline-v9.22)
- `scratch/query_records.mjs` (D1 数据库棋谱快速查询脚本)
