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

  it('capture mode maps each sparringLevel to a DISTINCT tier (difficulty ladder restored)', () => {
    // 用一个中盘局面：黑棋在 (5,4) 的子处于被打吃边缘，白棋有多个可选应手。
    // 修复前 novice/club 全落到龙档，行为与 grandmaster 相同；修复后应各自走不同档位。
    let board = GoCore.createEmptyBoard(13);
    board = GoCore.playMove(board, { x: 5, y: 5 }, 'black').nextState;
    board = GoCore.playMove(board, { x: 5, y: 4 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 6, y: 5 }, 'black').nextState;
    board = GoCore.playMove(board, { x: 4, y: 4 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 4, y: 5 }, 'black').nextState;
    board = GoCore.playMove(board, { x: 6, y: 6 }, 'white').nextState;

    const byLevel = (lvl: string) => {
      const m = GoAI.getBestMove(board, 'black', {
        sparringLevel: lvl as 'novice' | 'club' | 'master' | 'grandmaster',
        captureTarget: 5,
      });
      return m ? `${m.x},${m.y}` : null;
    };

    const novice = byLevel('novice');
    const club = byLevel('club');
    const master = byLevel('master');
    const grandmaster = byLevel('grandmaster');

    // 至少要有两个档位落点不同，证明映射真的生效（不再是全员同点）。
    const distinct = new Set([novice, club, master, grandmaster]).size;
    expect(distinct, `各档位落点：novice=${novice} club=${club} master=${master} grandmaster=${grandmaster}`).toBeGreaterThan(1);
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
