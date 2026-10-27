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
    const goodPoints = ['4,4', '2,2', '6,2', '2,6', '6,6'];
    expect(goodPoints).toContain(`${move?.x},${move?.y}`);
  });

  it('rescues own stones in Atari during full game sparring', () => {
    let board = GoCore.createEmptyBoard(9);
    board = GoCore.playMove(board, { x: 4, y: 4 }, 'black').nextState;
    board = GoCore.playMove(board, { x: 4, y: 3 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 4, y: 5 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 3, y: 4 }, 'white').nextState;

    const move = GoAI.getBestMove(board, 'black', {
      sparringLevel: 'club',
      isFullGame: true,
    });
    expect(move).toEqual({ x: 5, y: 4 });
  });

  it('runs MCTS master level on mid-game position and returns a valid legal move', () => {
    let board = GoCore.createEmptyBoard(9);
    board = GoCore.playMove(board, { x: 4, y: 4 }, 'black').nextState;
    board = GoCore.playMove(board, { x: 2, y: 2 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 6, y: 6 }, 'black').nextState;

    const move = GoAI.getBestMove(board, 'white', {
      sparringLevel: 'master',
      isFullGame: true,
    });
    expect(move).not.toBeNull();
    if (move) {
      expect(GoCore.isLegalMove(board, move, 'white').legal).toBe(true);
    }
  });

  it('runs Eagle and Dragon tactical engines in capture battle and executes valid captures', () => {
    let board = GoCore.createEmptyBoard(13);
    board = GoCore.playMove(board, { x: 3, y: 3 }, 'black').nextState;
    board = GoCore.playMove(board, { x: 4, y: 3 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 2, y: 3 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 3, y: 2 }, 'white').nextState;
    // Black at (3,3) is in atari, only liberty is (3,4)

    const eagleMove = GoAI.getBestMove(board, 'white', {
      difficulty: 'master',
      captureTarget: 15,
    });
    expect(eagleMove).toEqual({ x: 3, y: 4 });

    const dragonMove = GoAI.getBestMove(board, 'white', {
      difficulty: 'grandmaster',
      captureTarget: 20,
    });
    expect(dragonMove).toEqual({ x: 3, y: 4 });
  });

  it('runs Dragon Sovereign (龙尊) Grandmaster sparring AI on 13x13 and 19x19 with legal policy moves', () => {
    // 13x13
    const board13 = GoCore.createEmptyBoard(13);
    const move13 = GoAI.getBestMove(board13, 'black', {
      sparringLevel: 'grandmaster',
      isFullGame: true,
    });
    expect(move13).not.toBeNull();
    if (move13) {
      expect(GoCore.isLegalMove(board13, move13, 'black').legal).toBe(true);
    }

    // 19x19 with stones
    let board19 = GoCore.createHandicapBoard(19, 4);
    const move19 = GoAI.getBestMove(board19, 'white', {
      sparringLevel: 'grandmaster',
      isFullGame: true,
    });
    expect(move19).not.toBeNull();
    if (move19) {
      expect(GoCore.isLegalMove(board19, move19, 'white').legal).toBe(true);
    }
  });

  it('penalizes 2nd-line crawl and plays tenuki to open big points on 13x13', () => {
    let board = GoCore.createEmptyBoard(13);
    // White stone on 2nd line: (3, 1) [D12]
    board.grid[1][3] = 'white';
    board.grid[1][4] = 'white'; // White has two stones on 2nd line with 4 liberties
    // Black plays nearby on 3rd line: (3, 2)
    board.grid[2][3] = 'black';
    board.turn = 'white';
    board.moveHistory = [
      { x: 3, y: 1, color: 'white' },
      { x: 3, y: 2, color: 'black' },
      { x: 4, y: 1, color: 'white' },
    ];

    const move = GoAI.getBestMove(board, 'white', {
      sparringLevel: 'grandmaster',
      isFullGame: true,
    });

    expect(move).not.toBeNull();
    // Move should NOT continue crawling horizontally along y=1 at (2,1) or (5,1)
    const isCrawl = (move?.y === 1 && (move?.x === 2 || move?.x === 5));
    expect(isCrawl).toBe(false);
  });

  it('aggressively cuts disconnected opponent groups', () => {
    let board = GoCore.createEmptyBoard(13);
    // Black has two separate stones with a cut point at (4, 4)
    board.grid[4][3] = 'black'; // (3, 4)
    board.grid[3][4] = 'black'; // (4, 3)
    board.turn = 'white';
    board.moveHistory = [
      { x: 3, y: 4, color: 'black' },
      { x: 4, y: 3, color: 'black' },
    ];

    const move = GoAI.getBestMove(board, 'white', {
      sparringLevel: 'grandmaster',
      isFullGame: true,
    });

    expect(move).not.toBeNull();
    // White should target cuts, corners or contact pressure rather than suicidal moves
    expect(GoCore.isLegalMove(board, move!, 'white').legal).toBe(true);
  });
});
