import { describe, it, expect } from 'vitest';
import { GoCore } from '../go-core';
import { GoNeuralEngine } from './neural-engine';
import { GoFeatureEncoder } from './feature-encoder';
import { NeuralMCTSEngine } from './neural-mcts';
import { GoAI } from '../go-ai';

describe('Neural Engine & Dragon Sovereign Upgrade Tests', () => {
  it('encodes 19x19 multi-channel feature tensors correctly', () => {
    const board = GoCore.createEmptyBoard(19);
    board.grid[3][3] = 'black';
    board.grid[3][15] = 'white';
    board.grid[15][3] = 'black';
    board.grid[15][15] = 'white';

    const tensor = GoFeatureEncoder.encodeFeatures(board, 'black');
    expect(tensor.length).toBe(10 * 19 * 19);

    // Channel 0 is friendly (black)
    const blackIdx1 = (0 * 19 + 3) * 19 + 3;
    expect(tensor[blackIdx1]).toBe(1.0);

    // Channel 1 is opponent (white)
    const whiteIdx1 = (1 * 19 + 3) * 19 + 15;
    expect(tensor[whiteIdx1]).toBe(1.0);
  });

  it('runs neural evaluation and generates valid policy and value', async () => {
    const board = GoCore.createEmptyBoard(19);
    const nn = GoNeuralEngine.getInstance();
    const output = await nn.evaluate(board, 'black');

    expect(output.policy.length).toBe(362);
    expect(output.value).toBeGreaterThanOrEqual(-1.0);
    expect(output.value).toBeLessThanOrEqual(1.0);

    // Policy should sum to ~1.0
    const sumPolicy = output.policy.reduce((acc, v) => acc + v, 0);
    expect(sumPolicy).toBeGreaterThan(0.95);
    expect(sumPolicy).toBeLessThan(1.05);

    // Golden corners (3-3 / 4-4) should have high probability
    const starPointIdx = 3 * 19 + 3;
    expect(output.policy[starPointIdx]).toBeGreaterThan(0.005);
  });

  it('performs neural MCTS search and returns top-tier strategic move', async () => {
    const board = GoCore.createEmptyBoard(19);
    // Black played star point (3, 3)
    board.grid[3][3] = 'black';
    board.turn = 'white';

    const result = await NeuralMCTSEngine.searchBestMove(board, 'white', 50, 200, 0.05);
    expect(result.move).not.toBeNull();
    expect(result.visits).toBeGreaterThan(10);
    expect(result.winrate).toBeGreaterThan(0.2);
    expect(result.winrate).toBeLessThan(0.8);
  });

  it('verifies Grandmaster Dragon never prematurely surrenders in 19x19 midgame', () => {
    const board = GoCore.createEmptyBoard(19);
    // Simulate black having surrounded a huge chunk of board, but white still has spaces
    for (let x = 0; x < 19; x++) {
      board.grid[9][x] = 'black';
    }
    board.turn = 'white';
    board.captures.black = 4;
    board.captures.white = 0;

    const move = GoAI.getBestMove(board, 'white', {
      difficulty: 'grandmaster',
      sparringLevel: 'grandmaster',
    });

    // In midgame, Dragon MUST NOT pass! It must invade and fight tenaciously!
    expect(move, 'Dragon Sovereign must not give up in midgame').not.toBeNull();
  });
});
