# 全局交接状态档案 (STATE.md)
*更新时间：2026-11-02 21:15:00 (UTC+8)*
*项目：森森围棋基地 (kid-go-paradise)*
*当前版本：v9.19*
*线上服务：https://weiqi-kids.pages.dev/*
*棋谱接口：https://weiqi-kids.pages.dev/api/record (同源直通，免疫阻断)*
*Git 仓库：https://github.com/ozr2117-design/kid-go-paradise.git (branch: master)*

---

## 【1. 全局目标与当前总进度（Overview & Progress）】
- **总体定位**：面向学棋儿童（冲刺业余 1 段至 5 段 / 国家二级运动员水准）的离线 PWA 极简围棋基地与棋谱采集训练闭环。
- **最新演进闭环（v9.18 至 v9.19）**：
  1. **排查并根治棋谱无法上传死穴 (v9.19)**：
     - **真实探测**：通过 D1 SQL 查询证实此前云端 `game_records` 表为 0 条，实锤自 v9.16 以来一盘棋谱都没传上。
     - **排查根因**：原 `https://weiqi-kids-record.ozr2117.workers.dev` 域名在大陆遭 GFW SNI 物理阻断（报错 `SSL/TLS connection failed / ECONNRESET`），且前端 `uploadGameRecord` 静默降级未给家长明显提示。
     - **架构重构**：新建 Cloudflare Pages Functions [functions/api/record.js](file:///c:/Users/A/Desktop/others/F/functions/api/record.js) 并编译为 [dist/_worker.js](file:///c:/Users/A/Desktop/others/F/dist/_worker.js)；根目录挂载 [wrangler.toml](file:///c:/Users/A/Desktop/others/F/wrangler.toml) 配置 D1 绑定；
     - **同源通信**：前端上报地址彻底切换为同源相对路径 `/api/record`（非 Web 环境回退主站 `https://weiqi-kids.pages.dev/api/record`），零跨域、零 GFW 阻断。
     - **本地数据挽救同步器**：在 [src/engine/game-recorder.ts](file:///c:/Users/A/Desktop/others/F/src/engine/game-recorder.ts) 与 [src/engine/cloud-recorder.ts](file:///c:/Users/A/Desktop/others/F/src/engine/cloud-recorder.ts) 中增加 `getUnsyncedRecords()`、`markRecordsSynced()` 与 `syncPendingLocalRecords()`。在 [src/App.tsx](file:///c:/Users/A/Desktop/others/F/src/App.tsx) 启动时自动触发补传，自动将此前积压在设备 `localStorage` 里的所有未同步对弈批量救回云端 D1 数据库！
  2. **离线与缓存防护**：
     - [public/sw.js](file:///c:/Users/A/Desktop/others/F/public/sw.js) 与 [dist/sw.js](file:///c:/Users/A/Desktop/others/F/dist/sw.js) 升级至 `weiqi-kids-offline-v9.19`；
     - Service Worker 显式加入 `if (url.pathname.startsWith('/api/')) return;`，杜绝任何 API 接口被缓存拦截。
  3. **单元测试与编译**：全量 7 个测试套件、68 项单元测试全部绿灯通过；单文件构建成功。

---

## 【2. 踩坑挑战与死胡同（Challenges & Failed Attempts）】
1. **Cloudflare `*.workers.dev` 免费域名的国内物理阻断 (死胡同)**：
   - *现象*：大陆网络向 `*.workers.dev` 发送 TLS 请求会被 GFW 直接发送 TCP RST（`ECONNRESET`）。
   - *铁律解法*：国内生产环境严禁使用 `*.workers.dev`！必须使用 **Pages 同源路由 (`pages.dev/api/*`)** 或已备案自定义域名。
2. **静默失败引发的虚假安全感**：
   - 前端网络请求若被全量 `catch` 吞掉只打印 warn，在平板端无法看到控制台，会导致家长误以为功能正常。必须配备本地存谱与开机自动同步（Sync）双保险。
3. **AI 在线自训练的认知偏差**：
   - 围棋 AI 是前端静态算法与神经网络矩阵，不存在“下完 4 局当场自动梯度下降反向传播进代码”的在线自训练回路。棋谱上传云端的定位是：数据资产沉淀，供开发者与大模型后续进行技术复盘、规则微调与棋路分析。

---

## 【3. 跑通的成功经验（Successes & Key Patterns）】
1. **同源 Pages Functions + D1 强力双链路**：
   - 优先通过 `env.DB` 使用 D1 原生 Binding；
   - 若环境未绑定 DB，自动从边缘节点直连 Cloudflare D1 REST API，高可靠、高可用、零配置。
2. **构建链路打包一体化**：
   - `npm run build` 自动联动 `wrangler pages functions build --outfile dist/_worker.js`，保证本地与 GitHub Actions CI 产物完全一致。

---

## 【4. 核心重要文件清单（Important Files ONLY）】
- `functions/api/record.js` (Pages 同源棋谱上报 Edge Function)
- `dist/_worker.js` (编译后的 Pages Worker 路由文件)
- `wrangler.toml` (Pages D1 binding 声明)
- `src/engine/cloud-recorder.ts` (前端异步上传与自动挽救补传器)
- `src/engine/game-recorder.ts` (棋谱格式定义、localStorage 归档与未同步检索)
- `src/components/FullGameSparringView.tsx` (全盘对弈交互、结束本局按钮、上传与结算触发)
- `src/App.tsx` (应用根组件，启动触发历史棋谱补传)
- `src/version.ts` (当前版本标定)
- `public/sw.js` (Service Worker 缓存版本与 API 过滤)
