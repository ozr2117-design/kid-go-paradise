import { BoardState, Color, Point } from '../../types/go';
import { GoCore } from '../go-core';
import { GoNeuralEngine, NNOutput } from './neural-engine';

interface NeuralMCTSNode {
  point: Point | null; // null for root or pass
  color: Color;
  parent: NeuralMCTSNode | null;
  children: Map<string, NeuralMCTSNode>;
  priorProbability: number;
  visitCount: number;
  totalValue: number; // accumulated Q-values
}

/**
 * PUCT (AlphaGo / KataGo style) Neural Monte Carlo Tree Search
 * Combines Policy Prior Probabilities P(s,a) with Value Function Q(s,a)
 */
export class NeuralMCTSEngine {
  private static cPuct = 1.4;

  /**
   * Search for the best move using Neural MCTS
   */
  static async searchBestMove(
    state: BoardState,
    color: Color = state.turn,
    maxVisits: number = 220,
    maxTimeMs: number = 450,
    temperature: number = 0.2 // Lower = sharper master play, higher = softer novice play
  ): Promise<{ move: Point | null; winrate: number; visits: number }> {
    const size = state.size;
    const oppColor: Color = color === 'black' ? 'white' : 'black';
    const nn = GoNeuralEngine.getInstance();

    const rootNN: NNOutput = await nn.evaluate(state, color);
    const root: NeuralMCTSNode = {
      point: null,
      color: oppColor,
      parent: null,
      children: new Map(),
      priorProbability: 1.0,
      visitCount: 1,
      totalValue: rootNN.value,
    };

    // Filter and score top root legal candidates
    const legalCandidates: { point: Point; prior: number }[] = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const pt: Point = { x, y };
        if (state.grid[y][x] === null && GoCore.isLegalMove(state, pt, color).legal) {
          const flatIdx = y * size + x;
          const prior = rootNN.policy[flatIdx] || 0.001;
          legalCandidates.push({ point: pt, prior });
        }
      }
    }

    if (legalCandidates.length === 0) {
      return { move: null, winrate: (rootNN.value + 1) / 2, visits: 0 };
    }

    // Sort by neural prior probability
    legalCandidates.sort((a, b) => b.prior - a.prior);

    // Prune root width for extreme focus on 19x19
    const maxRootWidth = size === 19 ? 32 : size === 13 ? 24 : legalCandidates.length;
    const topCandidates = legalCandidates.slice(0, maxRootWidth);

    for (const c of topCandidates) {
      const key = `${c.point.x},${c.point.y}`;
      root.children.set(key, {
        point: c.point,
        color,
        parent: root,
        children: new Map(),
        priorProbability: c.prior,
        visitCount: 0,
        totalValue: 0,
      });
    }

    // MCTS search loop
    const startTime = Date.now();
    let currentVisits = 0;

    while (currentVisits < maxVisits && (Date.now() - startTime) < maxTimeMs) {
      currentVisits++;

      // 1. Selection using PUCT formula
      let curr = root;
      let simState = GoCore.cloneState(state);
      let currTurn = color;

      while (curr.children.size > 0) {
        let bestChild: NeuralMCTSNode | null = null;
        let bestScore = -Infinity;
        const totalParentVisits = Math.max(1, curr.visitCount);

        for (const child of curr.children.values()) {
          const qVal = child.visitCount > 0 ? child.totalValue / child.visitCount : 0.0;
          const uVal = this.cPuct * child.priorProbability * (Math.sqrt(totalParentVisits) / (1 + child.visitCount));
          const score = qVal + uVal;
          if (score > bestScore) {
            bestScore = score;
            bestChild = child;
          }
        }

        if (!bestChild || !bestChild.point) break;
        curr = bestChild;

        // Apply move in simulation state
        const res = GoCore.playMove(simState, bestChild.point, currTurn);
        simState = res.nextState;
        currTurn = currTurn === 'black' ? 'white' : 'black';

        if (simState.isGameOver) break;
      }

      // 2. Evaluation using Neural Engine
      const evalRes: NNOutput = await nn.evaluate(simState, currTurn);
      const leafValueForFriend = currTurn === color ? evalRes.value : -evalRes.value;

      // 3. Backpropagation
      let backNode: NeuralMCTSNode | null = curr;
      while (backNode !== null) {
        backNode.visitCount++;
        backNode.totalValue += leafValueForFriend;
        backNode = backNode.parent;
      }
    }

    // Pick best child based on visit count and temperature
    let chosenPoint: Point | null = null;
    let maxChildVisits = -1;
    let bestWinrate = 0.5;

    if (temperature <= 0.05) {
      // Deterministic greedy pick
      for (const child of root.children.values()) {
        if (child.visitCount > maxChildVisits) {
          maxChildVisits = child.visitCount;
          chosenPoint = child.point;
          bestWinrate = child.visitCount > 0 ? (child.totalValue / child.visitCount + 1) / 2 : 0.5;
        }
      }
    } else {
      // Temperature-based probabilistic pick
      const childArray = Array.from(root.children.values());
      const poweredVisits = childArray.map((c) => Math.pow(Math.max(1, c.visitCount), 1.0 / temperature));
      const sumPower = poweredVisits.reduce((acc, v) => acc + v, 0);

      let r = Math.random() * sumPower;
      for (let i = 0; i < childArray.length; i++) {
        r -= poweredVisits[i];
        if (r <= 0 || i === childArray.length - 1) {
          chosenPoint = childArray[i].point;
          bestWinrate = childArray[i].visitCount > 0 ? (childArray[i].totalValue / childArray[i].visitCount + 1) / 2 : 0.5;
          maxChildVisits = childArray[i].visitCount;
          break;
        }
      }
    }

    return {
      move: chosenPoint,
      winrate: bestWinrate,
      visits: currentVisits,
    };
  }
}
