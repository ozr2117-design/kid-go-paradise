import { describe, it, expect } from 'vitest';
import { GoCore } from './go-core';
import { GoAI } from './go-ai';

/**
 * 针对 v9.4 三处修复的回归测试：
 * 1. 第一期：吃子模式下 sparringLevel → difficulty 难度映射（novice/club 不再落到最强龙档）
 * 2. 第二期 2b：吃子体系（龙档 2-ply 极小极大）无棋可下时不再硬塞自填真眼的烂棋
 */
describe('GoAI capture-mode regression (v9.4)', () => {
  it('every sparringLevel returns a legal move in capture mode (no tier fallthrough crash)', () => {
    let board = GoCore.createEmptyBoard(13);
    board = GoCore.playMove(board, { x: 3, y: 3 }, 'black').nextState;
    board = GoCore.playMove(board, { x: 4, y: 3 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 3, y: 4 }, 'black').nextState;

    const levels = ['novice', 'club', 'master', 'grandmaster'] as const;
    for (const lvl of levels) {
      const move = GoAI.getBestMove(board, 'white', {
        sparringLevel: lvl,
        captureTarget: 5,
      });
      expect(move, `sparringLevel=${lvl} 应返回落子`).not.toBeNull();
      if (move) {
        expect(GoCore.isLegalMove(board, move, 'white').legal, `sparringLevel=${lvl} 落子应合法`).toBe(true);
      }
    }
  });

  it('capture mode maps sparringLevel onto the same branch as an explicit difficulty', () => {
    // 难度映射回归（v9.4 修复的 bug）：sparringLevel 必须被显式翻译成合法难度，
    // 而不是 as AIDifficulty 硬转后落到 default（= 最强龙档）。
    const mapping: Record<string, string> = {
      novice: 'advanced',        // 老鸟 → 狐
      club: 'master',            // 战灵狐 → 鹰
      master: 'grandmaster',     // 麒麟 → 龙
      grandmaster: 'grandmaster', // 龙尊 → 龙
    };

    const buildBoard = (variant: number) => {
      let board = GoCore.createEmptyBoard(13);
      board = GoCore.playMove(board, { x: 5, y: 5 }, 'black').nextState;
      board = GoCore.playMove(board, { x: 5, y: 4 }, 'white').nextState;
      board = GoCore.playMove(board, { x: 6, y: 5 }, 'black').nextState;
      board = GoCore.playMove(board, { x: 4, y: 4 }, 'white').nextState;
      board = GoCore.playMove(board, { x: 4, y: 5 }, 'black').nextState;
      board = GoCore.playMove(board, { x: 6, y: 6 }, 'white').nextState;
      if (variant === 1) {
        board = GoCore.playMove(board, { x: 3, y: 6 }, 'black').nextState;
        board = GoCore.playMove(board, { x: 7, y: 4 }, 'white').nextState;
        board = GoCore.playMove(board, { x: 2, y: 8 }, 'black').nextState;
      }
      return board;
    };

    for (const variant of [0, 1]) {
      const board = buildBoard(variant);
      for (const [lvl, diff] of Object.entries(mapping)) {
        const viaLevel = GoAI.getBestMove(board, 'black', {
          sparringLevel: lvl as 'novice' | 'club' | 'master' | 'grandmaster',
          captureTarget: 5,
        });
        const viaDiff = GoAI.getBestMove(board, 'black', {
          difficulty: diff as 'advanced' | 'master' | 'grandmaster',
          captureTarget: 5,
        });
        const fmt = (m: { x: number; y: number } | null) => (m ? `${m.x},${m.y}` : 'PASS');
        expect(fmt(viaLevel), `board${variant} sparringLevel=${lvl} 应等价于 difficulty=${diff}`).toBe(
          fmt(viaDiff)
        );
      }
    }
  });

  it('never gifts a stone: passes when every legal move would be self-atari', () => {
    // v9.5 修复：吃子模式下 AI 不能「一颗一颗送子」——所有候选都只剩 1 口气时，
    // 必须停手，而不是硬下一手给对手白吃（这正是孩子能秒下连吃几十子的根因）。
    let board = GoCore.createEmptyBoard(7);
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        board.grid[y][x] = 'white';
      }
    }
    board.grid[3][3] = null;
    board.grid[3][4] = null; // 白棋只剩两个互相成气的空点，填任何一个都是自叫吃
    board.turn = 'white';

    const move = GoAI.getBestMove(board, 'white', {
      sparringLevel: 'grandmaster',
      captureTarget: 5,
    });

    expect(move).toBeNull();
  });

  it('Dragon (grandmaster) in capture mode passes instead of self-filling a true eye (2b)', () => {
    let board = GoCore.createEmptyBoard(7);
    // 填满白子，只留 (3,3) 一个空点，且它是白棋唯一真眼
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        board.grid[y][x] = 'white';
      }
    }
    board.grid[3][3] = null;
    board.turn = 'white';

    const move = GoAI.getBestMove(board, 'white', {
      sparringLevel: 'grandmaster',
      captureTarget: 5, // 走吃子体系（而非全盘 isFullGame）
    });

    // 唯一合法落点 (3,3) 是自填真眼，AI 必须停手（返回 null），而不是硬塞烂棋
    expect(move).toBeNull();
  });
});
