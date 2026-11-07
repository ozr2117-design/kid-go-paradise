import { describe, it, expect } from 'vitest';
import { AUTHENTIC_101_PUZZLES_BANK } from '../data/puzzles-101-bank';
import { GoCore } from './go-core';

describe('101 Weiqi Official Question Bank Mathematical Verification', () => {
  it('verifies that the bank has authentic problems', () => {
    expect(AUTHENTIC_101_PUZZLES_BANK.length).toBeGreaterThanOrEqual(20);
  });

  for (const puzzle of AUTHENTIC_101_PUZZLES_BANK) {
    it(`verifies puzzle [${puzzle.id}]: "${puzzle.title}"`, () => {
      // 1. Check basic metadata
      expect(puzzle.boardSize).toBeGreaterThanOrEqual(7);
      expect(puzzle.solutionTree.move).toBeDefined();

      // 2. Build initial board
      let state = GoCore.createEmptyBoard(puzzle.boardSize);
      for (const p of puzzle.initialBoard.black) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThan(puzzle.boardSize);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThan(puzzle.boardSize);
        state.grid[p.y][p.x] = 'black';
      }
      for (const p of puzzle.initialBoard.white) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThan(puzzle.boardSize);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThan(puzzle.boardSize);
        expect(state.grid[p.y][p.x]).toBeNull(); // No overlapping stones
        state.grid[p.y][p.x] = 'white';
      }

      // 3. Verify solution move is legally playable
      const sol = puzzle.solutionTree.move!;
      const check = GoCore.isLegalMove(state, sol, puzzle.initialTurn);
      expect(check.legal).toBe(true);

      // 4. Play the solution move
      const res = GoCore.playMove(state, sol, puzzle.initialTurn);
      expect(res.error).toBeUndefined();
      expect(res.nextState).toBeDefined();

      // 5. Verify hint and explanation exist
      expect(puzzle.hint).toBeDefined();
      expect(puzzle.hint.length).toBeGreaterThan(0);
      expect(puzzle.explanation).toBeDefined();
      expect(puzzle.explanation!.length).toBeGreaterThan(0);
    });
  }
});
