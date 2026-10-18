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

/**
 * Monte Carlo Tree Search Node
 */
class MCTSNode {
  move: Point | null; // null for root or pass
  color: Color;
  parent: MCTSNode | null;
  children: MCTSNode[] = [];
  untriedMoves: Point[];
  visits = 0;
  wins = 0;

  constructor(
    move: Point | null,
    color: Color,
    parent: MCTSNode | null,
    untriedMoves: Point[]
  ) {
    this.move = move;
    this.color = color;
    this.parent = parent;
    this.untriedMoves = untriedMoves;
  }

  get uctValue(): number {
    if (this.visits === 0) return Infinity;
    const parentVisits = this.parent ? this.parent.visits : 1;
    const exploitation = this.wins / this.visits;
    const exploration = 1.414 * Math.sqrt(Math.log(parentVisits) / this.visits);
    return exploitation + exploration;
  }
}

export class GoAI {
  /**
   * Main Entry: Choose best move using MCTS or Tactical Engine based on level
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
    const legalMoves = this.getFastLegalMoves(state, color);
    if (legalMoves.length === 0) return null;

    // 2. Absolute Urgent Tactical Moves (急所): Immediate capture of opponent groups
    const instantCaptures = this.findImmediateCaptures(state, color, legalMoves);
    if (options.captureTarget && instantCaptures.length > 0) {
      // In capture race mode, always take the immediate capture
      return instantCaptures[0];
    }

    // 3. Level-specific Routing:
    const level: AISparringLevel =
      options.sparringLevel ||
      (options.difficulty === 'advanced'
        ? 'master'
        : options.difficulty === 'intermediate'
        ? 'club'
        : 'novice');

    // Level A: Novice (~20K) - 35% chance to play friendly loose moves
    if (level === 'novice') {
      if (Math.random() < 0.35) {
        const safe = legalMoves.filter(
          (m) => m.x > 0 && m.x < size - 1 && m.y > 0 && m.y < size - 1
        );
        return safe.length > 0
          ? safe[Math.floor(Math.random() * safe.length)]
          : legalMoves[Math.floor(Math.random() * legalMoves.length)];
      }
      return this.getTacticalHeuristicMove(state, color, opponentColor, legalMoves, options);
    }

    // Level B: Club (~10K) - Tactical Engine (Double atari, ladder check, cut/connect, eyes)
    if (level === 'club') {
      return this.getTacticalHeuristicMove(state, color, opponentColor, legalMoves, options);
    }

    // Level C: Master (5K ~ 1D) - High Performance MCTS (Monte Carlo Tree Search)
    // Run 350-500 rollouts with rapid heuristic-guided rollouts
    const mctsIterations = size === 9 ? 450 : size === 13 ? 250 : 120;
    return this.runMCTS(state, color, opponentColor, legalMoves, mctsIterations, options);
  }

  /**
   * ==========================================
   * 1. MONTE CARLO TREE SEARCH (MCTS) ENGINE
   * ==========================================
   */
  private static runMCTS(
    rootState: BoardState,
    aiColor: Color,
    oppColor: Color,
    legalMoves: Point[],
    iterations: number,
    options: AIMoveOptions
  ): Point | null {
    const startTime = Date.now();
    const maxTimeMs = 450; // Cap execution at 450ms for zero UI lag

    // Prioritize high-value opening book if early in the game on standard board
    const moveNumber = rootState.moveHistory.length;
    const hasEmergency = this.hasUrgentAtari(rootState, aiColor, oppColor);
    if (!hasEmergency && !options.captureTarget && moveNumber < (rootState.size === 9 ? 6 : 14)) {
      const opening = this.getOpeningBookMove(rootState, legalMoves);
      if (opening) return opening;
    }

    // Sort untried moves by quick heuristic so MCTS expands promising moves first
    const sortedUntried = [...legalMoves].sort((a, b) => {
      return (
        this.quickEval(rootState, b, aiColor, oppColor) -
        this.quickEval(rootState, a, aiColor, oppColor)
      );
    });

    const root = new MCTSNode(null, oppColor, null, sortedUntried);

    for (let iter = 0; iter < iterations; iter++) {
      if (Date.now() - startTime > maxTimeMs) break;

      // 1. Selection
      let node = root;
      let simState = GoCore.cloneState(rootState);

      while (node.untriedMoves.length === 0 && node.children.length > 0) {
        node = this.selectBestUCTChild(node);
        if (node.move) {
          const res = GoCore.playMove(simState, node.move, node.color, options.captureTarget);
          simState = res.nextState;
        }
      }

      // 2. Expansion
      if (node.untriedMoves.length > 0) {
        const move = node.untriedMoves.shift()!;
        const nextColor = node.color === 'black' ? 'white' : 'black';
        const res = GoCore.playMove(simState, move, nextColor, options.captureTarget);
        simState = res.nextState;

        const childLegal = this.getFastLegalMoves(simState, node.color);
        const childNode = new MCTSNode(move, nextColor, node, childLegal);
        node.children.push(childNode);
        node = childNode;
      }

      // 3. Rollout / Simulation
      const winResult = this.fastRollout(simState, node.color, aiColor, options);

      // 4. Backpropagation
      let curr: MCTSNode | null = node;
      while (curr !== null) {
        curr.visits++;
        if (winResult) {
          curr.wins += 1;
        }
        curr = curr.parent;
      }
    }

    if (root.children.length === 0) return legalMoves[0];

    // Pick child with highest visit count (most battle-tested move)
    root.children.sort((a, b) => b.visits - a.visits);
    return root.children[0].move;
  }

  private static selectBestUCTChild(node: MCTSNode): MCTSNode {
    let best = node.children[0];
    let maxUCT = -Infinity;
    for (const child of node.children) {
      const val = child.uctValue;
      if (val > maxUCT) {
        maxUCT = val;
        best = child;
      }
    }
    return best;
  }

  /**
   * Fast Heuristic-Guided Rollout
   */
  private static fastRollout(
    startState: BoardState,
    currentColor: Color,
    aiColor: Color,
    options: AIMoveOptions
  ): boolean {
    let state = startState;
    let turn: Color = currentColor === 'black' ? 'white' : 'black';
    const maxPlayoutSteps = 16;

    for (let step = 0; step < maxPlayoutSteps; step++) {
      if (state.isGameOver) break;

      const opp: Color = turn === 'black' ? 'white' : 'black';
      const legal = this.getFastLegalMoves(state, turn);
      if (legal.length === 0) break;

      // Heuristic pick: instant capture or save
      let chosen: Point = legal[0];
      const captures = this.findImmediateCaptures(state, turn, legal);
      if (captures.length > 0) {
        chosen = captures[0];
      } else {
        // Pick best of 3 random moves
        let bestVal = -Infinity;
        const candidates = legal.length <= 3 ? legal : [
          legal[Math.floor(Math.random() * legal.length)],
          legal[Math.floor(Math.random() * legal.length)],
          legal[Math.floor(Math.random() * legal.length)],
        ];

        for (const cand of candidates) {
          const val = this.quickEval(state, cand, turn, opp);
          if (val > bestVal) {
            bestVal = val;
            chosen = cand;
          }
        }
      }

      const res = GoCore.playMove(state, chosen, turn, options.captureTarget);
      state = res.nextState;
      turn = opp;
    }

    // Score evaluation
    if (options.captureTarget) {
      const myCaps = state.captures[aiColor];
      const oppColor: Color = aiColor === 'black' ? 'white' : 'black';
      const oppCaps = state.captures[oppColor];
      return myCaps >= options.captureTarget || myCaps > oppCaps;
    }

    const est = GoCore.estimateTerritory(state);
    const komi = state.size === 19 ? 7.5 : state.size === 13 ? 5.5 : 3.5;
    const aiScore = aiColor === 'black' ? est.black : est.white + komi;
    const oppScore = aiColor === 'black' ? est.white + komi : est.black;
    return aiScore > oppScore;
  }

  /**
   * ==========================================
   * 2. DEEP TACTICAL COMBAT ENGINE (CLUB LEVEL)
   * ==========================================
   */
  private static getTacticalHeuristicMove(
    state: BoardState,
    color: Color,
    opponentColor: Color,
    legalMoves: Point[],
    options: AIMoveOptions
  ): Point | null {
    const size = state.size;

    // 1. Immediate Double Atari (双打吃 - One stone threatens two separate groups)
    const doubleAtaris = this.findDoubleAtariMoves(state, color, legalMoves);
    if (doubleAtaris.length > 0) {
      return doubleAtaris[0];
    }

    // 2. Urgent rescue: Save friendly groups in Atari
    const rescues = this.findEscapeAtariMoves(state, color, legalMoves);
    if (rescues.length > 0) {
      return rescues[0];
    }

    // 3. Opening Book if early game and no emergency
    const hasEmergency = this.hasUrgentAtari(state, color, opponentColor);
    if (!hasEmergency && !options.captureTarget && state.moveHistory.length < (size === 9 ? 6 : 14)) {
      const opening = this.getOpeningBookMove(state, legalMoves);
      if (opening) return opening;
    }

    // 4. Score all legal moves with rich tactical weights
    let bestMove: Point | null = null;
    let maxScore = -Infinity;

    for (const move of legalMoves) {
      const score = this.evaluateDeepTactics(state, move, color, opponentColor, options);
      if (score > maxScore) {
        maxScore = score;
        bestMove = move;
      }
    }

    return bestMove ?? legalMoves[0];
  }

  /**
   * Deep Tactical Evaluation
   */
  private static evaluateDeepTactics(
    state: BoardState,
    move: Point,
    color: Color,
    oppColor: Color,
    options: AIMoveOptions
  ): number {
    let score = 0;
    const size = state.size;

    const sim = GoCore.playMove(state, move, color, options.captureTarget);
    if (sim.error) return -99999;

    const captured = sim.captured.length;
    if (captured > 0) {
      score += captured * 700;
      if (options.captureTarget && sim.nextState.captures[color] >= options.captureTarget) {
        return 1000000; // Immediate win in capture mode
      }
    }

    const myGroup = GoCore.findGroup(sim.nextState.grid, move);
    if (!myGroup) return -99999;
    const myLibs = myGroup.liberties.length;

    // Self-Atari penalty
    if (myLibs === 1 && captured === 0) {
      return -12000;
    } else if (myLibs === 2) {
      score += 40;
    } else if (myLibs >= 3) {
      score += Math.min(myLibs, 5) * 60;
    }

    // Rescuing stones in Atari
    const neighborsFriendly = GoCore.getNeighbors(move, size).filter(
      (n) => state.grid[n.y][n.x] === color
    );
    for (const fn of neighborsFriendly) {
      const orig = GoCore.findGroup(state.grid, fn);
      if (orig && orig.liberties.length === 1) {
        score += orig.points.length * 1000;
      }
    }

    // Threatening opponent stones (Atari & Semiai tightening)
    const neighborsOpp = GoCore.getNeighbors(move, size).filter(
      (n) => sim.nextState.grid[n.y][n.x] === oppColor
    );
    for (const on of neighborsOpp) {
      const oppGrp = GoCore.findGroup(sim.nextState.grid, on);
      if (oppGrp) {
        if (oppGrp.liberties.length === 1) {
          score += oppGrp.points.length * 600;
        } else if (oppGrp.liberties.length === 2) {
          score += 180;
        }
      }
    }

    // Cutting and connecting
    if (neighborsFriendly.length >= 2) score += 220; // Bamboo / solid connection
    if (neighborsOpp.length >= 2) score += 280; // Powerful cutting move!

    // Line 3 (Territory) & Line 4 (Influence)
    const dEdge = Math.min(move.x, size - 1 - move.x, move.y, size - 1 - move.y);
    if (dEdge === 2 || dEdge === 3) {
      score += 100;
    } else if (dEdge === 0 && captured === 0 && state.moveHistory.length < size * 3) {
      score -= 300; // Death line
    }

    // Eye shape creation (两眼活棋)
    const diagonals = [
      { x: move.x - 1, y: move.y - 1 },
      { x: move.x + 1, y: move.y - 1 },
      { x: move.x - 1, y: move.y + 1 },
      { x: move.x + 1, y: move.y + 1 },
    ].filter((p) => GoCore.isInside(p, size));

    let diagFriendly = 0;
    for (const d of diagonals) {
      if (sim.nextState.grid[d.y][d.x] === color) diagFriendly++;
    }
    if (diagFriendly >= 2) score += 80;

    return score;
  }

  /**
   * Fast evaluation for rollout selection
   */
  private static quickEval(state: BoardState, move: Point, color: Color, oppColor: Color): number {
    let score = 0;
    const sim = GoCore.playMove(state, move, color);
    if (sim.error) return -9999;
    if (sim.captured.length > 0) score += sim.captured.length * 400;

    const grp = GoCore.findGroup(sim.nextState.grid, move);
    if (grp) {
      if (grp.liberties.length === 1 && sim.captured.length === 0) return -8000;
      score += grp.liberties.length * 20;
    }
    return score;
  }

  /**
   * Helper: Find immediate captures of 1-liberty groups
   */
  private static findImmediateCaptures(
    state: BoardState,
    color: Color,
    legalMoves: Point[]
  ): Point[] {
    const list: Point[] = [];
    const oppColor: Color = color === 'black' ? 'white' : 'black';

    for (const move of legalMoves) {
      for (const n of GoCore.getNeighbors(move, state.size)) {
        if (state.grid[n.y][n.x] === oppColor) {
          const group = GoCore.findGroup(state.grid, n);
          if (group && group.liberties.length === 1 && GoCore.pointsEqual(group.liberties[0], move)) {
            list.push(move);
            break;
          }
        }
      }
    }
    return list;
  }

  /**
   * Helper: Find double atari moves (simultaneously putting 2 opponent groups into Atari)
   */
  private static findDoubleAtariMoves(
    state: BoardState,
    color: Color,
    legalMoves: Point[]
  ): Point[] {
    const oppColor: Color = color === 'black' ? 'white' : 'black';
    const list: Point[] = [];

    for (const move of legalMoves) {
      const sim = GoCore.playMove(state, move, color);
      if (sim.error) continue;

      let atariCount = 0;
      const checked = new Set<string>();
      for (const n of GoCore.getNeighbors(move, state.size)) {
        if (sim.nextState.grid[n.y][n.x] === oppColor) {
          const grp = GoCore.findGroup(sim.nextState.grid, n);
          if (grp && grp.liberties.length === 1) {
            const key = `${grp.points[0].x},${grp.points[0].y}`;
            if (!checked.has(key)) {
              checked.add(key);
              atariCount++;
            }
          }
        }
      }

      if (atariCount >= 2) {
        list.push(move);
      }
    }
    return list;
  }

  /**
   * Helper: Find moves that rescue friendly groups in Atari
   */
  private static findEscapeAtariMoves(
    state: BoardState,
    color: Color,
    legalMoves: Point[]
  ): Point[] {
    const list: Point[] = [];
    const size = state.size;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (state.grid[y][x] === color) {
          const group = GoCore.findGroup(state.grid, { x, y });
          if (group && group.liberties.length === 1) {
            const escapePoint = group.liberties[0];
            // Check if playing escape point gives at least 2 liberties or captures opponent
            if (legalMoves.some((m) => GoCore.pointsEqual(m, escapePoint))) {
              const sim = GoCore.playMove(state, escapePoint, color);
              if (!sim.error) {
                const escapedGroup = GoCore.findGroup(sim.nextState.grid, escapePoint);
                if (escapedGroup && (escapedGroup.liberties.length >= 2 || sim.captured.length > 0)) {
                  list.push(escapePoint);
                }
              }
            }
          }
        }
      }
    }
    return list;
  }

  /**
   * Helper: Check if any group is in Atari
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
            for (const p of group.points) checked.add(`${p.x},${p.y}`);
            if (group.liberties.length === 1) return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Fast legal moves generator
   */
  static getFastLegalMoves(state: BoardState, color: Color): Point[] {
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
   * Opening Book: Corner stars and center points
   */
  private static getOpeningBookMove(state: BoardState, legalMoves: Point[]): Point | null {
    const size = state.size;
    const stars: Point[] = [];

    if (size === 9) {
      stars.push(
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
      stars.push(
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
      stars.push(
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

    for (const pt of stars) {
      if (state.grid[pt.y][pt.x] === null && legalMoves.some((m) => GoCore.pointsEqual(m, pt))) {
        return pt;
      }
    }
    return null;
  }
}
