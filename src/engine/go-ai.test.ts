import { describe, it, expect } from 'vitest';
import { GoCore } from './go-core';
import { GoAI } from './go-ai';

describe('GoAI Kid-Friendly Sparring Engine', () => {
  it('returns a valid legal move on an empty 7x7 board', () => {
    const board = GoCore.createEmptyBoard(7);
    const move = GoAI.getBestMove(board, 'white', { difficulty: 'intermediate' });
    expect(move).not.toBeNull();
    if (move) {
      expect(GoCore.isLegalMove(board, move, 'white').legal).toBe(true);
    }
  });

  it('greedily captures opponent in Atari under intermediate or advanced difficulty', () => {
    let board = GoCore.createEmptyBoard(7);
    // Put black stone at (0,0) in atari: white at (1,0)
    board = GoCore.playMove(board, { x: 0, y: 0 }, 'black').nextState;
    board = GoCore.playMove(board, { x: 1, y: 0 }, 'white').nextState;

    // Now white turn to move, liberty of (0,0) is (0,1)
    const move = GoAI.getBestMove(board, 'white', {
      difficulty: 'advanced',
      captureTarget: 1,
    });
    expect(move).toEqual({ x: 0, y: 1 }); // must capture!
  });
});
