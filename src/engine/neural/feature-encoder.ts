import { BoardState, Color, Point } from '../../types/go';
import { GoCore } from '../go-core';

export const NUM_FEATURE_CHANNELS = 10;

/**
 * Encodes a 19x19 (or smaller) board state into multi-channel tensor features [channels, 19, 19]
 * Standard AlphaGo / KataGo style spatial feature planes:
 * 0: friendly stones
 * 1: opponent stones
 * 2: friendly atari stones (1 liberty)
 * 3: opponent atari stones (1 liberty)
 * 4: friendly 2 liberties
 * 5: opponent 2 liberties
 * 6: last move location
 * 7: 2nd to last move location
 * 8: board edge distance (radial gradient / distance to border)
 * 9: constant 1.0 plane (bias)
 */
export class GoFeatureEncoder {
  static encodeFeatures(
    state: BoardState,
    color: Color = state.turn
  ): Float32Array {
    const targetSize = 19;
    const currentSize = state.size;
    const oppColor: Color = color === 'black' ? 'white' : 'black';
    const totalFloats = NUM_FEATURE_CHANNELS * targetSize * targetSize;
    const tensor = new Float32Array(totalFloats);

    const offset = (channel: number, x: number, y: number) => {
      return (channel * targetSize + y) * targetSize + x;
    };

    // Constant bias plane
    for (let y = 0; y < targetSize; y++) {
      for (let x = 0; x < targetSize; x++) {
        tensor[offset(9, x, y)] = 1.0;
        // Edge distance plane: 0 at edge, higher towards center
        const edgeDist = Math.min(x, 18 - x, y, 18 - y) / 9.0;
        tensor[offset(8, x, y)] = edgeDist;
      }
    }

    // Offset coordinates if current board size is smaller than 19 (e.g. 9 or 13 placed in corner/center)
    const padX = Math.floor((targetSize - currentSize) / 2);
    const padY = Math.floor((targetSize - currentSize) / 2);

    // Group analysis for liberties
    const visited = new Set<string>();

    for (let cy = 0; cy < currentSize; cy++) {
      for (let cx = 0; cx < currentSize; cx++) {
        const stone = state.grid[cy][cx];
        if (!stone) continue;

        const tx = cx + padX;
        const ty = cy + padY;

        if (stone === color) {
          tensor[offset(0, tx, ty)] = 1.0;
        } else {
          tensor[offset(1, tx, ty)] = 1.0;
        }

        const key = `${cx},${cy}`;
        if (!visited.has(key)) {
          const grp = GoCore.findGroup(state.grid, { x: cx, y: cy });
          if (grp) {
            for (const pt of grp.points) {
              visited.add(`${pt.x},${pt.y}`);
              const px = pt.x + padX;
              const py = pt.y + padY;
              const libs = grp.liberties.length;
              if (grp.color === color) {
                if (libs === 1) tensor[offset(2, px, py)] = 1.0;
                else if (libs === 2) tensor[offset(4, px, py)] = 1.0;
              } else {
                if (libs === 1) tensor[offset(3, px, py)] = 1.0;
                else if (libs === 2) tensor[offset(5, px, py)] = 1.0;
              }
            }
          }
        }
      }
    }

    // Last 2 moves history
    const hist = state.moveHistory || [];
    if (hist.length >= 1) {
      const lm = hist[hist.length - 1];
      tensor[offset(6, lm.x + padX, lm.y + padY)] = 1.0;
    }
    if (hist.length >= 2) {
      const lm2 = hist[hist.length - 2];
      tensor[offset(7, lm2.x + padX, lm2.y + padY)] = 1.0;
    }

    return tensor;
  }
}
