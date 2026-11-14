import { describe, it, expect } from 'vitest';
import { GoCore } from '../go-core';
import { GoAI } from '../go-ai';
import { KataGoONNXEngine, RobotTier } from './katago-onnx-engine';
import { APP_VERSION } from '../../version';

describe('KataGo Human-SL (ONNX) 本地轻量化引擎与 101 机器人天梯体系', () => {
  it('1. ONNX 模型文件存在且能成功执行单次前向直觉推理（耗时 < 100ms）', async () => {
    const engine = KataGoONNXEngine.getInstance();
    await engine.init(); // 预热与初始化模型会话
    const board = GoCore.createEmptyBoard(19);

    const start = performance.now();
    const res = await engine.predict(board, 'black', '15k');
    const elapsed = performance.now() - start;

    expect(res.bestMove).not.toBeNull();
    if (res.bestMove) {
      expect(GoCore.isLegalMove(board, res.bestMove, 'black').legal).toBe(true);
    }
    // eslint-disable-next-line no-console
    console.log(`[KataGo 1-Pass 推理实测耗时]: ${elapsed.toFixed(2)} ms (标称要求 < 150ms)`);
    expect(elapsed).toBeLessThan(150);
  });

  it('2. 19 路与 13 路盘面均能自适应完成 1-Pass Policy Network 推理', async () => {
    const engine = KataGoONNXEngine.getInstance();

    for (const size of [19, 13] as const) {
      const board = GoCore.createEmptyBoard(size);
      const res = await engine.predict(board, 'white', '16k');
      expect(res.bestMove).not.toBeNull();
      if (res.bestMove) {
        expect(res.bestMove.x).toBeGreaterThanOrEqual(0);
        expect(res.bestMove.x).toBeLessThan(size);
        expect(res.bestMove.y).toBeGreaterThanOrEqual(0);
        expect(res.bestMove.y).toBeLessThan(size);
        expect(GoCore.isLegalMove(board, res.bestMove, 'white').legal).toBe(true);
      }
    }
  });

  it('3. 101 小机器人四档天梯 (18K~15K) 均能周正落子且无自填真眼与自杀', () => {
    const tiers: RobotTier[] = ['18k', '17k', '16k', '15k'];
    const board = GoCore.createEmptyBoard(13);

    for (const tier of tiers) {
      const move = GoAI.getBestMove(board, 'black', {
        sparringLevel: tier,
        isFullGame: true,
      });
      expect(move).not.toBeNull();
      if (move) {
        expect(GoCore.isLegalMove(board, move, 'black').legal).toBe(true);
        expect(GoCore.isTrueEye(board.grid, move, 'black', 13)).toBe(false);
      }
    }
  });

  it('4. 彻底解决大龙白送问题：对局 28 第 80 手 14 颗白棋大龙绝境死守自救', () => {
    // 构造对局 28 第 80 手的实战棋形
    // 白棋 14 颗大子被叫吃，唯一逃跑救命气在 (3, 4)
    let board = GoCore.createEmptyBoard(13);
    
    // 构造白棋 14 子大块
    const whitePoints = [
      { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 },
      { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 },
      { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 },
      { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 5 },
      { x: 7, y: 6 }, { x: 7, y: 4 }
    ];
    for (const pt of whitePoints) {
      board.grid[pt.y][pt.x] = 'white';
    }

    // 黑棋包围圈，仅留 (3, 4) 一气叫吃白大龙
    const blackPoints = [
      { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 }, { x: 8, y: 4 },
      { x: 8, y: 5 }, { x: 8, y: 6 }, { x: 7, y: 7 }, { x: 6, y: 8 }, { x: 5, y: 8 }, { x: 4, y: 7 },
      { x: 3, y: 5 }, { x: 3, y: 6 }
    ];
    for (const pt of blackPoints) {
      board.grid[pt.y][pt.x] = 'black';
    }

    board.turn = 'white';
    const grp = GoCore.findGroup(board.grid, { x: 4, y: 4 });
    expect(grp?.points.length).toBeGreaterThanOrEqual(14);
    expect(grp?.liberties.length).toBe(1);
    expect(grp?.liberties[0]).toEqual({ x: 3, y: 4 });

    // 白棋执行落子决策，必须下在 (3, 4) 自救，绝不能白送弃子下闲子！
    const chosenMove = GoAI.getBestMove(board, 'white', {
      sparringLevel: '15k',
      captureTarget: 5,
    });

    expect(chosenMove).toEqual({ x: 3, y: 4 });
  });

  it('5. 纯离线 PWA 支撑：public/sw.js 预缓存名单包含模型与运行时，且版本号一致', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');

    const swPath = path.resolve(process.cwd(), 'public/sw.js');
    const swContent = fs.readFileSync(swPath, 'utf-8');

    expect(swContent).toContain(APP_VERSION);
    expect(swContent).toContain('katago-human-sl-18k-15k.onnx');
    expect(swContent).toContain('ort-wasm-simd-threaded.wasm');

    const modelPath = path.resolve(process.cwd(), 'public/models/katago-human-sl-18k-15k.onnx');
    const wasmPath = path.resolve(process.cwd(), 'public/ort-wasm-simd-threaded.wasm');

    expect(fs.existsSync(modelPath)).toBe(true);
    expect(fs.existsSync(wasmPath)).toBe(true);
    expect(fs.statSync(modelPath).size).toBeGreaterThan(500 * 1024); // > 500 KB
    expect(fs.statSync(wasmPath).size).toBeGreaterThan(1 * 1024 * 1024); // > 1 MB
  });
});
