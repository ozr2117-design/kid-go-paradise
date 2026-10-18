import { BoardSize, BoardState, Color, Point, StoneGroup, Move } from '../types/go';

export class GoCore {
  /**
   * Create an initial empty board state
   */
  static createEmptyBoard(size: BoardSize = 9): BoardState {
    const grid: (Color | null)[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => null)
    );

    return {
      size,
      grid,
      turn: 'black',
      captures: { black: 0, white: 0 },
      lastMove: null,
      koPoint: null,
      moveHistory: [],
      consecutivePasses: 0,
      isGameOver: false,
      winner: null,
    };
  }

  /**
   * Clone a board state deeply
   */
  static cloneState(state: BoardState): BoardState {
    return {
      size: state.size,
      grid: state.grid.map((row) => [...row]),
      turn: state.turn,
      captures: { ...state.captures },
      lastMove: state.lastMove ? { ...state.lastMove } : null,
      koPoint: state.koPoint ? { ...state.koPoint } : null,
      moveHistory: state.moveHistory.map((m) => ({ ...m })),
      consecutivePasses: state.consecutivePasses,
      isGameOver: state.isGameOver,
      winner: state.winner,
      winReason: state.winReason,
    };
  }

  /**
   * Check if a point is within board boundaries
   */
  static isInside(p: Point, size: BoardSize): boolean {
    return p.x >= 0 && p.x < size && p.y >= 0 && p.y < size;
  }

  /**
   * Get 4 orthogonal neighbors
   */
  static getNeighbors(p: Point, size: BoardSize): Point[] {
    const deltas = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ];
    const neighbors: Point[] = [];
    for (const d of deltas) {
      const np = { x: p.x + d.x, y: p.y + d.y };
      if (this.isInside(np, size)) {
        neighbors.push(np);
      }
    }
    return neighbors;
  }

  /**
   * Point equality helper
   */
  static pointsEqual(a: Point | null, b: Point | null): boolean {
    if (!a || !b) return false;
    return a.x === b.x && a.y === b.y;
  }

  /**
   * Find connected stone group starting from a point, including its liberties
   */
  static findGroup(grid: (Color | null)[][], start: Point): StoneGroup | null {
    const size = grid.length as BoardSize;
    if (!this.isInside(start, size)) return null;
    const color = grid[start.y][start.x];
    if (!color) return null;

    const visitedStones = new Set<string>();
    const stonePoints: Point[] = [];
    const libertyPoints = new Map<string, Point>();
    const queue: Point[] = [start];
    visitedStones.add(`${start.x},${start.y}`);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      stonePoints.push(curr);

      for (const neighbor of this.getNeighbors(curr, size)) {
        const neighborColor = grid[neighbor.y][neighbor.x];
        const key = `${neighbor.x},${neighbor.y}`;

        if (neighborColor === null) {
          // It's a liberty!
          libertyPoints.set(key, neighbor);
        } else if (neighborColor === color && !visitedStones.has(key)) {
          visitedStones.add(key);
          queue.push(neighbor);
        }
      }
    }

    return {
      color,
      points: stonePoints,
      liberties: Array.from(libertyPoints.values()),
    };
  }

  /**
   * Validate if a move is legal without mutating state
   */
  static isLegalMove(
    state: BoardState,
    move: Point,
    color: Color = state.turn
  ): { legal: boolean; reason?: string } {
    if (state.isGameOver) {
      return { legal: false, reason: '对局已结束' };
    }

    if (!this.isInside(move, state.size)) {
      return { legal: false, reason: '超出棋盘范围' };
    }

    if (state.grid[move.y][move.x] !== null) {
      return { legal: false, reason: '此处已有棋子' };
    }

    // Check simple Ko
    if (state.koPoint && this.pointsEqual(state.koPoint, move)) {
      return { legal: false, reason: '打劫禁着点（同形不能立即回提）' };
    }

    // Simulate move to check captures and suicide
    const opponentColor: Color = color === 'black' ? 'white' : 'black';
    const tempGrid = state.grid.map((row) => [...row]);
    tempGrid[move.y][move.x] = color;

    // Check if any opponent group would be captured
    let capturedStonesCount = 0;
    const neighbors = this.getNeighbors(move, state.size);
    const checkedGroups = new Set<string>();

    for (const n of neighbors) {
      if (tempGrid[n.y][n.x] === opponentColor) {
        const groupKey = `${n.x},${n.y}`;
        if (!checkedGroups.has(groupKey)) {
          const group = this.findGroup(tempGrid, n);
          if (group) {
            for (const p of group.points) {
              checkedGroups.add(`${p.x},${p.y}`);
            }
            if (group.liberties.length === 0) {
              capturedStonesCount += group.points.length;
            }
          }
        }
      }
    }

    if (capturedStonesCount > 0) {
      // Capturing opponent is always legal!
      return { legal: true };
    }

    // If no opponent captured, check if the placed stone's group has at least 1 liberty
    const myGroup = this.findGroup(tempGrid, move);
    if (!myGroup || myGroup.liberties.length === 0) {
      return { legal: false, reason: '禁着点（自杀无气）' };
    }

    return { legal: true };
  }

  /**
   * Play a move on the board state
   */
  static playMove(
    state: BoardState,
    move: Point,
    color: Color = state.turn,
    captureTarget?: number
  ): { nextState: BoardState; captured: Point[]; error?: string } {
    const check = this.isLegalMove(state, move, color);
    if (!check.legal) {
      return { nextState: state, captured: [], error: check.reason };
    }

    const nextState = this.cloneState(state);
    const opponentColor: Color = color === 'black' ? 'white' : 'black';

    // Place the stone
    nextState.grid[move.y][move.x] = color;

    // Detect and remove captured opponent stones
    const captured: Point[] = [];
    const checkedOpponentPoints = new Set<string>();
    const neighbors = this.getNeighbors(move, nextState.size);

    for (const n of neighbors) {
      if (nextState.grid[n.y][n.x] === opponentColor) {
        const nKey = `${n.x},${n.y}`;
        if (!checkedOpponentPoints.has(nKey)) {
          const group = this.findGroup(nextState.grid, n);
          if (group) {
            for (const p of group.points) {
              checkedOpponentPoints.add(`${p.x},${p.y}`);
            }
            if (group.liberties.length === 0) {
              for (const p of group.points) {
                captured.push(p);
                nextState.grid[p.y][p.x] = null; // remove captured stone
              }
            }
          }
        }
      }
    }

    // Update capture counts
    if (color === 'black') {
      nextState.captures.black += captured.length;
    } else {
      nextState.captures.white += captured.length;
    }

    // Simple Ko Rule check
    // If exactly 1 stone placed, captures exactly 1 stone, and the placed stone's group now has exactly 1 liberty
    if (captured.length === 1) {
      const placedGroup = this.findGroup(nextState.grid, move);
      if (
        placedGroup &&
        placedGroup.points.length === 1 &&
        placedGroup.liberties.length === 1 &&
        this.pointsEqual(placedGroup.liberties[0], captured[0])
      ) {
        nextState.koPoint = { ...captured[0] };
      } else {
        nextState.koPoint = null;
      }
    } else {
      nextState.koPoint = null;
    }

    // Record move history
    const moveRecord: Move = { x: move.x, y: move.y, color };
    nextState.lastMove = moveRecord;
    nextState.moveHistory.push(moveRecord);
    nextState.consecutivePasses = 0;
    nextState.turn = opponentColor;

    // Check Capture Go win condition (吃子战)
    if (captureTarget && captureTarget > 0) {
      if (color === 'black' && nextState.captures.black >= captureTarget) {
        nextState.isGameOver = true;
        nextState.winner = 'black';
        nextState.winReason = `黑棋率先吃满 ${captureTarget} 颗棋子获胜！`;
      } else if (color === 'white' && nextState.captures.white >= captureTarget) {
        nextState.isGameOver = true;
        nextState.winner = 'white';
        nextState.winReason = `白棋率先吃满 ${captureTarget} 颗棋子获胜！`;
      }
    }

    return { nextState, captured };
  }

  /**
   * Pass move
   */
  static pass(state: BoardState): BoardState {
    const nextState = this.cloneState(state);
    nextState.consecutivePasses += 1;
    nextState.koPoint = null;
    nextState.lastMove = null;
    nextState.turn = state.turn === 'black' ? 'white' : 'black';

    if (nextState.consecutivePasses >= 2) {
      nextState.isGameOver = true;
      const score = this.estimateTerritory(nextState);
      if (score.black > score.white) {
        nextState.winner = 'black';
        nextState.winReason = `对局结束，黑棋以 ${score.black} 目领先！`;
      } else if (score.white > score.black) {
        nextState.winner = 'white';
        nextState.winReason = `对局结束，白棋以 ${score.white} 目领先！`;
      } else {
        nextState.winner = 'draw';
        nextState.winReason = '对局结束，双方握手言和！';
      }
    }

    return nextState;
  }

  /**
   * Fast flood-fill territory estimation for beginner/kid game
   */
  static estimateTerritory(state: BoardState): { black: number; white: number; neutral: number } {
    const size = state.size;
    const visited = Array.from({ length: size }, () => Array(size).fill(false));
    let blackTerritory = state.captures.black;
    let whiteTerritory = state.captures.white;
    let neutralTerritory = 0;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (state.grid[y][x] === null && !visited[y][x]) {
          // BFS empty region
          const region: Point[] = [];
          const queue: Point[] = [{ x, y }];
          visited[y][x] = true;
          let touchesBlack = false;
          let touchesWhite = false;

          while (queue.length > 0) {
            const curr = queue.shift()!;
            region.push(curr);

            for (const n of this.getNeighbors(curr, size)) {
              const stone = state.grid[n.y][n.x];
              if (stone === 'black') touchesBlack = true;
              else if (stone === 'white') touchesWhite = true;
              else if (!visited[n.y][n.x]) {
                visited[n.y][n.x] = true;
                queue.push(n);
              }
            }
          }

          if (touchesBlack && !touchesWhite) {
            blackTerritory += region.length;
          } else if (touchesWhite && !touchesBlack) {
            whiteTerritory += region.length;
          } else {
            neutralTerritory += region.length;
          }
        }
      }
    }

    return { black: blackTerritory, white: whiteTerritory, neutral: neutralTerritory };
  }
}
