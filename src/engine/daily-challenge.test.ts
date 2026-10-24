import { describe, it, expect } from 'vitest';
import { GoCore } from './go-core';
import { getDaily15Puzzles, WEEKLY_THEMES } from '../data/daily-challenges';

describe('Daily 15 Tsumego Challenge Tests', () => {
  it('should generate exactly 15 valid puzzles for any day of the week', () => {
    for (let day = 0; day <= 6; day++) {
      // Simulate different days
      const dateStr = `2026-10-2${day}`;
      const { theme, puzzles } = getDaily15Puzzles(dateStr);

      expect(theme).toBeDefined();
      expect(puzzles.length).toBe(15);

      // Verify each puzzle has valid initial board & valid solution move
      for (const p of puzzles) {
        expect(p.id).toBeDefined();
        expect(p.boardSize).toBeGreaterThanOrEqual(9);
        expect(p.solutionTree.move).toBeDefined();

        let board = GoCore.createEmptyBoard(p.boardSize);
        for (const b of p.initialBoard.black) {
          board.grid[b.y][b.x] = 'black';
        }
        for (const w of p.initialBoard.white) {
          board.grid[w.y][w.x] = 'white';
        }
        board.turn = p.initialTurn;

        const sol = p.solutionTree.move!;
        const legalCheck = GoCore.isLegalMove(board, sol, p.initialTurn);
        expect(legalCheck.legal, `Puzzle ${p.id} solution move is illegal: ${legalCheck.reason}`).toBe(true);
      }
    }
  });

  it('Handicap Go generation for 13x13 and 19x19', () => {
    // 13x13
    const h2_13 = GoCore.createHandicapBoard(13, 2);
    expect(h2_13.turn).toBe('white');
    expect(h2_13.grid[3][9]).toBe('black');
    expect(h2_13.grid[9][3]).toBe('black');

    const h4_13 = GoCore.createHandicapBoard(13, 4);
    expect(h4_13.turn).toBe('white');
    expect(h4_13.grid[3][3]).toBe('black');
    expect(h4_13.grid[9][9]).toBe('black');

    // 19x19
    const h4_19 = GoCore.createHandicapBoard(19, 4);
    expect(h4_19.turn).toBe('white');
    expect(h4_19.grid[3][3]).toBe('black');
    expect(h4_19.grid[15][15]).toBe('black');

    const h9_19 = GoCore.createHandicapBoard(19, 9);
    expect(h9_19.turn).toBe('white');
    expect(h9_19.grid[9][9]).toBe('black'); // tengen
  });

  it('Territory mapping returns correct regions', () => {
    let board = GoCore.createEmptyBoard(9);
    // Black surrounds top-left corner (0,0) with stones at (1,0) and (0,1)
    board.grid[0][1] = 'black';
    board.grid[1][0] = 'black';

    const map = GoCore.getTerritoryMap(board);
    expect(map.blackPoints.some((p) => p.x === 0 && p.y === 0)).toBe(true);
  });
});
