import { BoardSize, BoardState, Color, Point } from '../types/go';
import { GoCore } from './go-core';

export type AIDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type AISparringLevel = 'novice' | 'club' | 'master';

export interface AIMoveOptions {
  difficulty?: AIDifficulty;
  sparringLevel?: AISparringLevel;
  captureTarget?: number;
  isFullGame?: boolean;
}

export class GoAI {
  /**
   * Main entry point: Get best move for either Capture Go or Full Game Go
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

    // 2. If Capture Go mode (with captureTarget)
    if (options.captureTarget && options.captureTarget > 0) {
      return this.getCaptureGoMove(state, color, opponentColor, legalMoves, options);
    }

    // 3. Full Standard Go Sparring Mode (全盘正规对弈)
    return this.getFullGameMove(state, color, opponentColor, legalMoves, options.sparringLevel || 'club');
  }

  /**
   * Capture Go (吃子战) Heuristic
   */
  private static getCaptureGoMove(
    state: BoardState,
    color: Color,
    opponentColor: Color,
    legalMoves: Point[],
    options: AIMoveOptions
  ): Point | null {
    const diff = options.difficulty || 'beginner';
    if (diff === 'beginner' && Math.random() < 0.4) {
      return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }

    let bestMove: Point | null = null;
    let highestScore = -Infinity;
    const shuffled = [...legalMoves].sort(() => Math.random() - 0.5);

    for (const move of shuffled) {
      const score = this.evaluateCaptureMove(state, move, color, opponentColor, options);
      if (score > highestScore) {
        highestScore = score;
        bestMove = move;
      }
    }

    return bestMove ?? shuffled[0];
  }

  /**
   * Full Game Go Sparring Heuristic Engine (急所大于大场，兼顾布局与局部杀气)
   */
  private static getFullGameMove(
    state: BoardState,
    color: Color,
    opponentColor: Color,
    legalMoves: Point[],
    level: AISparringLevel
  ): Point | null {
    const size = state.size;
    const moveNumber = state.moveHistory.length;

    // Check if there is an immediate tactical emergency (stones in Atari)
    const hasEmergency = this.hasUrgentAtari(state, color, opponentColor);

    // A. Early Fuseki / Opening Book (开局占角：仅在无局部紧急战斗时使用)
    if (!hasEmergency && moveNumber < (size === 9 ? 6 : size === 13 ? 12 : 20)) {
      const openingMove = this.getOpeningBookMove(state, color, legalMoves);
      if (openingMove && (level !== 'novice' || Math.random() < 0.6)) {
        return openingMove;
      }
    }

    // B. Novice level: occasionally makes intuitive light mistakes
    if (level === 'novice' && !hasEmergency && Math.random() < 0.35) {
      const safeMoves = legalMoves.filter(
        (m) => m.x > 0 && m.x < size - 1 && m.y > 0 && m.y < size - 1
      );
      if (safeMoves.length > 0) {
        return safeMoves[Math.floor(Math.random() * safeMoves.length)];
      }
    }

    // C. Candidate Move Scoring
    const candidatesWithScore = legalMoves.map((m) => ({
      point: m,
      score: this.evaluateFullGameMove(state, m, color, opponentColor, level),
    }));

    candidatesWithScore.sort((a, b) => b.score - a.score);

    // If best move has negative score and borders are closed in endgame, AI passes
    if (candidatesWithScore[0].score < -500 && moveNumber > size * size * 0.4) {
      return null; // Pass
    }

    // For Master level: 2-ply mini-max lookahead on top 5 moves
    if (level === 'master') {
      const topCandidates = candidatesWithScore.slice(0, 6);
      let bestLookaheadScore = -Infinity;
      let bestLookaheadMove: Point = topCandidates[0].point;

      for (const cand of topCandidates) {
        const sim = GoCore.playMove(state, cand.point, color);
        if (sim.error) continue;

        let worstOpponentReply = -Infinity;
        const oppLegal = this.getFastLegalMoves(sim.nextState, opponentColor);

        for (const oppMove of oppLegal) {
          const oppScore = this.evaluateFullGameMove(
            sim.nextState,
            oppMove,
            opponentColor,
            color,
            'club'
          );
          if (oppScore > worstOpponentReply) {
            worstOpponentReply = oppScore;
          }
        }

        const netScore = cand.score - worstOpponentReply * 0.7;
        if (netScore > bestLookaheadScore) {
          bestLookaheadScore = netScore;
          bestLookaheadMove = cand.point;
        }
      }

      return bestLookaheadMove;
    }

    return candidatesWithScore[0].point;
  }

  /**
   * Detect if any friendly group or opponent group is in Atari (1 liberty)
   */
  private static hasUrgentAtari(state: BoardState, color: Color, oppColor: Color): boolean {
    const size = state.size;
    const checked = new Set<string>();

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const c = state.grid[y][x];
        if (c !== null && !checked.has(`${x},${y}`)) {
          const group = GoCore.findGroup(state.grid, { x, y });
          if (group) {
            for (const p of group.points) {
              checked.add(`${p.x},${p.y}`);
            }
            if (group.liberties.length === 1) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Fast legal moves generator without full allocations
   */
  private static getFastLegalMoves(state: BoardState, color: Color): Point[] {
    const list: Point[] = [];
    const size = state.size;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (state.grid[y][x] === null && GoCore.isLegalMove(state, { x, y }, color).legal) {
          list.push({ x, y });
        }
      }
    }
    return list;
  }

  /**
   * Opening Book: Prefer corners (3-4, 4-4, 3-3) and center
   */
  private static getOpeningBookMove(
    state: BoardState,
    color: Color,
    legalMoves: Point[]
  ): Point | null {
    const size = state.size;
    const cornerStars: Point[] = [];

    if (size === 9) {
      cornerStars.push(
        { x: 4, y: 4 },
        { x: 2, y: 2 },
        { x: 6, y: 2 },
        { x: 2, y: 6 },
        { x: 6, y: 6 },
        { x: 4, y: 2 },
        { x: 2, y: 4 },
        { x: 6, y: 4 },
        { x: 4, y: 6 }
      );
    } else if (size === 13) {
      cornerStars.push(
        { x: 3, y: 3 },
        { x: 9, y: 3 },
        { x: 3, y: 9 },
        { x: 9, y: 9 },
        { x: 6, y: 6 },
        { x: 3, y: 4 },
        { x: 4, y: 3 },
        { x: 9, y: 4 },
        { x: 4, y: 9 }
      );
    } else if (size === 19) {
      cornerStars.push(
        { x: 3, y: 3 },
        { x: 15, y: 3 },
        { x: 3, y: 15 },
        { x: 15, y: 15 },
        { x: 3, y: 2 },
        { x: 2, y: 3 },
        { x: 15, y: 2 },
        { x: 2, y: 15 },
        { x: 9, y: 3 },
        { x: 3, y: 9 },
        { x: 15, y: 9 },
        { x: 9, y: 15 },
        { x: 9, y: 9 }
      );
    }

    for (const pt of cornerStars) {
      if (state.grid[pt.y][pt.x] === null && legalMoves.some((m) => GoCore.pointsEqual(m, pt))) {
        return pt;
      }
    }

    return null;
  }

  /**
   * Deep evaluation of a full game move
   */
  private static evaluateFullGameMove(
    state: BoardState,
    move: Point,
    color: Color,
    opponentColor: Color,
    level: AISparringLevel
  ): number {
    let score = 0;
    const size = state.size;

    // 1. Simulate Move
    const sim = GoCore.playMove(state, move, color);
    if (sim.error) return -99999;

    const capturedCount = sim.captured.length;
    if (capturedCount > 0) {
      score += capturedCount * 600;
    }

    // 2. Liberty Safety of Placed Stone's Group
    const myGroup = GoCore.findGroup(sim.nextState.grid, move);
    if (!myGroup) return -99999;

    const myLibs = myGroup.liberties.length;
    if (myLibs === 1 && capturedCount === 0) {
      return -8000; // Immediate suicide or self-atari is terrible
    } else if (myLibs === 2) {
      score += 40;
    } else if (myLibs >= 3) {
      score += Math.min(myLibs, 5) * 50;
    }

    // 3. Rescuing own stones in Atari (救子最优先)
    const originalNeighborFriendly = GoCore.getNeighbors(move, size).filter(
      (n) => state.grid[n.y][n.x] === color
    );
    for (const fn of originalNeighborFriendly) {
      const origGroup = GoCore.findGroup(state.grid, fn);
      if (origGroup && origGroup.liberties.length === 1) {
        score += origGroup.points.length * 800; // Major reward for saving stones in Atari
      }
    }

    // 4. Putting opponent into Atari or reducing opponent liberties
    const oppNeighbors = GoCore.getNeighbors(move, size).filter(
      (n) => sim.nextState.grid[n.y][n.x] === opponentColor
    );
    for (const on of oppNeighbors) {
      const oppGroup = GoCore.findGroup(sim.nextState.grid, on);
      if (oppGroup) {
        if (oppGroup.liberties.length === 1) {
          score += oppGroup.points.length * 500;
        } else if (oppGroup.liberties.length === 2) {
          score += 150;
        }
      }
    }

    // 5. Tactical Cut & Connect (分断与连接)
    if (originalNeighborFriendly.length >= 2) {
      score += 200;
    }
    if (oppNeighbors.length >= 2) {
      score += 260;
    }

    // 6. Eye Shape Creation & Territory
    const dEdgeX = Math.min(move.x, size - 1 - move.x);
    const dEdgeY = Math.min(move.y, size - 1 - move.y);
    const minEdgeDist = Math.min(dEdgeX, dEdgeY);

    if (minEdgeDist === 2 || minEdgeDist === 3) {
      score += 90;
    } else if (minEdgeDist === 0) {
      if (state.moveHistory.length < size * 3 && capturedCount === 0) {
        score -= 250;
      } else {
        score += 20;
      }
    }

    // 7. Eye Shape / Diagonal stones
    const diagonals = [
      { x: move.x - 1, y: move.y - 1 },
      { x: move.x + 1, y: move.y - 1 },
      { x: move.x - 1, y: move.y + 1 },
      { x: move.x + 1, y: move.y + 1 },
    ].filter((p) => GoCore.isInside(p, size));

    let friendlyDiag = 0;
    for (const d of diagonals) {
      if (sim.nextState.grid[d.y][d.x] === color) friendlyDiag++;
    }
    if (friendlyDiag >= 2) {
      score += 70;
    }

    return score;
  }

  /**
   * Fast evaluation for Capture Go
   */
  private static evaluateCaptureMove(
    state: BoardState,
    move: Point,
    color: Color,
    opponentColor: Color,
    options: AIMoveOptions
  ): number {
    let score = 0;
    const size = state.size;
    const sim = GoCore.playMove(state, move, color, options.captureTarget);
    if (sim.error) return -9999;

    const capturedCount = sim.captured.length;
    if (capturedCount > 0) {
      score += capturedCount * 600;
      if (options.captureTarget && sim.nextState.captures[color] >= options.captureTarget) {
        return 100000;
      }
    }

    const myGroupAfter = GoCore.findGroup(sim.nextState.grid, move);
    if (myGroupAfter) {
      const libertiesAfter = myGroupAfter.liberties.length;
      if (libertiesAfter === 1 && capturedCount === 0) {
        score -= 400;
      } else {
        score += libertiesAfter * 30;
      }
    }

    const opponentNeighbors = GoCore.getNeighbors(move, size).filter(
      (n) => sim.nextState.grid[n.y][n.x] === opponentColor
    );
    for (const opp of opponentNeighbors) {
      const oppGroup = GoCore.findGroup(sim.nextState.grid, opp);
      if (oppGroup && oppGroup.liberties.length === 1) {
        score += 200;
      }
    }

    return score;
  }
}
