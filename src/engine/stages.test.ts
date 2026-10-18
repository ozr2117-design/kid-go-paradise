import { describe, it, expect } from 'vitest';
import { ADVENTURE_STAGES } from '../data/stages';
import { GoCore } from './go-core';

describe('Adventure Stages Validation (All 6 Chapters & 24 Puzzles)', () => {
  it('should have exactly 6 chapters', () => {
    expect(ADVENTURE_STAGES.length).toBe(6);
  });

  it('Chapter 1 should contain the 6 real digitized homework problems', () => {
    const ch1 = ADVENTURE_STAGES[0];
    expect(ch1.id).toBe(1);
    expect(ch1.puzzles.length).toBe(6);
  });

  ADVENTURE_STAGES.forEach((stage) => {
    describe(`Stage ${stage.id}: ${stage.title}`, () => {
      stage.puzzles.forEach((puzzle) => {
        it(`Puzzle ${puzzle.id} (${puzzle.title}) must have a legal initial board and valid solution move`, () => {
          let board = GoCore.createEmptyBoard(puzzle.boardSize);

          // Place black stones
          for (const b of puzzle.initialBoard.black) {
            expect(b.x).toBeGreaterThanOrEqual(0);
            expect(b.x).toBeLessThan(puzzle.boardSize);
            expect(b.y).toBeGreaterThanOrEqual(0);
            expect(b.y).toBeLessThan(puzzle.boardSize);
            expect(board.grid[b.y][b.x]).toBeNull();
            board.grid[b.y][b.x] = 'black';
          }

          // Place white stones
          for (const w of puzzle.initialBoard.white) {
            expect(w.x).toBeGreaterThanOrEqual(0);
            expect(w.x).toBeLessThan(puzzle.boardSize);
            expect(w.y).toBeGreaterThanOrEqual(0);
            expect(w.y).toBeLessThan(puzzle.boardSize);
            expect(board.grid[w.y][w.x]).toBeNull();
            board.grid[w.y][w.x] = 'white';
          }

          board.turn = puzzle.initialTurn;

          // Verify solution move
          const solMove = puzzle.solutionTree.move;
          expect(solMove).toBeDefined();
          if (solMove) {
            const check = GoCore.isLegalMove(board, solMove, puzzle.initialTurn);
            expect(check.legal, `Puzzle ${puzzle.id} move (${solMove.x}, ${solMove.y}) is illegal: ${check.reason}`).toBe(true);

            // Execute move
            const res = GoCore.playMove(board, solMove, puzzle.initialTurn);
            expect(res.nextState.grid[solMove.y][solMove.x]).toBe(puzzle.initialTurn);
          }
        });
      });
    });
  });
});
