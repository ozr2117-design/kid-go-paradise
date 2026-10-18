import { BoardSize, Color, Point, PuzzleData, PuzzleNode } from '../types/go';

export class SGFParser {
  /**
   * Convert SGF coordinate (e.g. "cd") to {x: 2, y: 3}
   */
  static coordToPoint(coord: string): Point | null {
    if (!coord || coord.length < 2) return null;
    const x = coord.charCodeAt(0) - 'a'.charCodeAt(0);
    const y = coord.charCodeAt(1) - 'a'.charCodeAt(0);
    return { x, y };
  }

  /**
   * Convert Point {x: 2, y: 3} to SGF coordinate "cd"
   */
  static pointToCoord(p: Point): string {
    const cx = String.fromCharCode('a'.charCodeAt(0) + p.x);
    const cy = String.fromCharCode('a'.charCodeAt(0) + p.y);
    return `${cx}${cy}`;
  }

  /**
   * Parse SGF string into PuzzleData format
   */
  static parseSGFToPuzzle(sgf: string, id: string = 'custom'): PuzzleData {
    let size: BoardSize = 19;
    const blackStones: Point[] = [];
    const whiteStones: Point[] = [];
    let title = '趣味围棋题';
    let hint = '';

    // Clean whitespace
    const clean = sgf.trim();

    // Extract Size: SZ[N]
    const sizeMatch = clean.match(/SZ\[(\d+)\]/i);
    if (sizeMatch) {
      const parsedSize = parseInt(sizeMatch[1], 10);
      if ([7, 9, 13, 19].includes(parsedSize)) {
        size = parsedSize as BoardSize;
      }
    }

    // Extract Title/Name: GN[...] or EV[...]
    const titleMatch = clean.match(/(?:GN|EV)\[([^\]]+)\]/);
    if (titleMatch) {
      title = titleMatch[1];
    }

    // Extract Comments/Hints: C[...]
    const commentMatch = clean.match(/C\[([^\]]+)\]/);
    if (commentMatch) {
      hint = commentMatch[1];
    }

    // Extract AB[...] (Add Black)
    const abMatches = clean.match(/AB(?:\[[a-z]{2}\])+/gi);
    if (abMatches) {
      for (const ab of abMatches) {
        const coords = ab.match(/\[([a-z]{2})\]/gi);
        if (coords) {
          for (const c of coords) {
            const raw = c.replace(/[\[\]]/g, '').toLowerCase();
            const pt = this.coordToPoint(raw);
            if (pt) blackStones.push(pt);
          }
        }
      }
    }

    // Extract AW[...] (Add White)
    const awMatches = clean.match(/AW(?:\[[a-z]{2}\])+/gi);
    if (awMatches) {
      for (const aw of awMatches) {
        const coords = aw.match(/\[([a-z]{2})\]/gi);
        if (coords) {
          for (const c of coords) {
            const raw = c.replace(/[\[\]]/g, '').toLowerCase();
            const pt = this.coordToPoint(raw);
            if (pt) whiteStones.push(pt);
          }
        }
      }
    }

    // Build basic solution node from first move
    let solutionTree: PuzzleNode = { isCorrect: true };
    const firstMoveMatch = clean.match(/;([BW])\[([a-z]{2})\]/i);
    if (firstMoveMatch) {
      const movePoint = this.coordToPoint(firstMoveMatch[2].toLowerCase());
      if (movePoint) {
        solutionTree = {
          move: movePoint,
          isCorrect: true,
          comment: '恭喜！下对了！',
        };
      }
    }

    return {
      id,
      title,
      category: 'life-and-death',
      difficulty: 'medium',
      boardSize: size,
      initialTurn: 'black',
      description: '请走出最佳应对！',
      hint: hint || '观察对方弱点与气数。',
      initialBoard: {
        black: blackStones,
        white: whiteStones,
      },
      solutionTree,
    };
  }

  /**
   * Export board state to standard SGF format
   */
  static exportToSGF(
    size: BoardSize,
    history: { x: number; y: number; color: Color }[],
    blackInitial: Point[] = [],
    whiteInitial: Point[] = []
  ): string {
    let sgf = `(;GM[1]FF[4]CA[UTF-8]AP[KidGo]SZ[${size}]`;

    if (blackInitial.length > 0) {
      sgf += `AB` + blackInitial.map((p) => `[${this.pointToCoord(p)}]`).join('');
    }
    if (whiteInitial.length > 0) {
      sgf += `AW` + whiteInitial.map((p) => `[${this.pointToCoord(p)}]`).join('');
    }

    for (const move of history) {
      const tag = move.color === 'black' ? 'B' : 'W';
      sgf += `;${tag}[${this.pointToCoord(move)}]`;
    }

    sgf += `)`;
    return sgf;
  }
}
