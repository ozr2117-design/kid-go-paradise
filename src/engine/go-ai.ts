import { BoardSize, BoardState, Color, Point } from '../types/go';
import { GoCore } from './go-core';

export type AIDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'master' | 'grandmaster';
export type AISparringLevel = 'novice' | 'club' | 'master' | 'grandmaster';

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
   * Main Entry: Choose best move based on mode (Capture Battle vs Full Game Sparring)
   */
  static getBestMove(
    state: BoardState,
    color: Color = state.turn,
    options: AIMoveOptions = { difficulty: 'beginner' }
  ): Point | null {
    if (state.isGameOver) return null;

    const opponentColor: Color = color === 'black' ? 'white' : 'black';

    // 1. Gather all legal moves
    const legalMoves = this.getFastLegalMoves(state, color);
    if (legalMoves.length === 0) return null;

    // ========================================================
    // A. CAPTURE BATTLE SPECIALIZED TACTICAL ROUTING (吃子对战体系)
    // Strictly calibrated: Rabbit (Gentle) < Bear (Solid) < Fox (Sharp) < Eagle (Master) < Dragon (Grandmaster)
    // ========================================================
    if (options.captureTarget) {
      return this.getCaptureBattleMove(state, color, opponentColor, legalMoves, options);
    }

    // ========================================================
    // B. FULL GAME SPARRING ROUTING (全盘对弈体系)
    // ========================================================
    return this.getFullGameSparringMove(state, color, opponentColor, legalMoves, options);
  }

  /**
   * ==========================================
   * CAPTURE BATTLE TACTICAL ENGINE
   * ==========================================
   */
  private static getCaptureBattleMove(
    state: BoardState,
    color: Color,
    opponentColor: Color,
    legalMoves: Point[],
    options: AIMoveOptions
  ): Point | null {
    const diff = options.difficulty || 'beginner';

    // 1. 萌萌兔 (15K 练习练手 - 温和可爱，适度留破绽)
    if (diff === 'beginner') {
      return this.getRabbitCaptureMove(state, color, opponentColor, legalMoves, options);
    }

    // 2. 憨憨熊 (10K 警觉小将 - 基础扎实会逃跑，不主动双打偷袭)
    if (diff === 'intermediate') {
      return this.getBearCaptureMove(state, color, opponentColor, legalMoves, options);
    }

    // 3. 聪聪狐 (5K~1D 战术老手 - 真正老鸟！100%绝杀与主动双打吃)
    if (diff === 'advanced') {
      return this.getFoxCaptureMove(state, color, opponentColor, legalMoves, options);
    }

    // 4. 傲天鹰 (1D~2D 强力鹰王 - 征子追杀、大龙做活防死、分断要害)
    if (diff === 'master') {
      return this.getEagleCaptureMove(state, color, opponentColor, legalMoves, options);
    }

    // 5. 棋道龙 (3D~5D 终极龙神 - 深度战术搜索，攻防一体，终极考验)
    return this.getDragonCaptureMove(state, color, opponentColor, legalMoves, options);
  }

  /**
   * Level 1: 萌萌兔 🐰 (15K 练手伴读 - 真正适合孩子的初级对手)
   */
  private static getRabbitCaptureMove(
    state: BoardState,
    color: Color,
    oppColor: Color,
    legalMoves: Point[],
    options: AIMoveOptions
  ): Point | null {
    // 遇到孩子落单被叫吃，40%几率吃，60%几率走别的，给孩子留下容错自救空间
    const instantCaptures = this.findImmediateCaptures(state, color, legalMoves);
    if (instantCaptures.length > 0 && Math.random() < 0.4) {
      return instantCaptures[0];
    }

    // 自己被叫吃（1气）时，只有 35% 几率逃跑，65% 故意留破绽给孩子提吃，建立成就感！
    const rescues = this.findEscapeAtariMoves(state, color, legalMoves);
    if (rescues.length > 0 && Math.random() < 0.35) {
      return rescues[0];
    }

    // 温和走子：围绕已有棋子下在安全位置，不主动下双打吃
    return this.getGentlePlayMove(state, color, oppColor, legalMoves);
  }

  /**
   * Level 2: 憨憨熊 🐻 (10K 警觉小将 - 扎实基础对决)
   */
  private static getBearCaptureMove(
    state: BoardState,
    color: Color,
    oppColor: Color,
    legalMoves: Point[],
    options: AIMoveOptions
  ): Point | null {
    // 85% 几率吃掉眼前的落单子
    const instantCaptures = this.findImmediateCaptures(state, color, legalMoves);
    if (instantCaptures.length > 0 && Math.random() < 0.85) {
      return instantCaptures[0];
    }

    // 80% 几率自救逃跑
    const rescues = this.findEscapeAtariMoves(state, color, legalMoves);
    if (rescues.length > 0 && Math.random() < 0.8) {
      return rescues[0];
    }

    // 基础战术走子，不主动组织双打吃偷袭
    let bestMove: Point | null = null;
    let maxScore = -Infinity;
    for (const move of legalMoves) {
      const score = this.evaluateDeepTactics(state, move, color, oppColor, options);
      if (score > maxScore) {
        maxScore = score;
        bestMove = move;
      }
    }
    return bestMove ?? legalMoves[0];
  }

  /**
   * Level 3: 聪聪狐 🦊 (5K~1D 老鸟水平 - 真正的高手战术)
   */
  private static getFoxCaptureMove(
    state: BoardState,
    color: Color,
    oppColor: Color,
    legalMoves: Point[],
    options: AIMoveOptions
  ): Point | null {
    // 100% 紧抓吃子，100% 积极自救，主动发起双打吃并具备 2-ply 反杀防御
    return this.getAdvancedClubTacticalMove(state, color, oppColor, legalMoves, options);
  }

  /**
   * Level 4: 傲天鹰 🦅 (1D~2D 强力鹰王 - 征子、分断与大龙做活)
   */
  private static getEagleCaptureMove(
    state: BoardState,
    color: Color,
    oppColor: Color,
    legalMoves: Point[],
    options: AIMoveOptions
  ): Point | null {
    // 1. 优先提吃，提子数最多者优先
    const instantCaptures = this.findImmediateCaptures(state, color, legalMoves);
    if (instantCaptures.length > 0) {
      return this.pickBestCapture(state, instantCaptures, color);
    }

    // 2. 自救时识别死征子：如果逃跑后依然只有 1 气且周围全是敌人，果断弃子转向他处
    const rescues = this.findEscapeAtariMoves(state, color, legalMoves);
    if (rescues.length > 0) {
      for (const r of rescues) {
        const sim = GoCore.playMove(state, r, color);
        const grp = GoCore.findGroup(sim.nextState.grid, r);
        if (grp && grp.liberties.length >= 2) {
          return r;
        }
      }
      return rescues[0];
    }

    // 3. 积极发起双打吃
    const doubleAtaris = this.findDoubleAtariMoves(state, color, legalMoves);
    if (doubleAtaris.length > 0) {
      return doubleAtaris[0];
    }

    // 4. 消除对手的双打吃威胁
    const oppLegal = this.getFastLegalMoves(state, oppColor);
    const oppDoubleAtaris = this.findDoubleAtariMoves(state, oppColor, oppLegal);
    for (const threatPoint of oppDoubleAtaris) {
      if (legalMoves.some((m) => GoCore.pointsEqual(m, threatPoint))) {
        return threatPoint;
      }
    }

    // 5. 战术评估：优先分断对手大龙与做眼
    return this.evaluateEagleTactics(state, color, oppColor, legalMoves, options);
  }

  /**
   * Level 5: 棋道龙 🐉 (3D~5D 终极龙神 - 深度战术搜索，算无遗策)
   */
  private static getDragonCaptureMove(
    state: BoardState,
    color: Color,
    oppColor: Color,
    legalMoves: Point[],
    options: AIMoveOptions
  ): Point | null {
    return this.runMinimaxTacticalSearch(state, color, oppColor, legalMoves, options);
  }

  /**
   * Helper: 萌萌兔的温和落子
   */
  private static getGentlePlayMove(
    state: BoardState,
    color: Color,
    oppColor: Color,
    legalMoves: Point[]
  ): Point | null {
    // 排除自杀手
    const safeMoves = legalMoves.filter((m) => {
      const sim = GoCore.playMove(state, m, color);
      if (sim.error) return false;
      const grp = GoCore.findGroup(sim.nextState.grid, m);
      return grp && grp.liberties.length >= 2;
    });

    const pool = safeMoves.length > 0 ? safeMoves : legalMoves;
    let best = pool[0];
    let maxSc = -Infinity;
    for (const m of pool) {
      let sc = 0;
      for (const n of GoCore.getNeighbors(m, state.size)) {
        if (state.grid[n.y][n.x] !== null) sc += 40;
      }
      const dEdge = Math.min(m.x, state.size - 1 - m.x, m.y, state.size - 1 - m.y);
      if (dEdge === 2 || dEdge === 3) sc += 30;
      if (sc > maxSc) {
        maxSc = sc;
        best = m;
      }
    }
    return best;
  }

  /**
   * Helper: 提吃最多子
   */
  private static pickBestCapture(state: BoardState, instantCaptures: Point[], color: Color): Point {
    if (instantCaptures.length <= 1) return instantCaptures[0];
    let bestCap = instantCaptures[0];
    let maxCount = 0;
    for (const cap of instantCaptures) {
      const sim = GoCore.playMove(state, cap, color);
      if (sim.captured.length > maxCount) {
        maxCount = sim.captured.length;
        bestCap = cap;
      }
    }
    return bestCap;
  }

  /**
   * Helper: 傲天鹰分断与眼形战术评估
   */
  private static evaluateEagleTactics(
    state: BoardState,
    color: Color,
    oppColor: Color,
    legalMoves: Point[],
    options: AIMoveOptions
  ): Point | null {
    let bestMove: Point | null = null;
    let maxScore = -Infinity;

    for (const move of legalMoves) {
      let score = this.evaluateDeepTactics(state, move, color, oppColor, options);

      // 分断加分：如果这步棋切断了对方两块不同棋子
      const oppNbs = GoCore.getNeighbors(move, state.size).filter(
        (n) => state.grid[n.y][n.x] === oppColor
      );
      if (oppNbs.length >= 2) {
        score += 350;
      }

      // 2-ply 反击推演
      const sim = GoCore.playMove(state, move, color, options.captureTarget);
      if (!sim.error) {
        const nextOppLegal = this.getFastLegalMoves(sim.nextState, oppColor);
        const oppImmediateCaps = this.findImmediateCaptures(sim.nextState, oppColor, nextOppLegal);
        if (oppImmediateCaps.length > 0) {
          score -= 4000; // 严禁送吃
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestMove = move;
      }
    }

    return bestMove ?? legalMoves[0];
  }

  /**
   * Helper: 棋道龙 2-ply 深度对抗搜索
   */
  private static runMinimaxTacticalSearch(
    state: BoardState,
    color: Color,
    oppColor: Color,
    legalMoves: Point[],
    options: AIMoveOptions
  ): Point | null {
    const instantCaps = this.findImmediateCaptures(state, color, legalMoves);
    if (instantCaps.length > 0) {
      return this.pickBestCapture(state, instantCaps, color);
    }

    // 候选着法初筛打分
    const scoredCandidates = legalMoves.map((m) => ({
      move: m,
      score: this.evaluateDeepTactics(state, m, color, oppColor, options),
    }));
    scoredCandidates.sort((a, b) => b.score - a.score);
    const topCandidates = scoredCandidates.slice(0, 10).map((c) => c.move);

    let bestMove = topCandidates[0] || legalMoves[0];
    let bestValue = -Infinity;

    for (const move of topCandidates) {
      const sim1 = GoCore.playMove(state, move, color, options.captureTarget);
      if (sim1.error) continue;

      if (sim1.captured.length > 0 && options.captureTarget && sim1.nextState.captures[color] >= options.captureTarget) {
        return move; // 一击绝杀！
      }

      const oppLegal = this.getFastLegalMoves(sim1.nextState, oppColor);
      const oppInstantCaps = this.findImmediateCaptures(sim1.nextState, oppColor, oppLegal);
      let oppWorstDamage = 0;
      for (const oCap of oppInstantCaps) {
        const sim2 = GoCore.playMove(sim1.nextState, oCap, oppColor, options.captureTarget);
        if (sim2.captured.length > oppWorstDamage) {
          oppWorstDamage = sim2.captured.length;
        }
      }

      const netValue = (sim1.captured.length * 1000) - (oppWorstDamage * 1200);
      const myGroup = GoCore.findGroup(sim1.nextState.grid, move);
      const myLibs = myGroup ? myGroup.liberties.length : 0;
      const totalScore = netValue + (myLibs * 50);

      if (totalScore > bestValue) {
        bestValue = totalScore;
        bestMove = move;
      }
    }

    return bestMove;
  }

  /**
   * ==========================================
   * FULL GAME SPARRING ROUTING
   * ==========================================
   */
  private static getFullGameSparringMove(
    state: BoardState,
    color: Color,
    opponentColor: Color,
    legalMoves: Point[],
    options: AIMoveOptions
  ): Point | null {
    const size = state.size;
    const isMaster =
      options.difficulty === 'master' ||
      options.difficulty === 'advanced' ||
      options.sparringLevel === 'master';
    const isClub =
      options.difficulty === 'intermediate' || options.sparringLevel === 'club';

    if (!isMaster && !isClub) {
      return this.getTacticalHeuristicMove(state, color, opponentColor, legalMoves, options);
    }

    if (isClub) {
      return this.getAdvancedClubTacticalMove(state, color, opponentColor, legalMoves, options);
    }

    // Master Full Game Sparring uses MCTS
    const mctsIterations = size === 9 ? 450 : size === 13 ? 280 : 140;
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

        const childLegal = this.getFastLegalMoves(simState, simState.turn);
        const childNode = new MCTSNode(move, nextColor, node, childLegal);
        node.children.push(childNode);
        node = childNode;
      }

      // 3. Rollout / Simulation
      const winResult = this.fastRollout(simState, simState.turn, aiColor, options);

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
    let turn: Color = currentColor;
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
   * 2. ADVANCED CLUB TACTICAL ENGINE (NEW 中鸟 ~10K)
   * ==========================================
   */
  private static getAdvancedClubTacticalMove(
    state: BoardState,
    color: Color,
    opponentColor: Color,
    legalMoves: Point[],
    options: AIMoveOptions
  ): Point | null {
    const size = state.size;

    // 1. Immediate Win or Capture
    const instantCaptures = this.findImmediateCaptures(state, color, legalMoves);
    if (instantCaptures.length > 0) {
      if (options.captureTarget) {
        return instantCaptures[0];
      }
      let bestCap = instantCaptures[0];
      let maxCapCount = 0;
      for (const cap of instantCaptures) {
        const sim = GoCore.playMove(state, cap, color);
        if (sim.captured.length > maxCapCount) {
          maxCapCount = sim.captured.length;
          bestCap = cap;
        }
      }
      return bestCap;
    }

    // 2. Urgent rescue: Save friendly groups in Atari (1 liberty)
    const rescues = this.findEscapeAtariMoves(state, color, legalMoves);
    if (rescues.length > 0) {
      return rescues[0];
    }

    // 3. Double Atari offense
    const doubleAtaris = this.findDoubleAtariMoves(state, color, legalMoves);
    if (doubleAtaris.length > 0) {
      return doubleAtaris[0];
    }

    // 4. Proactive Defense: Neutralize Opponent's Double-Atari threats!
    const oppLegal = this.getFastLegalMoves(state, opponentColor);
    const oppDoubleAtaris = this.findDoubleAtariMoves(state, opponentColor, oppLegal);
    if (oppDoubleAtaris.length > 0) {
      for (const threatPoint of oppDoubleAtaris) {
        if (legalMoves.some((m) => GoCore.pointsEqual(m, threatPoint))) {
          const sim = GoCore.playMove(state, threatPoint, color);
          if (!sim.error) {
            const grp = GoCore.findGroup(sim.nextState.grid, threatPoint);
            if (grp && grp.liberties.length >= 2) {
              return threatPoint; // Defuse the double atari before it happens!
            }
          }
        }
      }
    }

    // 5. Score all legal moves with 2-ply counter-attack penalty
    let bestMove: Point | null = null;
    let maxScore = -Infinity;

    for (const move of legalMoves) {
      let score = this.evaluateDeepTactics(state, move, color, opponentColor, options);

      // 2-ply lookahead check: If I play this move, does opponent have an immediate capture against me?
      const sim = GoCore.playMove(state, move, color, options.captureTarget);
      if (!sim.error) {
        const nextOppLegal = this.getFastLegalMoves(sim.nextState, opponentColor);
        const oppImmediateCaps = this.findImmediateCaptures(sim.nextState, opponentColor, nextOppLegal);
        if (oppImmediateCaps.length > 0) {
          score -= 3000; // Walking directly into opponent's counter-capture!
        }

        // 2-liberty group protection near enemy
        const grp = GoCore.findGroup(sim.nextState.grid, move);
        if (grp && grp.liberties.length === 2) {
          const hasAdjOpp = GoCore.getNeighbors(move, size).some(
            (n) => sim.nextState.grid[n.y][n.x] === opponentColor
          );
          if (hasAdjOpp) {
            score -= 150;
          }
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestMove = move;
      }
    }

    return bestMove ?? legalMoves[0];
  }

  /**
   * ==========================================
   * 3. BASELINE TACTICAL COMBAT ENGINE (NEW 菜鸟 ~15K)
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
