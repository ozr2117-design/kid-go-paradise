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
    // Map full-game sparring levels onto the capture-engine difficulty ladder.
    // sparringLevel uses novice/club/master/grandmaster, which are NOT valid
    // AIDifficulty values — so previously novice (老鸟) and club (战灵狐) fell
    // through to the default dragon tier (the strongest), making them as strong
    // as 龙尊 and collapsing the whole difficulty ladder.
    const sparringToDifficulty: Record<AISparringLevel, AIDifficulty> = {
      novice: 'advanced',        // 老鸟 业1 → 狐 (5K~1D, "真正老鸟" per design)
      club: 'master',            // 战灵狐 业2-3 → 鹰 (1D~2D)
      master: 'grandmaster',     // 麒麟 业4 → 龙 (3D~5D)
      grandmaster: 'grandmaster', // 龙尊 业5 → 龙 (3D~5D)
    };
    const diff =
      options.difficulty ||
      (options.sparringLevel ? sparringToDifficulty[options.sparringLevel] : undefined) ||
      'beginner';

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

    // 过滤自填真眼（合法但自杀的棋），避免无棋可下时硬塞烂棋
    const validMoves = legalMoves.filter((m) => !this.isTrueEye(state, m, color));
    if (validMoves.length === 0) {
      return null; // 无有效棋可下 → 停一手，而非硬塞自填眼
    }

    // 候选着法初筛打分
    const scoredCandidates = validMoves.map((m) => ({
      move: m,
      score: this.evaluateDeepTactics(state, m, color, oppColor, options),
    }));
    scoredCandidates.sort((a, b) => b.score - a.score);
    const topCandidates = scoredCandidates.slice(0, 10).map((c) => c.move);

    let bestMove: Point | null = null;
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

    return bestMove ?? validMoves[0];
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
    const isGrandmaster =
      options.difficulty === 'grandmaster' || options.sparringLevel === 'grandmaster';

    let chosen: Point | null = null;

    // 1. 🐲 极·龙尊 (Dragon Sovereign - 业余 5 段 / 国家二级水准: Full Neural Policy Priors + Deep MCTS + Anti-Surrender)
    if (isGrandmaster) {
      chosen = this.getDragonSovereignFullGameMove(state, color, opponentColor, legalMoves, options);
    } else if (options.sparringLevel === 'master') {
      // 2. 🦄 踏浪麒麟 (Kylin - 业余 4 段 · 大局宗师: High-budget MCTS + Neural Policy Guidance)
      chosen = this.getKylinFullGameMove(state, color, opponentColor, legalMoves, options);
    } else if (options.sparringLevel === 'club' || options.difficulty === 'intermediate') {
      // 3. 🦊 战灵狐 (War Fox - 业余 2 至 3 段 · 中盘刺客: Tactical Cutting & Atari Pressure + Focused MCTS)
      chosen = this.getWarFoxFullGameMove(state, color, opponentColor, legalMoves, options);
    } else {
      // 4. 🦅 老鸟 (Old Bird - 业余 1 段 · 守门名宿: Standard MCTS, the child's confident 80%+ win rate anchor)
      const mctsIterations = size === 9 ? 450 : size === 13 ? 280 : 140;
      chosen = this.runMCTS(state, color, opponentColor, legalMoves, mctsIterations, options);
    }

    // ========================================================
    // 🛡️ 核心铁律：反摆烂与绝境胜负手安全拦截 (Anti-Pass & Swindle Safeguard)
    // 无论是龙尊还是老鸟，只要落后或对手主动 Pass，绝不被动虚手！
    // ========================================================
    const est = GoCore.estimateTerritory(state);
    const komi = size === 19 ? 7.5 : size === 13 ? 5.5 : 3.5;
    const myScore = color === 'black' ? est.black : est.white + komi;
    const oppScore = color === 'black' ? est.white + komi : est.black;
    const isLosing = myScore < oppScore;
    const isOpponentPass = state.consecutivePasses > 0;

    if (isLosing || isOpponentPass) {
      if (!chosen || this.isTrueEye(state, chosen, color)) {
        const desperateMove = this.findDesperateInvasionMove(state, color, opponentColor, legalMoves);
        if (desperateMove) {
          return desperateMove;
        }
      }
    }

    return chosen;
  }

  /**
   * 绝境胜负手与破空打入 (Anti-Pass Desperate Swindle & Deep Invasion)
   * 当 AI 处于劣势或对手试图通过连续停一手锁定胜局时被触发
   */
  public static findDesperateInvasionMove(
    state: BoardState,
    color: Color,
    oppColor: Color,
    legalMoves: Point[]
  ): Point | null {
    const size = state.size;
    if (legalMoves.length === 0) return null;

    // 1. 过滤掉自填真眼
    const validMoves = legalMoves.filter((m) => !this.isTrueEye(state, m, color));
    if (validMoves.length === 0) return null;

    // 2. 紧急打吃/解救优先
    const escapes = this.findEscapeAtariMoves(state, color, validMoves);
    if (escapes.length > 0) return escapes[0];

    const captures = this.findImmediateCaptures(state, color, validMoves);
    if (captures.length > 0) return captures[0];

    // 3. 空角三三打入 (San-San Points)
    const sanSanList: Point[] = [
      { x: 2, y: 2 },
      { x: size - 3, y: 2 },
      { x: 2, y: size - 3 },
      { x: size - 3, y: size - 3 },
    ];
    for (const ss of sanSanList) {
      if (validMoves.some((m) => m.x === ss.x && m.y === ss.y)) {
        const sim = GoCore.playMove(state, ss, color);
        if (!sim.error) {
          const grp = GoCore.findGroup(sim.nextState.grid, ss);
          if (grp && grp.liberties.length >= 2) {
            return ss;
          }
        }
      }
    }

    // 4. 打入对手空腹、断开对手连接、或者抢占未收净的官子
    const scoredMoves = validMoves
      .map((m) => {
        let score = 0;
        const sim = GoCore.playMove(state, m, color);
        if (sim.error) return { move: m, score: -99999 };

        const myGroup = GoCore.findGroup(sim.nextState.grid, m);
        const myLibs = myGroup ? myGroup.liberties.length : 0;

        // 绝不白送 1 气死肉
        if (myLibs <= 1 && sim.captured.length === 0) {
          score -= 2000;
        } else {
          score += myLibs * 60;
        }

        if (sim.captured.length > 0) {
          score += sim.captured.length * 600;
        }

        // 贴靠对手棋子寻找破绽
        const oppNeighbors = GoCore.getNeighbors(m, size).filter(
          (n) => state.grid[n.y][n.x] === oppColor
        );
        score += oppNeighbors.length * 90;

        // 冲断奖励
        const cutBonus = this.evaluateCutsAndPunish(state, sim, m, color, oppColor);
        score += cutBonus * 1.6;

        return { move: m, score };
      })
      .sort((a, b) => b.score - a.score);

    if (scoredMoves.length > 0 && scoredMoves[0].score > -1500) {
      return scoredMoves[0].move;
    }

    // 5. 兜底挑选气数 >= 2 的合法步
    for (const vm of validMoves) {
      const sim = GoCore.playMove(state, vm, color);
      if (!sim.error) {
        const grp = GoCore.findGroup(sim.nextState.grid, vm);
        if (grp && grp.liberties.length >= 2) {
          return vm;
        }
      }
    }

    return validMoves[0] || null;
  }

  /**
   * Helper: Detects if a point is a true eye for friendly stones (自填真眼自杀判定)
   * True eye: All 4 orthogonal neighbors are friendly stones,
   * and at least 3 diagonal corners (or 2 for corners/edges) are friendly or board edge.
   */
  private static isTrueEye(state: BoardState, move: Point, color: Color): boolean {
    return GoCore.isTrueEye(state.grid, move, color, state.size);
  }

  /**
   * Helper: Checks if move is an unprovoked second-line crawl extending an existing line-2 stone
   */
  private static isSecondLineCrawl(state: BoardState, move: Point, color: Color): boolean {
    const size = state.size;
    const distToEdgeX = Math.min(move.x, size - 1 - move.x);
    const distToEdgeY = Math.min(move.y, size - 1 - move.y);
    const line = Math.min(distToEdgeX, distToEdgeY) + 1;
    if (line !== 2) return false;

    // Corner 2-2 point (distToEdgeX === 1 && distToEdgeY === 1) is a corner invasion/defense, not a flat crawl
    if (distToEdgeX === 1 && distToEdgeY === 1) return false;

    // Check if it extends an adjacent friendly stone along the SAME flat edge
    // Top or bottom edge (y is 1 or size-2)
    if (distToEdgeY === 1) {
      for (const dx of [-1, 1]) {
        const nx = move.x + dx;
        if (nx >= 0 && nx < size && state.grid[move.y][nx] === color) {
          const nDistX = Math.min(nx, size - 1 - nx);
          if (nDistX >= 1) return true;
        }
      }
    }
    // Left or right edge (x is 1 or size-2)
    if (distToEdgeX === 1) {
      for (const dy of [-1, 1]) {
        const ny = move.y + dy;
        if (ny >= 0 && ny < size && state.grid[ny][move.x] === color) {
          const nDistY = Math.min(ny, size - 1 - ny);
          if (nDistY >= 1) return true;
        }
      }
    }
    return false;
  }

  /**
   * Helper: Checks if placing a stone creates a solid 2x2 clump (4-stone dumpling)
   */
  private static isSolidSquareClump(
    grid: (Color | null)[][],
    move: Point,
    color: Color,
    size: number
  ): boolean {
    const offsets = [
      [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }],
      [{ dx: -1, dy: 0 }, { dx: 0, dy: 0 }, { dx: -1, dy: 1 }, { dx: 0, dy: 1 }],
      [{ dx: 0, dy: -1 }, { dx: 1, dy: -1 }, { dx: 0, dy: 0 }, { dx: 1, dy: 0 }],
      [{ dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: -1, dy: 0 }, { dx: 0, dy: 0 }]
    ];

    for (const sq of offsets) {
      let isSquare = true;
      for (const o of sq) {
        const x = move.x + o.dx;
        const y = move.y + o.dy;
        if (x < 0 || x >= size || y < 0 || y >= size || grid[y][x] !== color) {
          isSquare = false;
          break;
        }
      }
      if (isSquare) return true;
    }
    return false;
  }

  /**
   * Helper: Evaluates cutting and separating opponent groups, cross-cuts, and double ataris
   */
  private static evaluateCutsAndPunish(
    state: BoardState,
    sim: { nextState: BoardState; captured: Point[] },
    move: Point,
    color: Color,
    oppColor: Color
  ): number {
    const size = state.size;
    let bonus = 0;

    // 1. Splitting distinct opponent groups
    const oppNeighbors = GoCore.getNeighbors(move, size).filter(
      (n) => state.grid[n.y][n.x] === oppColor
    );
    const splitOppGroups = new Map<string, { size: number; liberties: number }>();
    for (const on of oppNeighbors) {
      const g = GoCore.findGroup(state.grid, on);
      if (g && g.points.length > 0) {
        const sortedPoints = [...g.points].sort((a, b) => a.x - b.x || a.y - b.y);
        const key = `${sortedPoints[0].x},${sortedPoints[0].y}`;
        if (!splitOppGroups.has(key)) {
          splitOppGroups.set(key, { size: g.points.length, liberties: g.liberties.length });
        }
      }
    }

    if (splitOppGroups.size >= 2) {
      const groups = Array.from(splitOppGroups.values());
      const minLibs = Math.min(...groups.map((g) => g.liberties));
      if (minLibs <= 2) {
        bonus += 420; // Critical cut: separating groups where at least one is in immediate peril
      } else if (minLibs <= 3) {
        bonus += 340; // Severe cut splitting two weak groups
      } else {
        bonus += 220; // Standard cut splitting two groups
      }
    }

    // 2. Cross-cut / diagonal cutting through enemy stones
    const diagonals = [
      { d1: { x: -1, y: 0 }, d2: { x: 0, y: -1 } },
      { d1: { x: 1, y: 0 }, d2: { x: 0, y: -1 } },
      { d1: { x: -1, y: 0 }, d2: { x: 0, y: 1 } },
      { d1: { x: 1, y: 0 }, d2: { x: 0, y: 1 } }
    ];

    for (const pair of diagonals) {
      const p1 = { x: move.x + pair.d1.x, y: move.y + pair.d1.y };
      const p2 = { x: move.x + pair.d2.x, y: move.y + pair.d2.y };
      if (GoCore.isInside(p1, size) && GoCore.isInside(p2, size)) {
        if (state.grid[p1.y][p1.x] === oppColor && state.grid[p2.y][p2.x] === oppColor) {
          const diagCorner = { x: move.x + pair.d1.x, y: move.y + pair.d2.y };
          if (GoCore.isInside(diagCorner, size) && state.grid[diagCorner.y][diagCorner.x] !== oppColor) {
            bonus += 180;
          }
        }
      }
    }

    // 3. Double Atari creation
    let atariCount = 0;
    const checkedAtari = new Set<string>();
    for (const on of oppNeighbors) {
      const simGroup = GoCore.findGroup(sim.nextState.grid, on);
      if (simGroup && simGroup.liberties.length === 1) {
        const key = `${simGroup.points[0].x},${simGroup.points[0].y}`;
        if (!checkedAtari.has(key)) {
          checkedAtari.add(key);
          atariCount++;
        }
      }
    }
    if (atariCount >= 2) {
      bonus += 380;
    }

    return bonus;
  }

  /**
   * Comprehensive Board Control & Influence for MCTS Rollout Evaluation
   */
  private static evaluateBoardControl(state: BoardState, aiColor: Color): number {
    const oppColor: Color = aiColor === 'black' ? 'white' : 'black';
    const size = state.size;

    // 1. Captures differential (weight 3.0 per stone)
    const captureDiff = state.captures[aiColor] - state.captures[oppColor];
    let scoreDiff = captureDiff * 3.0;

    // 2. Komi
    const komi = size === 19 ? 7.5 : size === 13 ? 5.5 : 3.5;
    scoreDiff += (aiColor === 'white' ? komi : -komi);

    // 3. Enclosed territory
    //    estimateTerritory() 内部已按 1.0x 计入提子，故此处减去 captureDiff，
    //    避免提子被重复计分（上面已按 3.0x 加权过一次）。
    const est = GoCore.estimateTerritory(state);
    scoreDiff += (est[aiColor] - est[oppColor]) - captureDiff;

    // 4. Group health & presence
    const visited = new Set<string>();
    let aiAliveStones = 0;
    let oppAliveStones = 0;
    let aiLibBonus = 0;
    let oppLibBonus = 0;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const c = state.grid[y][x];
        if (c !== null) {
          const key = `${x},${y}`;
          if (!visited.has(key)) {
            const grp = GoCore.findGroup(state.grid, { x, y });
            if (grp) {
              for (const p of grp.points) visited.add(`${p.x},${p.y}`);
              const libs = grp.liberties.length;
              if (c === aiColor) {
                if (libs === 1) {
                  scoreDiff -= grp.points.length * 2.0;
                } else {
                  aiAliveStones += grp.points.length;
                  aiLibBonus += Math.min(libs, 5) * 0.4;
                }
              } else {
                if (libs === 1) {
                  scoreDiff += grp.points.length * 2.0;
                } else {
                  oppAliveStones += grp.points.length;
                  oppLibBonus += Math.min(libs, 5) * 0.4;
                }
              }
            }
          }
        }
      }
    }

    scoreDiff += (aiAliveStones - oppAliveStones) * 1.2;
    scoreDiff += (aiLibBonus - oppLibBonus);

    // 5. Corner control bonus
    const cornerOffset = size >= 19 ? 3 : size >= 13 ? 3 : size >= 9 ? 2 : 1;
    const cornerChecks = [
      { x: cornerOffset, y: cornerOffset },
      { x: size - 1 - cornerOffset, y: cornerOffset },
      { x: cornerOffset, y: size - 1 - cornerOffset },
      { x: size - 1 - cornerOffset, y: size - 1 - cornerOffset },
    ];

    for (const cp of cornerChecks) {
      if (cp.y < size && cp.x < size && state.grid[cp.y]) {
        const stone = state.grid[cp.y][cp.x];
        if (stone === aiColor) scoreDiff += 3.5;
        else if (stone === oppColor) scoreDiff -= 3.5;
      }
    }

    return scoreDiff;
  }

  /**
   * Deep Neural-Style Policy Evaluation for 龙尊 (Dragon Sovereign)
   * Evaluates shapes, empty corners, 3-3 invasions, sharp cuts, tenuki, and anti-crawling
   */
  private static evaluateDragonPolicy(
    state: BoardState,
    move: Point,
    color: Color,
    oppColor: Color,
    cachedTerritory?: { black: number; white: number; neutral: number }
  ): number {
    const size = state.size;
    let score = 0;

    // 1. Quick simulation check
    const sim = GoCore.playMove(state, move, color);
    if (sim.error) return -99999;

    // 2. Immediate capture reward (scales with captured stones)
    if (sim.captured.length > 0) {
      score += sim.captured.length * 350;
    }

    // 3. Self-Atari / shortage of liberties / True Eye safety penalty
    if (this.isTrueEye(state, move, color) && sim.captured.length === 0) {
      return -80000; // Strictly forbid self-filling own true eyes!
    }
    const grp = GoCore.findGroup(sim.nextState.grid, move);
    if (grp) {
      if (grp.liberties.length === 1 && sim.captured.length === 0) {
        return -50000;
      }
      score += Math.min(grp.liberties.length, 5) * 25;
    }

    // 4. Line position evaluation (金角银边草肚皮)
    const distToEdgeX = Math.min(move.x, size - 1 - move.x);
    const distToEdgeY = Math.min(move.y, size - 1 - move.y);
    const line = Math.min(distToEdgeX, distToEdgeY) + 1; // 1 to 5+

    // Line 1 (一路 - 死亡线)
    if (line === 1) {
      if (sim.captured.length === 0 && state.moveHistory.length < size * 3) {
        score -= 260;
      }
    } else if (line === 3) {
      // 3rd line: Territory line (实地线)
      score += 75;
    } else if (line === 4) {
      // 4th line: Influence line (势力线)
      score += 70;
    } else if (line === 2) {
      // 2nd line: Check for unprovoked crawl along the edge!
      const isCrawl = this.isSecondLineCrawl(state, move, color);
      if (isCrawl && sim.captured.length === 0) {
        const adjFriendly = GoCore.getNeighbors(move, size).filter(
          (n) => state.grid[n.y][n.x] === color
        );
        let maxExistingLibs = 0;
        for (const fn of adjFriendly) {
          const g = GoCore.findGroup(state.grid, fn);
          if (g && g.liberties.length > maxExistingLibs) maxExistingLibs = g.liberties.length;
        }
        if (maxExistingLibs >= 3) {
          score -= 280; // Severe crawl penalty! Tenuki to open big points!
        } else {
          score -= 160; // Crawl penalty
        }
      } else {
        score += 20;
      }
    }

    // 5. Macro Corner Prior (金角银边): Empty corners, approach & 3-3 invasion
    const cornerSpan = size === 19 ? 6 : size === 13 ? 5 : 4;
    const cornerStartX = move.x < size / 2 ? 0 : size - cornerSpan;
    const cornerEndX = move.x < size / 2 ? cornerSpan - 1 : size - 1;
    const cornerStartY = move.y < size / 2 ? 0 : size - cornerSpan;
    const cornerEndY = move.y < size / 2 ? cornerSpan - 1 : size - 1;

    let stonesInCornerSector = 0;
    let oppStonesInSector = 0;
    for (let cy = cornerStartY; cy <= cornerEndY; cy++) {
      for (let cx = cornerStartX; cx <= cornerEndX; cx++) {
        const sc = state.grid[cy][cx];
        if (sc !== null) {
          stonesInCornerSector++;
          if (sc === oppColor) oppStonesInSector++;
        }
      }
    }

    const isCornerPoint =
      (distToEdgeX === 2 || distToEdgeX === 3) && (distToEdgeY === 2 || distToEdgeY === 3);

    if (stonesInCornerSector === 0) {
      if (isCornerPoint) {
        score += 340; // Massive opening prior for empty corners (金角)
      } else if (line === 3 || line === 4) {
        score += 220;
      }
    } else if (stonesInCornerSector === 1 && oppStonesInSector === 1) {
      const is33 = distToEdgeX === 2 && distToEdgeY === 2;
      if (is33) {
        score += 260; // 3-3 invasion
      } else if (isCornerPoint) {
        score += 230; // Approach
      }
    }

    // 6. Turning Head towards Center (二路拐头出头 / 一间跳)
    if (line === 3 || line === 4) {
      const neighbors = GoCore.getNeighbors(move, size);
      const connectsToLine2Friendly = neighbors.some((n) => {
        if (state.grid[n.y][n.x] !== color) return false;
        const ndX = Math.min(n.x, size - 1 - n.x);
        const ndY = Math.min(n.y, size - 1 - n.y);
        return Math.min(ndX, ndY) + 1 === 2;
      });
      if (connectsToLine2Friendly) {
        score += 140; // Turning head to center instead of crawling along edge!
      }
    }

    // 7. Sabaki & Invasion into opponent's giant territory (反包围与深入敌阵腾挪)
    const territoryEst = cachedTerritory || GoCore.estimateTerritory(state);
    const oppTerritory = oppColor === 'black' ? territoryEst.black : territoryEst.white;
    if (oppTerritory > (size * size) * 0.35) {
      // Opponent is growing huge! 龙尊 actively dives into open spaces (3rd line) to make bases!
      if (line === 3 && distToEdgeX >= 2 && distToEdgeY >= 2) {
        score += 90;
      }
    }

    // 8. Shape Quality & Anti-Dumpling (好形识别与拒绝实心愚形)
    if (this.isSolidSquareClump(sim.nextState.grid, move, color, size) && sim.captured.length === 0) {
      score -= 240; // Heavy dumpling shape!
    }

    const neighbors = GoCore.getNeighbors(move, size);
    let friendlyNeighbors = 0;
    let enemyNeighbors = 0;
    for (const n of neighbors) {
      if (state.grid[n.y][n.x] === color) friendlyNeighbors++;
      else if (state.grid[n.y][n.x] === oppColor) enemyNeighbors++;
    }

    // Tiger's mouth formation (surrounded by 3 friendly stones, making an eye)
    if (friendlyNeighbors === 3 && enemyNeighbors === 0) {
      score += 110; // Beautiful eye formation!
    }

    // Empty triangle penalty (愚形空心三角)
    if (friendlyNeighbors === 2) {
      for (const dx of [-1, 1]) {
        for (const dy of [-1, 1]) {
          const nx = move.x + dx;
          const ny = move.y + dy;
          if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
            if (
              state.grid[move.y][nx] === color &&
              state.grid[ny][move.x] === color &&
              state.grid[ny][nx] === null
            ) {
              score -= 80; // Empty triangle penalty!
            }
          }
        }
      }
    }

    // 9. Cutting & Connecting with Punish (严厉切断与分割弱棋)
    score += this.evaluateCutsAndPunish(state, sim, move, color, oppColor);

    // 10. Putting opponent into Atari (叫吃)
    for (const n of neighbors) {
      if (sim.nextState.grid[n.y][n.x] === oppColor) {
        const g = GoCore.findGroup(sim.nextState.grid, n);
        if (g && g.liberties.length === 1) {
          score += 130;
        }
      }
    }

    // 11. Tenuki / Wide Side Bonus (开辟大场)
    let stonesNearby = 0;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const cx = move.x + dx;
        const cy = move.y + dy;
        if (cx >= 0 && cx < size && cy >= 0 && cy < size && (dx !== 0 || dy !== 0)) {
          if (state.grid[cy][cx] !== null) stonesNearby++;
        }
      }
    }
    if (stonesNearby === 0 && line === 3 && state.moveHistory.length < size * 2) {
      score += 120;
    }

    return score;
  }

  /**
   * Level 3: 🦄 踏浪麒麟 (Kylin - 业余 4 段 · 大局宗师)
   * High-budget MCTS + Neural Policy Guidance, plays thick, solid, and makes almost no opening blunders.
   */
  private static getKylinFullGameMove(
    state: BoardState,
    color: Color,
    oppColor: Color,
    legalMoves: Point[],
    options: AIMoveOptions
  ): Point | null {
    const size = state.size;

    // 1. Immediate high-value tactical emergencies
    const escapes = this.findEscapeAtariMoves(state, color, legalMoves);
    if (escapes.length > 0) {
      return escapes[0];
    }

    const captures = this.findImmediateCaptures(state, color, legalMoves);
    if (captures.length > 0) {
      return captures[0];
    }

    // 2. Opening book priority on empty or early board
    const moveNumber = state.moveHistory.length;
    const hasEmergency = this.hasUrgentAtari(state, color, oppColor);
    if (!hasEmergency && !options.captureTarget && moveNumber < (size === 9 ? 8 : size === 13 ? 20 : 36)) {
      const opening = this.getOpeningBookMove(state, legalMoves);
      if (opening) return opening;
    }

    // 3. Pre-evaluate candidates using Dragon Policy (macro shape, corner/side balance, anti-clump)
    const scoredCandidates = legalMoves
      .map((m) => ({
        move: m,
        score: this.evaluateDragonPolicy(state, m, color, oppColor),
      }))
      .sort((a, b) => b.score - a.score);

    const sortedMoves = scoredCandidates.map((c) => c.move);

    // 4. Run High-budget MCTS (19x19: 320, 13x13: 420, 9x9: 550)
    const mctsIterations = size === 9 ? 550 : size === 13 ? 420 : 320;
    return this.runMCTS(state, color, oppColor, sortedMoves, mctsIterations, options);
  }

  /**
   * Level 2: 🦊 战灵狐 (War Fox - 业余 2 至 3 段 · 中盘刺客)
   * Focused on cutting opponent groups, double-atari, hunting weak shapes, and medium MCTS search.
   */
  private static getWarFoxFullGameMove(
    state: BoardState,
    color: Color,
    oppColor: Color,
    legalMoves: Point[],
    options: AIMoveOptions
  ): Point | null {
    const size = state.size;

    // 1. Tactical emergencies: escape atari
    const escapes = this.findEscapeAtariMoves(state, color, legalMoves);
    if (escapes.length > 0) {
      return escapes[0];
    }

    // 2. High-value captures
    const captures = this.findImmediateCaptures(state, color, legalMoves);
    if (captures.length > 0) {
      return captures[0];
    }

    // 3. Prioritize sharp cuts & double-ataris (战灵狐的核心杀招)
    const tacticalCandidates = legalMoves
      .map((m) => {
        const sim = GoCore.playMove(state, m, color);
        const cutBonus = sim.error ? -9999 : this.evaluateCutsAndPunish(state, sim, m, color, oppColor);
        const baseScore = this.quickEval(state, m, color, oppColor);
        return {
          move: m,
          score: baseScore + cutBonus * 1.5,
        };
      })
      .sort((a, b) => b.score - a.score);

    // If an exceptional cut or double atari exists, execute directly
    if (tacticalCandidates.length > 0 && tacticalCandidates[0].score >= 380) {
      return tacticalCandidates[0].move;
    }

    // 4. Opening book if early
    const moveNumber = state.moveHistory.length;
    if (!options.captureTarget && moveNumber < (size === 9 ? 6 : size === 13 ? 16 : 28)) {
      const opening = this.getOpeningBookMove(state, legalMoves);
      if (opening) return opening;
    }

    // 5. MCTS with tactical candidate priors (19x19: 220, 13x13: 320, 9x9: 480)
    const sortedMoves = tacticalCandidates.map((c) => c.move);
    const mctsIterations = size === 9 ? 480 : size === 13 ? 320 : 220;
    return this.runMCTS(state, color, oppColor, sortedMoves, mctsIterations, options);
  }

  /**
   * 🐲 神级龙尊 (Dragon Sovereign) Full Game Sparring AI
   * Combines Neural-Style Policy Priors + Deep MCTS + Sabaki Tenuki + Stochastic Variety
   */
  private static getDragonSovereignFullGameMove(
    state: BoardState,
    color: Color,
    oppColor: Color,
    legalMoves: Point[],
    options: AIMoveOptions
  ): Point | null {
    const size = state.size;

    // 0. Precompute whole-board territory flood-fill ONCE for all candidate evaluations
    const territoryEst = GoCore.estimateTerritory(state);

    // Evaluate all legal moves once with O(N) single-pass scoring
    const scoredCandidates = legalMoves
      .map((m) => ({
        move: m,
        score: this.evaluateDragonPolicy(state, m, color, oppColor, territoryEst),
      }))
      .sort((a, b) => b.score - a.score);

    // 1. Immediate high-value tactical emergencies
    const escapes = this.findEscapeAtariMoves(state, color, legalMoves);
    if (escapes.length > 0) {
      const bestEscape = escapes
        .map((m) => ({
          move: m,
          score: this.evaluateDragonPolicy(state, m, color, oppColor, territoryEst),
        }))
        .sort((a, b) => b.score - a.score)[0];
      if (bestEscape && bestEscape.score > 0) {
        return bestEscape.move;
      }
    }

    const captures = this.findImmediateCaptures(state, color, legalMoves);
    if (captures.length > 0) {
      const bestCap = captures.sort((a, b) => {
        const simA = GoCore.playMove(state, a, color).captured.length;
        const simB = GoCore.playMove(state, b, color).captured.length;
        return simB - simA;
      })[0];
      const capCount = GoCore.playMove(state, bestCap, color).captured.length;
      if (capCount >= 2) {
        return bestCap;
      }
    }

    // 2. Opening variety: In the opening phase, pick from top high-macro moves
    const openingLimit = size === 9 ? 8 : size === 13 ? 24 : 40;
    if (state.moveHistory.length < openingLimit && scoredCandidates.length > 0) {
      const topScore = scoredCandidates[0].score;
      if (topScore >= 180) {
        const topPool = scoredCandidates.filter((c) => c.score >= topScore - 40);
        if (topPool.length > 0) {
          return topPool[Math.floor(Math.random() * topPool.length)].move;
        }
      }
    }

    // 3. Deep MCTS guided by Dragon Policy Prior
    // Prune untried moves on large boards (19x19 / 13x13) to concentrate search budget
    const maxRootCandidates = size === 19 ? 42 : size === 13 ? 30 : scoredCandidates.length;
    const sortedUntried = scoredCandidates.slice(0, maxRootCandidates).map((c) => c.move);

    // Calibrated search budget for Xiaomi Pad 6 Pro (Snapdragon 8+ Gen 1):
    // 19x19: 240 visits within ~380ms window, blazing fast and tactically deep
    const mctsIterations = size === 9 ? 450 : size === 13 ? 300 : 240;
    const maxTimeMs = size === 19 ? 380 : size === 13 ? 320 : 380;
    const startTime = Date.now();
    const root = new MCTSNode(null, oppColor, null, sortedUntried);

    for (let iter = 0; iter < mctsIterations; iter++) {
      if (Date.now() - startTime > maxTimeMs) break;

      let node = root;
      let simState = GoCore.cloneState(state);

      while (node.untriedMoves.length === 0 && node.children.length > 0) {
        node = this.selectBestUCTChild(node);
        if (node.move) {
          const res = GoCore.playMove(simState, node.move, node.color, options.captureTarget);
          simState = res.nextState;
        }
      }

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

      const winResult = this.fastRollout(simState, simState.turn, color, options);

      let curr: MCTSNode | null = node;
      while (curr !== null) {
        curr.visits++;
        if (winResult) {
          curr.wins += 1;
        }
        curr = curr.parent;
      }
    }

    // Strict safeguard against premature mid-game pass/surrender:
    // Only pass if true late endgame (moves >= size * 8) AND no productive moves exist AND not losing
    const minEndgameMoves = size === 19 ? 150 : size === 13 ? 75 : 35;
    const isLateEndgame = state.moveHistory.length >= minEndgameMoves;

    const komi = size === 19 ? 7.5 : size === 13 ? 5.5 : 3.5;
    const myScore = color === 'black' ? territoryEst.black : territoryEst.white + komi;
    const oppScore = color === 'black' ? territoryEst.white + komi : territoryEst.black;
    const isLosing = myScore < oppScore;
    const isOpponentPass = state.consecutivePasses > 0;

    if (root.children.length === 0) {
      const nonSuicide = legalMoves.find((m) => !this.isTrueEye(state, m, color));
      if (!isLateEndgame && nonSuicide) {
        return nonSuicide;
      }
      if (isLosing || isOpponentPass) {
        return this.findDesperateInvasionMove(state, color, oppColor, legalMoves);
      }
      return null;
    }

    root.children.sort((a, b) => b.visits - a.visits);

    // Among top moves with close visits (within 12%), pick with subtle temperature
    const topVisits = root.children[0].visits;
    const topTier = root.children.filter((c) => c.visits >= topVisits * 0.88);
    const chosenMove =
      topTier.length > 1 && Math.random() < 0.2
        ? topTier[Math.floor(Math.random() * topTier.length)].move
        : root.children[0].move;

    // Never fill true eye; in midgame or losing game, fight persistently instead of passing!
    if (chosenMove && this.isTrueEye(state, chosenMove, color)) {
      const alt = legalMoves.find((m) => !this.isTrueEye(state, m, color));
      if (alt) return alt;
      if (isLosing || isOpponentPass) {
        return this.findDesperateInvasionMove(state, color, oppColor, legalMoves);
      }
      return null;
    }

    if (!chosenMove && (isLosing || isOpponentPass)) {
      return this.findDesperateInvasionMove(state, color, oppColor, legalMoves);
    }

    return chosenMove;
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
    const maxTimeMs = rootState.size === 19 ? 260 : rootState.size === 13 ? 320 : 380;

    // Prioritize high-value opening book if early in the game on standard board
    const moveNumber = rootState.moveHistory.length;
    const hasEmergency = this.hasUrgentAtari(rootState, aiColor, oppColor);
    if (!hasEmergency && !options.captureTarget && moveNumber < (rootState.size === 9 ? 8 : rootState.size === 13 ? 20 : 36)) {
      const opening = this.getOpeningBookMove(rootState, legalMoves);
      if (opening) return opening;
    }

    // Evaluate candidates once and prune root moves on large boards
    const scoredMoves = legalMoves
      .map((m) => ({
        move: m,
        score: this.quickEval(rootState, m, aiColor, oppColor),
      }))
      .sort((a, b) => b.score - a.score);

    const maxRootCandidates = rootState.size === 19 ? 32 : rootState.size === 13 ? 24 : scoredMoves.length;
    const sortedUntried = scoredMoves.slice(0, maxRootCandidates).map((item) => item.move);

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

    if (root.children.length === 0) {
      const fallback = sortedUntried[0] || legalMoves[0];
      if (fallback && this.quickEval(rootState, fallback, aiColor, oppColor) > -5000) {
        return fallback;
      }
      return null;
    }

    // Pick child with highest visit count (most battle-tested move)
    root.children.sort((a, b) => b.visits - a.visits);
    const bestMove = root.children[0].move;
    if (bestMove && this.quickEval(rootState, bestMove, aiColor, oppColor) <= -5000) {
      return null;
    }
    return bestMove;
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
   * Helper: Selects distinct random candidate moves for rollout
   */
  private static getRandomCandidates(legal: Point[], count: number): Point[] {
    if (legal.length <= count) return [...legal];
    const result: Point[] = [];
    const used = new Set<string>();
    while (result.length < count && used.size < legal.length) {
      const idx = Math.floor(Math.random() * legal.length);
      const p = legal[idx];
      const key = `${p.x},${p.y}`;
      if (!used.has(key)) {
        used.add(key);
        result.push(p);
      }
    }
    return result;
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
    let consecutiveKoFights = 0;
    let lastKoPoint: Point | null = null;

    for (let step = 0; step < maxPlayoutSteps; step++) {
      if (state.isGameOver) break;

      // Guard against potential Ko fight loops in rollout
      if (state.koPoint && lastKoPoint && GoCore.pointsEqual(state.koPoint, lastKoPoint)) {
        consecutiveKoFights++;
        if (consecutiveKoFights >= 3) break;
      } else {
        consecutiveKoFights = 0;
      }
      lastKoPoint = state.koPoint ? { ...state.koPoint } : null;

      const opp: Color = turn === 'black' ? 'white' : 'black';
      const legal = this.getFastLegalMoves(state, turn);
      if (legal.length === 0) break;

      // Heuristic pick: instant capture or save
      let chosen: Point = legal[0];
      const captures = this.findImmediateCaptures(state, turn, legal);
      if (captures.length > 0) {
        chosen = captures[0];
      } else {
        // Pick best of 3 distinct random moves
        let bestVal = -Infinity;
        const candidates = this.getRandomCandidates(legal, 3);

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

    return this.evaluateBoardControl(state, aiColor) > 0;
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

    if (maxScore <= -5000) {
      return null; // Pass
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

    if (maxScore <= -5000) {
      return null; // Pass
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

    // Self-filling true eye strictly forbidden
    if (this.isTrueEye(state, move, color) && captured === 0) {
      return -80000;
    }

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
    } else if (dEdge === 1 && this.isSecondLineCrawl(state, move, color) && captured === 0) {
      score -= 220; // 2nd line crawl penalty
    }

    if (this.isSolidSquareClump(sim.nextState.grid, move, color, size) && captured === 0) {
      score -= 200; // 2x2 clump penalty
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
    if (sim.captured.length > 0) score += sim.captured.length * 450;

    // True Eye safety
    if (this.isTrueEye(state, move, color) && sim.captured.length === 0) {
      return -80000;
    }

    const grp = GoCore.findGroup(sim.nextState.grid, move);
    if (grp) {
      if (grp.liberties.length === 1 && sim.captured.length === 0) return -8000;
      score += Math.min(grp.liberties.length, 5) * 20;
    }

    const size = state.size;
    const distToEdgeX = Math.min(move.x, size - 1 - move.x);
    const distToEdgeY = Math.min(move.y, size - 1 - move.y);
    const line = Math.min(distToEdgeX, distToEdgeY) + 1;

    // Line 1 penalty
    if (line === 1 && sim.captured.length === 0) score -= 200;

    // Line 2 crawl penalty
    if (line === 2 && this.isSecondLineCrawl(state, move, color) && sim.captured.length === 0) {
      score -= 220;
    }

    // 2x2 clump penalty
    if (this.isSolidSquareClump(sim.nextState.grid, move, color, size) && sim.captured.length === 0) {
      score -= 200;
    }

    // 3rd & 4th line efficiency
    if (line === 3 || line === 4) score += 60;

    // Empty corner bonus
    const isCornerPoint =
      (distToEdgeX === 2 || distToEdgeX === 3) && (distToEdgeY === 2 || distToEdgeY === 3);
    if (isCornerPoint && state.moveHistory.length < (size === 9 ? 12 : 28)) {
      score += 160;
    }

    // Cut bonus: touching 2 opponent groups
    const oppNbs = GoCore.getNeighbors(move, size).filter(
      (n) => state.grid[n.y][n.x] === oppColor
    );
    if (oppNbs.length >= 2) {
      score += 220;
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
        { x: 6, y: 6 }
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

    const available = stars.filter(
      (pt) => state.grid[pt.y][pt.x] === null && legalMoves.some((m) => GoCore.pointsEqual(m, pt))
    );
    if (available.length === 0) return null;

    // Prioritize corners that are completely empty (no stones in 3x3 radius)
    const trulyEmpty = available.filter((pt) => {
      let count = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const cx = pt.x + dx;
          const cy = pt.y + dy;
          if (cx >= 0 && cx < size && cy >= 0 && cy < size && (dx !== 0 || dy !== 0)) {
            if (state.grid[cy][cx] !== null) count++;
          }
        }
      }
      return count === 0;
    });

    const pool = trulyEmpty.length > 0 ? trulyEmpty : available;
    return pool[Math.floor(Math.random() * pool.length)];
  }
}
