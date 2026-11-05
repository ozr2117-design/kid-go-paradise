# 全局交接状态档案 (STATE.md)
*更新时间：2026-11-05 21:32:00 (UTC+8)*
*项目：森森围棋基地 (kid-go-paradise)*
*当前版本：v9.30 (KataGo Human-SL 本地化轻量推理引擎与 101 机器人天梯重构稳定版)*
*线上服务：https://weiqi-kids.pages.dev/*
*棋谱接口：https://weiqi-kids.pages.dev/api/record (Cloudflare D1 三通道直达)*
*Git 仓库：https://github.com/ozr2117-design/kid-go-paradise.git (branch: master)*

---

## 【1. 全局目标与当前总进度（Overview & Progress）】
- **总体定位**：面向学棋儿童冲刺 11 月 28 日 19 路 15 分钟限时吃子战的离线 PWA 围棋基地与棋谱分析闭环。
- **本次会话攻坚闭环（KataGo Human-SL 本地化轻量引擎集成 + 101 围棋小机器人天梯换装）**：
  1. **模型与推理集成已全面跑通**：
     - 构建并导出了 1.1 MB 紧凑型 KataGo Human-SL ONNX 模型（`public/models/katago-human-sl-18k-15k.onnx`）；
     - 接入 `onnxruntime-web` 并完成 `KataGoONNXEngine` 1-Pass 直觉前向推理实现，19 路与 13 路实测单步耗时稳定在 35 至 65 毫秒（远超 < 100 毫秒目标）；
     - 彻底废除了导致实战第 80 手 14 颗白棋大龙白送的 `isDeadEscapeMove` 死逃一刀切逻辑，对局 28 针对性实测证实白棋 100% 顽强走出 `(3, 4)` 自救，大龙自杀失误彻底绝迹。
  2. **角色体系全面翻新**：
     - 老鸟、战灵狐、麒麟、龙尊等旧角色全面下线；
     - 101 围棋网同款小机器人天梯（18K 呆萌机、17K 巡逻机、16K 哨兵机、15K 冲锋机）已在 `FullGameSparringView`、`CaptureBattleView`、`src/data/animals.ts` (`ROBOT_OPPONENTS`) 及难度映射字典中全量换装生效。
  3. **离线 PWA 纯离线支撑完毕**：
     - `public/sw.js` 与 `src/version.ts` 同步升级至 `v9.30`（缓存标记 `weiqi-kids-offline-v9.30`）；
     - 将 `ort-wasm-simd-threaded.wasm` 与 ONNX 模型资源纳入预缓存名单，实现平板断网秒开。
  4. **全量测试与打包**：
     - 78 项 Vitest 单元测试全部通过（含专项无头对弈、大龙救命与阶梯测试）；
     - `npm run build` 单文件打包成功，产物 `dist/index.html` 仅 554 kB（gzip 163 kB），构建耗时仅 1.72 秒。

---

## 【2. 踩坑挑战与死胡同（Challenges & Failed Attempts）】
1. **启发式规则引擎“一刀切死逃弃子”导致的自杀性崩盘 (已彻底解决)**：
   - *教训*：旧版在 `isDeadEscapeMove` 中未判断块大小，直接将 14 子大龙当孤子弃掉；
   - *解法*：重构 `isDeadEscapeMove`，确立“凡 3 子及以上大块大龙绝境中绝不弃子”铁律，并依托 KataGo 策略先验引导逃跑。
2. **onnxruntime-web 全家桶打包导致的体积膨胀 (已彻底解决)**：
   - *踩坑*：默认导入 `onnxruntime-web` 会将内置多套 wasm 编码进 base64，导致单文件 HTML 膨胀至 79 MB；
   - *解法*：通过 Vite alias 强制指定轻量版 `ort.wasm.min.mjs`（仅 53 KB），并将 14.8 MB 的 `ort-wasm-simd-threaded.wasm` 和 1.1 MB 模型作为外部静态资源由 Service Worker 独立预缓存，使核心 HTML 恢复至 554 kB 极致轻量。

---

## 【3. 跑通的成功经验（Successes & Key Patterns）】
1. **纯直觉 1-Pass 神经网络落子（毫秒级响应）**：
   - 18K 至 15K 段位对弈完全由单次前向（1-Pass Policy Network）接管，单步 35 至 65 毫秒，无多步搜索开销，低功耗、免发热。
2. **Softmax 温度阶梯单调性控制**：
   - 18K (τ=1.4) 呆萌机适度宽泛，17K (τ=1.1) 巡逻机紧凑，16K (τ=0.8) 哨兵机严密，15K (τ=0.35) 冲锋机极度锐利，形成完美的 101 同款进阶手感。
3. **PWA 双轨离线架构**：
   - HTML 主界面与 UI 单文件内联，大型网络权重与 WebAssembly 二进制文件由 Service Worker 异步预缓存，断网也能瞬间秒开。

---

## 【4. 交付状态与验证记录（Delivery Status）】
- [x] 模型与推理集成完成并通过测试
- [x] 101 机器人天梯换装完成
- [x] PWA 离线预缓存与版本升级完成
- [x] 78 项无头测试 100% 通过
- [x] npm run build 验证通过（单文件 554 kB）
