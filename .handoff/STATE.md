# 全局状态与交接档案 (STATE.md)

## 1. 全局目标与当前总进度 (Overview & Progress)
- **阶段目标**：已完成 2026-11-28 棋院 19 路吃子大赛备战阶段（孩子实战 4 局 1 胜 3 负、全程稳住情绪未哭且诚实复盘）。当前正式步入 **寒假过渡期（2026-12 至 2027-01-20 开营前）**，为孩子（森森，大三班）从“纯吃子”平滑过渡到“两眼做活、占角围空”（目标对接 2027-01-20 至 01-29 寒假入门加强集训 19 至 15 级、2027-02-25 春季基础精品 2 班 14 至 10 级）。
- **当前线上与构建版本 (`v9.58`, commit `e181c43`)**：
  1. **吃子大赛双核融合引擎 (`v9.55` 至 `v9.56`)**：16K/15K 启用“本地生死战术护盾 + PC KataGo Human-SL (`rank_20k`/`rank_18k`)”双核协同，默认首页进入吃子大战（`App.tsx`），全自动保存棋谱并上传 Cloudflare D1 (`weiqi-kids-db`)。
  2. **平板全屏底边裁切修复 (`v9.57`)**：`GoBoard.tsx` 全屏高度计算修正为 `Math.min(clientH, maxVh) - 18`，4 边木框与 1 路棋子完整显示。
  3. **赛前特训题库上线 (`v9.58`)**：`src/data/stages.ts` 新增 `id: 0`「周六赛前特训：悬崖边线防送子」（4 关默认全解锁），`stages.test.ts` 60 项全部通过，单文件打包 `dist/index.html`（644.04 kB）。
  4. **PC 引擎并发升级**：`katago_server/server.py` 已改为 `ThreadingHTTPServer`（注意：服务随会话重启会停止，下次联机训练前需重新拉起）。

---

## 2. 踩坑挑战与死胡同 (Challenges & Failed Attempts)
1. **路由器 `GOOGLE-5G` 同频隔离**：
   - 小米平板与 PC 同连 `GOOGLE-5G` 时局域网互访 100% 超时；平板切到 `GOOGLE`（2.4G）后即可毫秒互通 `http://192.168.10.135:8765`。不要在电脑端防火墙或代码里瞎折腾，优先让平板连 `GOOGLE` 2.4G。
2. **`https://` 混合内容拦截**：
   - Chrome 会拦截 `https://weiqi-kids.pages.dev` 请求 `http://192.168.10.135:8765`。需要使用 PC 满血算力时，平板必须直接访问 `http://192.168.10.135:8765`。
3. **吃子战绝不能被全盘 ONNX / PC 模型直接接管**：
   - 全盘大局观模型会在吃子接触战中脱先去占空角；必须先走 `findCaptureEmergencyShieldMove` 生死护盾，再由 PC KataGo 补强常规棋形。
4. **PowerShell 与 Git TLS 注意事项**：
   - PowerShell 命令分隔用 `;` 不用 `&&`；若 `git push` 遇 OpenSSL EOF 报错，加 `-c http.sslBackend=schannel` 即可。

---

## 3. 跑通的成功经验 (Successes & Key Patterns)
1. **吃子战「执黑 / 执白 / 猜先」+ 19 路安全气数红线**：
   - `findFerociousHuntingMove` 在 19 路强制自身落子后 `>= 3` 气，配合执白后手训练，将孩子从 `11-25` 执白 `0:17` 惨败一路拉升到 `11-27` 执白 `176` 手 `20:2` 反杀 15K。
2. **D1 棋谱复盘闭环**：
   - 通过 `https://api.cloudflare.com/client/v4/accounts/006960eb51dac6fb10e8b8b253083c1f/d1/database/87149d92-522c-4fe4-a4ed-6a6b9d4fef29/query` 可随时拉取 `game_records` 逐手分析孩子失误点。

---

## 4. 下一棒唯一待办 (Next Problem to Solve)
- **下一阶段唯一待办**：将平台训练重心从“吃子赛冲刺”平稳过渡到“**寒假 19 至 15 级全盘围地衔接**”——例如把 `src/App.tsx` 默认首页从 `battle` 调回更均衡的入口或增加“23K/20K 全盘启蒙对弈（13路看地盘）”与两眼做活引导，避免孩子一进全盘就被 18K 劝退。

---

## 5. 核心重要文件清单 (Important Files ONLY)
- `src/App.tsx`（第 15-20 行：当前默认 `currentMode` 为 `'battle'`，赛后可按需切回）
- `src/components/CaptureBattleView.tsx`（吃子大战主界面、每日计划卡片、执黑/执白/猜先、D1 自动存谱 `recordAndUploadBattle`）
- `src/components/FullGameSparringView.tsx`（全盘 AI 对弈：含 18K 至 15K 阶梯与势力地图）
- `src/engine/go-ai.ts`（双核融合入口 `getBestMoveAsync`、生死护盾 `findCaptureEmergencyShieldMove`、主动猎杀 `findFerociousHuntingMove`）
- `src/components/GoBoard.tsx`（第 63-76 行：平板全屏高度自适应）
- `src/data/stages.ts`（第 5-130 行：`id: 0` 赛前防送子特训 4 关 + 第 1 至 7 章题库）
- `katago_server/server.py`（`ThreadingHTTPServer` 多线程 PC 算力服务，端口 `8765`）
- `src/version.ts` 与 `public/sw.js`（当前版本 `v9.58`）
