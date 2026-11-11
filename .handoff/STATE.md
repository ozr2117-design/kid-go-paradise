# Current State & Handover

## Active Features & Capabilities
1. **PC KataGo Human-SL Daemon (192.168.10.135:8765)**:
   - Official KataGo v1.15.3 Eigen AVX2 engine running with full 18-block 384-channel network + `b18c384nbt-humanv0.bin.gz` imitation model.
   - Dynamic parameter setting (`kata-set-param humanSLProfile rank_18k` / `rank_15k`) without reloading neural weights.
   - Dual serving: provides `/api/move` & `/api/status` endpoints with CORS, and serves the static production frontend from `dist/` directly for offline LAN play.
2. **Frontend LAN Auto-Detection (`src/engine/pc-katago-client.ts`)**:
   - `FullGameSparringView.tsx` shows dynamic indicator badge:
     - 🟢 `PC满血算力` (when reachable)
     - ⚪ `单机模式` (smooth fallback to local ONNX / MCTS tactical engine)
3. **Tactical Contact Fight Anti-Tenuki Safeguard (`src/engine/go-ai.ts`)**:
   - Implemented `isFriendlyStoneUnderContactPressure`: if opponent moves adjacent to a friendly stone with <= 3 liberties, opening macro tenuki (+480) is suppressed, and local tactical response (+520) is enforced.
   - Completely resolved the opening corner isolation bug from today's game #50 and #51.

## Test Status
- 140/140 unit and integration tests passing (`vitest run src/`).
- Master pushed to GitHub `origin/master` (commit `70dd2f7`).
