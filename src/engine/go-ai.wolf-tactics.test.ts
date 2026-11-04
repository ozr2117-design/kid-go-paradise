import { describe, it, expect } from 'vitest';
import { GoCore } from './go-core';
import { GoAI } from './go-ai';

describe('GoAI Wolf Tactics Engine (赛场恶狼 4 大手筋算子)', () => {
  it('1. findDoubleAtariMoves detects valid double atari on cutting points and ignores self-atari', () => {
    // 构造教科书级双叫吃局面：
    // 黑棋在 (3,3) 和 (5,3) 各有 2 气（(3,2), (2,3) 为白；(5,2), (6,3) 为白）
    // (4,3) 为两黑群的共同气，白棋下入 (4,3) 后：
    // 黑 (3,3) 仅剩 (3,4) 一气（叫吃）；黑 (5,3) 仅剩 (5,4) 一气（叫吃）；
    // 白 (4,3) 自身有 (4,2) 和 (4,4) 两气（安全落子）。
    let board = GoCore.createEmptyBoard(9);
    board = GoCore.playMove(board, { x: 3, y: 3 }, 'black').nextState;
    board = GoCore.playMove(board, { x: 3, y: 2 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 2, y: 3 }, 'white').nextState;

    board = GoCore.playMove(board, { x: 5, y: 3 }, 'black').nextState;
    board = GoCore.playMove(board, { x: 5, y: 2 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 6, y: 3 }, 'white').nextState;

    const legal = GoAI.getFastLegalMoves(board, 'white');
    const doubleAtaris = GoAI.findDoubleAtariMoves(board, 'white', legal);

    expect(doubleAtaris.length).toBeGreaterThan(0);
    // (4,3) 必然是双叫吃要点
    expect(doubleAtaris.some((p) => p.x === 4 && p.y === 3)).toBe(true);

    // 验证自叫吃假双打被过滤：如果 (4,3) 被四面八方全围死只剩 1 气，则绝不是有效双打
    let trapBoard = GoCore.createEmptyBoard(9);
    trapBoard = GoCore.playMove(trapBoard, { x: 3, y: 3 }, 'black').nextState;
    trapBoard = GoCore.playMove(trapBoard, { x: 5, y: 3 }, 'black').nextState;
    trapBoard = GoCore.playMove(trapBoard, { x: 4, y: 2 }, 'black').nextState; // 封住上方
    trapBoard = GoCore.playMove(trapBoard, { x: 4, y: 4 }, 'black').nextState; // 封住下方
    // 此时若白下 (4,3)，由于上下左右全是黑子，白下入直接 0 气自杀或自叫吃（1气）
    const trapLegal = GoAI.getFastLegalMoves(trapBoard, 'white');
    const trapDouble = GoAI.findDoubleAtariMoves(trapBoard, 'white', trapLegal);
    expect(trapDouble.some((p) => p.x === 4 && p.y === 3)).toBe(false);
  });

  it('2. findCounterAtariMoves identifies counter-captures and counter-ataris when friendly group is in atari', () => {
    // 构造局面：白棋被黑棋叫吃，但黑棋叫吃的棋子自身也只有 1-2 气
    let board = GoCore.createEmptyBoard(9);
    // 白棋 (4,4) 只有 1 气（被黑 (4,3), (4,5), (3,4) 包围，只剩 (5,4)）
    board = GoCore.playMove(board, { x: 4, y: 4 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 4, y: 3 }, 'black').nextState;
    board = GoCore.playMove(board, { x: 4, y: 5 }, 'black').nextState;
    board = GoCore.playMove(board, { x: 3, y: 4 }, 'black').nextState;

    // 此时黑棋 (3,4) 自身只有 1 气（四周有白子或空点被封），假设 (2,4) 是白棋，(3,3) 和 (3,5) 是白棋
    board = GoCore.playMove(board, { x: 2, y: 4 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 3, y: 3 }, 'white').nextState;
    // 黑棋 (3,4) 仅剩 (3,5) 一气，黑 (3,4) 叫吃了白 (4,4)
    // 白棋如果走 (3,5)，可以直接反提掉黑棋 (3,4) 解围！
    const legal = GoAI.getFastLegalMoves(board, 'white');
    const counterMoves = GoAI.findCounterAtariMoves(board, 'white', legal);

    expect(counterMoves.length).toBeGreaterThan(0);
    expect(counterMoves.some((p) => p.x === 3 && p.y === 5)).toBe(true);
  });

  it('3. isDeadEscapeMove identifies futile edge crawl / dead ladder as true', () => {
    // 构造一路/二路边线死征子局面：
    // 白子在 (0,1)，被黑子 (0,0) 和 (1,1) 叫吃，只剩 (0,2) 一气
    let board = GoCore.createEmptyBoard(9);
    board = GoCore.playMove(board, { x: 0, y: 1 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 0, y: 0 }, 'black').nextState;
    board = GoCore.playMove(board, { x: 1, y: 1 }, 'black').nextState;
    board = GoCore.playMove(board, { x: 1, y: 2 }, 'black').nextState; // 封死二路出头

    // 白棋如果逃 (0,2)，黑棋下一手走 (0,3) 再次一路贴身叫吃，且黑 (1,2) 挡死，逃跑必死
    const isDead = GoAI.isDeadEscapeMove(board, { x: 0, y: 2 }, 'white');
    expect(isDead).toBe(true);

    // 反之，如果白棋逃向开阔中央，气数增至 3+，则绝不是死逃
    let safeBoard = GoCore.createEmptyBoard(9);
    safeBoard = GoCore.playMove(safeBoard, { x: 4, y: 4 }, 'white').nextState;
    safeBoard = GoCore.playMove(safeBoard, { x: 4, y: 3 }, 'black').nextState;
    safeBoard = GoCore.playMove(safeBoard, { x: 4, y: 5 }, 'black').nextState;
    safeBoard = GoCore.playMove(safeBoard, { x: 3, y: 4 }, 'black').nextState;
    // 白棋逃 (5,4)，四周空旷，气数充足
    const isSafe = GoAI.isDeadEscapeMove(safeBoard, { x: 5, y: 4 }, 'white');
    expect(isSafe).toBe(false);
  });

  it('4. getEscapeDirectionScore prioritizes spacious center over first line', () => {
    const board = GoCore.createEmptyBoard(19);
    const centerPoint = { x: 9, y: 9 };
    const edgePoint = { x: 0, y: 5 };

    const scoreCenter = GoAI.getEscapeDirectionScore(board, centerPoint, 'white');
    const scoreEdge = GoAI.getEscapeDirectionScore(board, edgePoint, 'white');

    expect(scoreCenter).toBeGreaterThan(scoreEdge);
  });

  it('5. 战灵狐 (club) 在 19 路吃子赛中敏锐执行双叫吃手筋', () => {
    // 构造实战 19 路双弱棋局面
    let board = GoCore.createEmptyBoard(19);
    // 黑棋 (9,9) 只有 2 气 ((9,10) 与 (10,9))
    board = GoCore.playMove(board, { x: 9, y: 9 }, 'black').nextState;
    board = GoCore.playMove(board, { x: 9, y: 8 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 8, y: 9 }, 'white').nextState;

    // 黑棋 (11,9) 只有 2 气 ((11,10) 与 (10,9))
    board = GoCore.playMove(board, { x: 11, y: 9 }, 'black').nextState;
    board = GoCore.playMove(board, { x: 11, y: 8 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 12, y: 9 }, 'white').nextState;
    board.turn = 'white';

    const move = GoAI.getBestMove(board, 'white', {
      sparringLevel: 'club',
      captureTarget: 5,
    });

    // 战灵狐敏锐下在断点 (10,9) 发动双叫吃！
    expect(move).toEqual({ x: 10, y: 9 });
  });
});
