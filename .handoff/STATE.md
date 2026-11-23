# 全局状态与交接档案 (STATE.md)

## 1. 全局目标与当前总进度 (Overview & Progress)
- **阶段目标**：围绕 11 月 28 日考级与棋院 19 路吃子大赛，为孩子（森森，大三班）打造全功能、高童趣的少儿围棋自适应训练系统。
- **本次会话完成事项 (v9.55)**：
  1. **吃子大赛「双核融合引擎」上线**：
     - 完美解决“纯吃子战偏弱、纯 PC 全盘 AI 对弈过强”的断层问题；
     - 在 `src/engine/go-ai.ts` 中为 16K 哨兵机与 15K 冲锋机启用双核融合：第一层本地生死战术护盾（提吃、反提、逃跑、大龙 2 气绝境、双打吃攻防）0 延时锁底线杜绝脱先送子；第二层常规棋形与中盘缠斗交给 PC 端满血 KataGo Human-SL（16K 调用 `rank_20k`，15K 调用 `rank_18k`），PC 离线自动降级纯本地恶狼引擎。
  2. **默认首页直达吃子大战 + 内置周六冲刺每日练习计划**：
     - `src/App.tsx` 默认入口切换为「吃子大战 (`battle`)」；
     - `src/components/CaptureBattleView.tsx` 默认选中 16K 哨兵机，新增 PC 双核实时连线徽标，并内置「周六大赛每日冲刺计划（3至4局）」一键开练面板。
  3. **PC KataGo 守护引擎重启就绪**：
     - 后台重启 `katago_server/server.py`（当前任务号：`task-674`），监听 `192.168.10.135:8765`，验证 `/api/status` 返回 `ok: True`。
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
