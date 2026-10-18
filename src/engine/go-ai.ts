import { BoardState, Color, Point } from '../types/go';
import { GoCore } from './go-core';

export type AIDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface AIMoveOptions {
  difficulty: AIDifficulty;
  captureTarget?: number;
}

export class GoAI {
  /**
   * Find the best move for the given color and difficulty
   */
  static getBestMove(
    state: BoardState,
    color: Color = state.turn,
    options: AIMoveOptions = { difficulty: 'beginner' }
  ): Point | null {
    if (state.isGameOver) return null;

    const size = state.size;
    const opponentColor: Color = color === 'black' ? 'white' : 'black';

    // 1. Gather all legal moves
    const legalMoves: Point[] = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (GoCore.isLegalMove(state, { x, y }, color).legal) {
          legalMoves.push({ x, y });
        }
      }
    }

    if (legalMoves.length === 0) {
      return null; // Pass
    }

    // 2. Beginner mode (萌萌兔 25K):
    // 40% chance of making a casual exploration move (encourages the kid to find captures)
    if (options.difficulty === 'beginner') {
      if (Math.random() < 0.4) {
        // Return a random legal move, preferably not completely in a corner
        const randomIndex = Math.floor(Math.random() * legalMoves.length);
        return legalMoves[randomIndex];
      }
    }

    // 3. Evaluate each legal move with kid-friendly heuristics
    let bestMove: Point | null = null;
    let highestScore = -Infinity;

    // Shuffle moves slightly for non-deterministic fun
    const shuffled = [...legalMoves].sort(() => Math.random() - 0.5);

    for (const move of shuffled) {
      const score = this.evaluateMove(state, move, color, opponentColor, options);
      if (score > highestScore) {
        highestScore = score;
        bestMove = move;
      }
    }

    return bestMove ?? shuffled[0];
  }

  /**
   * Heuristic score evaluation of a single move
   */
  private static evaluateMove(
    state: BoardState,
    move: Point,
    color: Color,
    opponentColor: Color,
    options: AIMoveOptions
  ): number {
    let score = 0;
    const size = state.size;

    // Simulate the move
    const sim = GoCore.playMove(state, move, color, options.captureTarget);
    if (sim.error) return -9999;

    const capturedCount = sim.captured.length;

    // Rule 1: Capturing opponent stones is highly prioritized!
    if (capturedCount > 0) {
      score += capturedCount * 500;
      // In capture battle mode, immediate victory is absolute top priority
      if (
        options.captureTarget &&
        sim.nextState.captures[color] >= options.captureTarget
      ) {
        return 100000;
      }
    }

    // Rule 2: Save own stones in Atari (打吃救子)
    const myGroupAfter = GoCore.findGroup(sim.nextState.grid, move);
    if (myGroupAfter) {
      const libertiesAfter = myGroupAfter.liberties.length;

      // If the move itself lands in Atari (1 liberty) and captures nothing, that's dangerous!
      if (libertiesAfter === 1 && capturedCount === 0) {
        if (options.difficulty === 'advanced') {
          score -= 300; // Advanced AI avoids walking into self-atari
        } else if (options.difficulty === 'intermediate') {
          score -= 150;
        } else {
          // Beginner AI might slip up occasionally
          score -= 50;
        }
      } else {
        // More liberties is generally safer and stronger
        score += Math.min(libertiesAfter, 4) * 20;
      }

      // Check if this move rescued neighboring friendly groups that had 1 liberty
      if (myGroupAfter.points.length > 1) {
        score += 80; // Connecting stones
      }
    }

    // Rule 3: Put opponent into Atari (打吃对方，创造吃子机会)
    const opponentNeighbors = GoCore.getNeighbors(move, size).filter(
      (n) => sim.nextState.grid[n.y][n.x] === opponentColor
    );
    for (const opp of opponentNeighbors) {
      const oppGroup = GoCore.findGroup(sim.nextState.grid, opp);
      if (oppGroup && oppGroup.liberties.length === 1) {
        // We put opponent in Atari!
        score += 150;
      }
    }

    // Rule 4: Board position preference (Central control & star points on 7x7 / 9x9)
    const centerX = (size - 1) / 2;
    const centerY = (size - 1) / 2;
    const distFromCenter = Math.abs(move.x - centerX) + Math.abs(move.y - centerY);
    score -= distFromCenter * 5; // Slight bias towards center

    // Avoid first line (edge death line) in early game unless capturing
    const isEdgeLine =
      move.x === 0 || move.x === size - 1 || move.y === 0 || move.y === size - 1;
    if (isEdgeLine && capturedCount === 0 && state.moveHistory.length < 8) {
      score -= 40;
    }

    return score;
  }
}
