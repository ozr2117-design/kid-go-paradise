import { describe, it, expect } from 'vitest';
import { PcKataGoClient } from './pc-katago-client';
import { GoCore } from './go-core';
import { GoAI } from './go-ai';

describe('PcKataGoClient & Contact Fight Defense', () => {
  it('probeStatus connects to local KataGo server daemon', async () => {
    const isOnline = await PcKataGoClient.probeStatus();
    expect(isOnline).toBe(true);
  });

  it('generates a move via PC KataGo Human-SL when available', async () => {
    const board = GoCore.createEmptyBoard(13);
    const withMove = GoCore.playMove(board, { x: 3, y: 3 }, 'black').nextState;

    const aiMove = await GoAI.getBestMoveAsync(withMove, 'white', {
      sparringLevel: '18k',
      isFullGame: true,
    });

    expect(aiMove).not.toBeNull();
    if (aiMove) {
      expect(aiMove.x).toBeGreaterThanOrEqual(0);
      expect(aiMove.x).toBeLessThan(13);
      expect(aiMove.y).toBeGreaterThanOrEqual(0);
      expect(aiMove.y).toBeLessThan(13);
    }
  }, 15000);

  it('anti-tenuki defense: local AI does NOT tenuki to empty corners when under immediate contact pressure', () => {
    // Recreate the exact board state from today's game #50:
    // Move 1: B plays (3, 3)
    // Move 2: W plays (15, 17)
    // Move 3: B plays (16, 17) touching W's stone directly
    let b = GoCore.createEmptyBoard(19);
    b = GoCore.playMove(b, { x: 3, y: 3 }, 'black').nextState;
    b = GoCore.playMove(b, { x: 15, y: 17 }, 'white').nextState;
    b = GoCore.playMove(b, { x: 16, y: 17 }, 'black').nextState;

    // White should respond locally or defend its 3-liberty stone rather than playing in an empty corner
    const wMove = GoAI.getBestMove(b, 'white', {
      sparringLevel: '15k',
      isFullGame: true,
    });

    expect(wMove).not.toBeNull();
    if (wMove) {
      // Must NOT play tenuki in the top-left or other far empty corners (x < 10, y < 10)
      const distToCorner = Math.abs(wMove.x - 15) + Math.abs(wMove.y - 17);
      expect(distToCorner).toBeLessThanOrEqual(5);
    }
  });
});
