import { describe, it, expect } from 'vitest';
import { GoCore } from './go-core';
import { Point } from '../types/go';

describe('GoCore Rule Engine', () => {
  it('creates an empty 9x9 board with correct initial state', () => {
    const board = GoCore.createEmptyBoard(9);
    expect(board.size).toBe(9);
    expect(board.turn).toBe('black');
    expect(board.captures.black).toBe(0);
    expect(board.captures.white).toBe(0);
    expect(board.isGameOver).toBe(false);
    expect(board.grid[0][0]).toBeNull();
  });

  it('calculates 4 liberties for an isolated center stone on 9x9 board', () => {
    let board = GoCore.createEmptyBoard(9);
    const { nextState } = GoCore.playMove(board, { x: 4, y: 4 }, 'black');
    const group = GoCore.findGroup(nextState.grid, { x: 4, y: 4 });
    expect(group).not.toBeNull();
    expect(group?.liberties.length).toBe(4);
    expect(group?.points.length).toBe(1);
  });

  it('calculates 2 liberties for a corner stone and 3 for an edge stone', () => {
    let board = GoCore.createEmptyBoard(9);
    let { nextState } = GoCore.playMove(board, { x: 0, y: 0 }, 'black'); // corner
    let cornerGroup = GoCore.findGroup(nextState.grid, { x: 0, y: 0 });
    expect(cornerGroup?.liberties.length).toBe(2);

    let { nextState: board2 } = GoCore.playMove(board, { x: 4, y: 0 }, 'black'); // edge
    let edgeGroup = GoCore.findGroup(board2.grid, { x: 4, y: 0 });
    expect(edgeGroup?.liberties.length).toBe(3);
  });

  it('correctly captures a single stone surrounded on 4 sides (提子)', () => {
    let board = GoCore.createEmptyBoard(9);
    // Black at (4,4)
    board = GoCore.playMove(board, { x: 4, y: 4 }, 'black').nextState;

    // White surrounds black: (4,3), (4,5), (3,4), (5,4)
    board = GoCore.playMove(board, { x: 4, y: 3 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 4, y: 5 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 3, y: 4 }, 'white').nextState;

    // Fourth move captures black
    const result = GoCore.playMove(board, { x: 5, y: 4 }, 'white');
    expect(result.captured.length).toBe(1);
    expect(result.captured[0]).toEqual({ x: 4, y: 4 });
    expect(result.nextState.grid[4][4]).toBeNull(); // Stone was removed
    expect(result.nextState.captures.white).toBe(1);
  });

  it('prevents suicide moves when no opponent stone is captured', () => {
    let board = GoCore.createEmptyBoard(9);
    // White occupies (4,3), (4,5), (3,4), (5,4)
    board = GoCore.playMove(board, { x: 4, y: 3 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 4, y: 5 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 3, y: 4 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 5, y: 4 }, 'white').nextState;

    // Black playing at (4,4) has 0 liberties and captures no white stones -> illegal suicide
    const check = GoCore.isLegalMove(board, { x: 4, y: 4 }, 'black');
    expect(check.legal).toBe(false);
    expect(check.reason).toContain('自杀');
  });

  it('handles simple Ko rule (打劫禁着点)', () => {
    let board = GoCore.createEmptyBoard(9);
    // Setup Ko shape:
    // Black: (2,1), (1,2), (3,2), (2,3) -> center (2,2)
    // Actually standard minimal Ko:
    // Black at (1,0), (0,1), (1,2)
    // White at (2,0), (3,1), (2,2)
    // Black at (2,1) captures White at (1,1)
    const blackStones: Point[] = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 2 }];
    const whiteStones: Point[] = [{ x: 2, y: 0 }, { x: 3, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 1 }];

    for (const b of blackStones) board.grid[b.y][b.x] = 'black';
    for (const w of whiteStones) board.grid[w.y][w.x] = 'white';
    board.turn = 'black';

    // Black plays at (2,1) capturing White at (1,1)
    const res = GoCore.playMove(board, { x: 2, y: 1 }, 'black');
    expect(res.captured.length).toBe(1);
    expect(res.captured[0]).toEqual({ x: 1, y: 1 });
    expect(res.nextState.koPoint).toEqual({ x: 1, y: 1 });

    // White immediately trying to play back at (1,1) is illegal (Ko)
    const koCheck = GoCore.isLegalMove(res.nextState, { x: 1, y: 1 }, 'white');
    expect(koCheck.legal).toBe(false);
    expect(koCheck.reason).toContain('打劫');
  });

  it('triggers game over when capture target is reached in Capture Go mode', () => {
    let board = GoCore.createEmptyBoard(7);
    board = GoCore.playMove(board, { x: 0, y: 0 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 1, y: 0 }, 'black').nextState;

    // Corner capture of white: (0,1)
    const result = GoCore.playMove(board, { x: 0, y: 1 }, 'black', 1); // target = 1 stone
    expect(result.captured.length).toBe(1);
    expect(result.nextState.isGameOver).toBe(true);
    expect(result.nextState.winner).toBe('black');
  });
});
