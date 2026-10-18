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
    board = GoCore.playMove(board, { x: 0, y: 0 }, 'black').nextState;
    board = GoCore.playMove(board, { x: 1, y: 0 }, 'white').nextState;

    const move = GoAI.getBestMove(board, 'white', {
      difficulty: 'advanced',
      captureTarget: 1,
    });
    expect(move).toEqual({ x: 0, y: 1 }); // must capture!
  });

  it('plays high-value corner or center opening in full game mode on 9x9 board', () => {
    const board = GoCore.createEmptyBoard(9);
    const move = GoAI.getBestMove(board, 'black', {
      sparringLevel: 'master',
      isFullGame: true,
    });
    expect(move).not.toBeNull();
    // Should choose center (4,4) or a star point like (2,2), (6,2), etc.
    const goodPoints = ['4,4', '2,2', '6,2', '2,6', '6,6'];
    expect(goodPoints).toContain(`${move?.x},${move?.y}`);
  });

  it('rescues own stones in Atari during full game sparring', () => {
    let board = GoCore.createEmptyBoard(9);
    // Black at (4,4), White at (4,3), (4,5), (3,4).
    // Black only has liberty at (5,4).
    board = GoCore.playMove(board, { x: 4, y: 4 }, 'black').nextState;
    board = GoCore.playMove(board, { x: 4, y: 3 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 4, y: 5 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 3, y: 4 }, 'white').nextState;

    // Black's turn to save itself
    const move = GoAI.getBestMove(board, 'black', {
      sparringLevel: 'club',
      isFullGame: true,
    });
    expect(move).toEqual({ x: 5, y: 4 });
  });
});
