import * as ort from 'onnxruntime-web/wasm';
import { BoardState, Color, Point } from '../../types/go';
import { GoCore } from '../go-core';

export interface KataGoPrediction {
  policy: Float32Array; // 362 elements
  value: number; // -1.0 to 1.0 (winrate from current player perspective)
  bestMove: Point | null;
  inferenceTimeMs: number;
}

export type RobotTier = '18k' | '17k' | '16k' | '15k';

export class KataGoONNXEngine {
  private static instance: KataGoONNXEngine | null = null;
  private session: ort.InferenceSession | null = null;
  private initPromise: Promise<void> | null = null;

  static getInstance(): KataGoONNXEngine {
    if (!this.instance) {
      this.instance = new KataGoONNXEngine();
    }
    return this.instance;
  }

  /**
   * Initialize ONNX Runtime Web session
   */
  async init(): Promise<void> {
    if (this.session) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        // Configure WASM paths for browser PWA
        if (typeof window !== 'undefined') {
          ort.env.wasm.wasmPaths = '/';
          ort.env.wasm.numThreads = 1;
        }

        let modelData: ArrayBuffer;
        if (typeof window !== 'undefined') {
          // In Browser PWA
          const response = await fetch('/models/katago-human-sl-18k-15k.onnx');
          modelData = await response.arrayBuffer();
        } else {
          // In Node / Headless Vitest
          const fs = await import('node:fs');
          const path = await import('node:path');
          const modelPath = path.resolve(process.cwd(), 'public/models/katago-human-sl-18k-15k.onnx');
          const buf = fs.readFileSync(modelPath);
          modelData = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
        }

        this.session = await ort.InferenceSession.create(modelData, {
          executionProviders: ['wasm'],
          graphOptimizationLevel: 'all',
        });
        // eslint-disable-next-line no-console
        console.log('[KataGo Human-SL] ONNX session initialized successfully');
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[KataGo Human-SL] Failed to load ONNX model via runtime, using fast tactical prior fallback:', err);
      }
    })();

    return this.initPromise;
  }

  /**
   * Encode board into 12-channel 19x19 tensor:
   * 0: friendly stones
   * 1: opponent stones
   * 2: friendly 1-liberty stones (atari)
   * 3: opponent 1-liberty stones (atari)
   * 4: friendly 2-liberty stones
   * 5: opponent 2-liberty stones
   * 6: friendly 3-liberty stones
   * 7: opponent 3-liberty stones
   * 8: last move
   * 9: second last move
   * 10: edge distance / golden lines
   * 11: rank conditioning (18K: 0.0, 17K: 0.33, 16K: 0.66, 15K: 1.0)
   */
  encodeFeatures(state: BoardState, color: Color, tier: RobotTier = '18k'): Float32Array {
    const tensor = new Float32Array(12 * 19 * 19);
    const size = state.size;
    const oppColor: Color = color === 'black' ? 'white' : 'black';
    const padX = Math.floor((19 - size) / 2);
    const padY = Math.floor((19 - size) / 2);

    const offset = (c: number, x: number, y: number) => (c * 19 + y) * 19 + x;

    // Rank channel
    const rankVal = tier === '18k' ? 0.0 : tier === '17k' ? 0.33 : tier === '16k' ? 0.66 : 1.0;

    // Edge distance & Rank channels
    for (let y = 0; y < 19; y++) {
      for (let x = 0; x < 19; x++) {
        const edgeDist = Math.min(x, 18 - x, y, 18 - y);
        let edgeWeight = edgeDist / 9.0;
        if (edgeDist === 2 || edgeDist === 3) edgeWeight += 0.5; // 3rd & 4th golden lines
        tensor[offset(10, x, y)] = edgeWeight;
        tensor[offset(11, x, y)] = rankVal;
      }
    }

    // Grid features & group analysis
    const visited = new Set<string>();
    for (let cy = 0; cy < size; cy++) {
      for (let cx = 0; cx < size; cx++) {
        const stone = state.grid[cy][cx];
        if (!stone) continue;

        const tx = cx + padX;
        const ty = cy + padY;

        if (stone === color) {
          tensor[offset(0, tx, ty)] = 1.0;
        } else {
          tensor[offset(1, tx, ty)] = 1.0;
        }

        const key = `${cx},${cy}`;
        if (!visited.has(key)) {
          const grp = GoCore.findGroup(state.grid, { x: cx, y: cy });
          if (grp) {
            const libs = grp.liberties.length;
            const isFriendly = grp.color === color;
            for (const pt of grp.points) {
              visited.add(`${pt.x},${pt.y}`);
              const px = pt.x + padX;
              const py = pt.y + padY;
              if (isFriendly) {
                if (libs === 1) tensor[offset(2, px, py)] = 1.0;
                else if (libs === 2) tensor[offset(4, px, py)] = 1.0;
                else if (libs === 3) tensor[offset(6, px, py)] = 1.0;
              } else {
                if (libs === 1) tensor[offset(3, px, py)] = 1.0;
                else if (libs === 2) tensor[offset(5, px, py)] = 1.0;
                else if (libs === 3) tensor[offset(7, px, py)] = 1.0;
              }
            }
          }
        }
      }
    }

    // History
    const hist = state.moveHistory || [];
    if (hist.length >= 1) {
      const lm = hist[hist.length - 1];
      tensor[offset(8, lm.x + padX, lm.y + padY)] = 1.0;
    }
    if (hist.length >= 2) {
      const lm2 = hist[hist.length - 2];
      tensor[offset(9, lm2.x + padX, lm2.y + padY)] = 1.0;
    }

    return tensor;
  }

  /**
   * 1-Pass Policy Network Forward Inference (Direct Intuition)
   */
  async predict(state: BoardState, color: Color, tier: RobotTier = '18k'): Promise<KataGoPrediction> {
    const startTime = performance.now();
    await this.init();

    const size = state.size;
    const padX = Math.floor((19 - size) / 2);
    const padY = Math.floor((19 - size) / 2);

    let rawLogits: Float32Array;
    let rawValue = 0.0;

    if (this.session) {
      const inputTensor = new ort.Tensor('float32', this.encodeFeatures(state, color, tier), [1, 12, 19, 19]);
      const results = await this.session.run({ features: inputTensor });
      rawLogits = (results.policy_logits.data as Float32Array).slice();
      rawValue = (results.value.data as Float32Array)[0];
    } else {
      // Fallback policy generator if session is unavailable
      rawLogits = new Float32Array(362);
      for (let cy = 0; cy < size; cy++) {
        for (let cx = 0; cx < size; cx++) {
          const tx = cx + padX;
          const ty = cy + padY;
          rawLogits[ty * 19 + tx] = Math.random() * 2.0;
        }
      }
    }

    // Mask illegal moves & boost vital tactical defense
    const candidates: { point: Point; logit: number }[] = [];
    let maxLogit = -Infinity;

    for (let cy = 0; cy < size; cy++) {
      for (let cx = 0; cx < size; cx++) {
        const pt: Point = { x: cx, y: cy };
        if (state.grid[cy][cx] !== null) continue;

        const check = GoCore.isLegalMove(state, pt, color);
        if (!check.legal) continue;

        // Never self-fill true eye
        if (GoCore.isTrueEye(state.grid, pt, color, size)) continue;

        const tx = cx + padX;
        const ty = cy + padY;
        let logit = rawLogits[ty * 19 + tx];

        // 1. Defend friendly groups in atari (CRITICAL: NEVER ABANDON DRAGON!)
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx >= 0 && nx < size && ny >= 0 && ny < size && state.grid[ny][nx] === color) {
            const grp = GoCore.findGroup(state.grid, { x: nx, y: ny });
            if (grp && grp.liberties.length === 1) {
              // Vital rescue move! Scale bonus by dragon size
              const groupSize = grp.points.length;
              logit += 25.0 + Math.min(50.0, groupSize * 4.0);
            }
          }
        }

        // 2. Immediate capture bonus
        const sim = GoCore.playMove(state, pt, color);
        if (!sim.error && sim.captured.length > 0) {
          logit += 20.0 + sim.captured.length * 3.0;
        }

        candidates.push({ point: pt, logit });
        if (logit > maxLogit) {
          maxLogit = logit;
        }
      }
    }

    if (candidates.length === 0) {
      return {
        policy: new Float32Array(362),
        value: rawValue,
        bestMove: null,
        inferenceTimeMs: performance.now() - startTime,
      };
    }

    // Rank temperature sampling
    // 18K: 1.4 (softer, occasional inaccuracy)
    // 17K: 1.1
    // 16K: 0.8
    // 15K: 0.35 (sharp, almost greedy)
    const tau = tier === '18k' ? 1.4 : tier === '17k' ? 1.1 : tier === '16k' ? 0.8 : 0.35;

    // Softmax over candidates
    let sumExp = 0;
    const expVals = candidates.map((c) => {
      const e = Math.exp((c.logit - maxLogit) / tau);
      sumExp += e;
      return e;
    });

    let bestMove: Point = candidates[0].point;
    if (tier === '15k' || tau <= 0.4) {
      // Greedy top 1 for 15K
      let bestIdx = 0;
      let highestLogit = -Infinity;
      candidates.forEach((c, i) => {
        if (c.logit > highestLogit) {
          highestLogit = c.logit;
          bestIdx = i;
        }
      });
      bestMove = candidates[bestIdx].point;
    } else {
      // Sample according to temperature
      let r = Math.random() * sumExp;
      for (let i = 0; i < candidates.length; i++) {
        r -= expVals[i];
        if (r <= 0) {
          bestMove = candidates[i].point;
          break;
        }
      }
    }

    const elapsed = performance.now() - startTime;
    return {
      policy: rawLogits,
      value: rawValue,
      bestMove,
      inferenceTimeMs: elapsed,
    };
  }
}
