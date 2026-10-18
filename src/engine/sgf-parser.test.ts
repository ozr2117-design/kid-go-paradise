import { describe, it, expect } from 'vitest';
import { SGFParser } from './sgf-parser';

describe('SGFParser', () => {
  it('converts between board points and SGF coordinates', () => {
    const p = { x: 2, y: 3 }; // 'c' is 2, 'd' is 3
    const coord = SGFParser.pointToCoord(p);
    expect(coord).toBe('cd');

    const back = SGFParser.coordToPoint(coord);
    expect(back).toEqual(p);
  });

  it('correctly parses an SGF string with initial stones and size', () => {
    const sampleSGF = `(;GM[1]FF[4]SZ[9]GN[吃子练习]AB[ba][bb]AW[cb][cc];B[ca])`;
    const puzzle = SGFParser.parseSGFToPuzzle(sampleSGF, 'test-1');

    expect(puzzle.boardSize).toBe(9);
    expect(puzzle.title).toBe('吃子练习');
    expect(puzzle.initialBoard.black).toContainEqual({ x: 1, y: 0 }); // 'ba' -> x:1, y:0
    expect(puzzle.initialBoard.black).toContainEqual({ x: 1, y: 1 }); // 'bb' -> x:1, y:1
    expect(puzzle.initialBoard.white).toContainEqual({ x: 2, y: 1 }); // 'cb' -> x:2, y:1
    expect(puzzle.solutionTree.move).toEqual({ x: 2, y: 0 }); // 'ca' -> x:2, y:0
  });

  it('exports game moves to valid SGF string', () => {
    const history = [
      { x: 3, y: 3, color: 'black' as const },
      { x: 3, y: 4, color: 'white' as const },
    ];
    const sgf = SGFParser.exportToSGF(7, history);
    expect(sgf).toContain('SZ[7]');
    expect(sgf).toContain(';B[dd]');
    expect(sgf).toContain(';W[de]');
  });
});
