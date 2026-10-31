import { describe, it, expect } from 'vitest';
import { GoCore } from './go-core';
import { GoAI } from './go-ai';

/**
 * 针对 v9.4 三处修复的回归测试：
 * 1. 第一期：吃子模式下 sparringLevel → difficulty 难度映射（novice/club 不再落到最强龙档）
 * 2. 第二期 2b：吃子体系（龙档 2-ply 极小极大）无棋可下时不再硬塞自填真眼的烂棋
 */
describe('GoAI capture-mode regression (v9.4)', () => {
  it('every sparringLevel returns a legal move in capture mode (no tier fallthrough crash)', () => {
    let board = GoCore.createEmptyBoard(13);
    board = GoCore.playMove(board, { x: 3, y: 3 }, 'black').nextState;
    board = GoCore.playMove(board, { x: 4, y: 3 }, 'white').nextState;
    board = GoCore.playMove(board, { x: 3, y: 4 }, 'black').nextState;

    const levels = ['novice', 'club', 'master', 'grandmaster'] as const;
    for (const lvl of levels) {
      const move = GoAI.getBestMove(board, 'white', {
        sparringLevel: lvl,
        captureTarget: 5,
      });
      expect(move, `sparringLevel=${lvl} 应返回落子`).not.toBeNull();
      if (move) {
        expect(GoCore.isLegalMove(board, move, 'white').legal, `sparringLevel=${lvl} 落子应合法`).toBe(true);
      }
    }
  });

  it('capture mode maps sparringLevel onto the same branch as an explicit difficulty', () => {
    // 难度映射回归（v9.4 修复的 bug）：sparringLevel 必须被显式翻译成合法难度，
    // 而不是 as AIDifficulty 硬转后落到 default（= 最强龙档）。
    const mapping: Record<string, string> = {
      novice: 'advanced',        // 老鸟 → 狐
      club: 'master',            // 战灵狐 → 鹰
      master: 'grandmaster',     // 麒麟 → 龙
      grandmaster: 'grandmaster', // 龙尊 → 龙
    };

    const buildBoard = (variant: number) => {
      let board = GoCore.createEmptyBoard(13);
      board = GoCore.playMove(board, { x: 5, y: 5 }, 'black').nextState;
      board = GoCore.playMove(board, { x: 5, y: 4 }, 'white').nextState;
      board = GoCore.playMove(board, { x: 6, y: 5 }, 'black').nextState;
      board = GoCore.playMove(board, { x: 4, y: 4 }, 'white').nextState;
      board = GoCore.playMove(board, { x: 4, y: 5 }, 'black').nextState;
      board = GoCore.playMove(board, { x: 6, y: 6 }, 'white').nextState;
      if (variant === 1) {
        board = GoCore.playMove(board, { x: 3, y: 6 }, 'black').nextState;
        board = GoCore.playMove(board, { x: 7, y: 4 }, 'white').nextState;
        board = GoCore.playMove(board, { x: 2, y: 8 }, 'black').nextState;
      }
      return board;
    };

    for (const variant of [0, 1]) {
      const board = buildBoard(variant);
      for (const [lvl, diff] of Object.entries(mapping)) {
        const viaLevel = GoAI.getBestMove(board, 'black', {
          sparringLevel: lvl as 'novice' | 'club' | 'master' | 'grandmaster',
          captureTarget: 5,
        });
        const viaDiff = GoAI.getBestMove(board, 'black', {
          difficulty: diff as 'advanced' | 'master' | 'grandmaster',
          captureTarget: 5,
        });
        const fmt = (m: { x: number; y: number } | null) => (m ? `${m.x},${m.y}` : 'PASS');
        expect(fmt(viaLevel), `board${variant} sparringLevel=${lvl} 应等价于 difficulty=${diff}`).toBe(
          fmt(viaDiff)
        );
      }
    }
  });

  it('never self-fills a true eye, even when every point is a self-atari', () => {
    // v9.5 修复：吃子模式下 AI 不能「一颗一颗送子」。
    // v9.6 细化：只要棋盘上还有非眼位空点就必须落子（无安全点时退而求其次），
    // 否则 AI 会在残局反复停手；但「自填真眼」永远禁止，真终局才停手。
    let board = GoCore.createEmptyBoard(7);
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        board.grid[y][x] = 'white';
      }
    }
    board.grid[3][3] = null;
    board.grid[3][4] = null; // 白棋只剩两个互相成气的空点，填任何一个都是自叫吃
    board.turn = 'white';

    const move = GoAI.getBestMove(board, 'white', {
      sparringLevel: 'grandmaster',
      captureTarget: 5,
    });

    // 允许落子（避免残局反复停手），但绝不允许自填真眼
    if (move) {
      expect(GoCore.isTrueEye(board.grid, move, 'white', 7)).toBe(false);
      expect(GoCore.isLegalMove(board, move, 'white').legal).toBe(true);
    }
  });

  it('Dragon (grandmaster) in capture mode passes instead of self-filling a true eye (2b)', () => {
    let board = GoCore.createEmptyBoard(7);
    // 填满白子，只留 (3,3) 一个空点，且它是白棋唯一真眼
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        board.grid[y][x] = 'white';
      }
    }
    board.grid[3][3] = null;
    board.turn = 'white';

    const move = GoAI.getBestMove(board, 'white', {
      sparringLevel: 'grandmaster',
      captureTarget: 5, // 走吃子体系（而非全盘 isFullGame）
    });

    // 唯一合法落点 (3,3) 是自填真眼，AI 必须停手（返回 null），而不是硬塞烂棋
    expect(move).toBeNull();
  });

  it('tier ladder is monotonic: 战灵狐(club) must out-capture 老鸟(novice)', () => {
    // v9.6 回归：曾出现「战灵狐比老鸟还菜」——鹰档那套特化打分让它不敢进攻，
    // 被老鸟 101:8 打穿。现在鹰档改用 2-ply 搜索（4 候选），必须强于老鸟。
    const duel = (blackLvl: 'novice' | 'club', whiteLvl: 'novice' | 'club') => {
      let board = GoCore.createEmptyBoard(13);
      for (let i = 0; i < 200; i++) {
        if (board.isGameOver) break;
        if (board.captures.black >= 5 || board.captures.white >= 5) break;
        const turn = board.turn;
        const lvl = turn === 'black' ? blackLvl : whiteLvl;
        const mv = GoAI.getBestMove(board, turn, { sparringLevel: lvl, captureTarget: 5 });
        if (!mv) {
          board = GoCore.pass(board);
          continue;
        }
        const res = GoCore.playMove(board, mv, turn);
        if (res.error) break;
        board = res.nextState;
      }
      return [board.captures.black, board.captures.white] as const;
    };

    const [clubAsBlack, noviceAsWhite] = duel('club', 'novice');
    const [noviceAsBlack, clubAsWhite] = duel('novice', 'club');
    const clubTotal = clubAsBlack + clubAsWhite;
    const noviceTotal = noviceAsBlack + noviceAsWhite;

    expect(
      clubTotal,
      `战灵狐合计吃子 ${clubTotal}（黑${clubAsBlack}+白${clubAsWhite}）应多于老鸟 ${noviceTotal}（黑${noviceAsBlack}+白${noviceAsWhite}）`
    ).toBeGreaterThan(noviceTotal);
  }, 120000);

  /**
   * v9.8 回归：满盘僵持时 AI 绝不一颗一颗送子。
   * 曾经的行为：所有可下点都是「下进去只剩 1 气」时，代码会硬挑一个下，
   * 结果在 19 路残局被小选手连续收割（实测 48:5、71:17）。
   * 正确行为：宁可停手（吃子赛里停手只丢先手，送子却直接丢分）。
   */
  it('满盘只剩「下了就被提」的空腔时，AI 应当停手而不是喂子', () => {
    const b = GoCore.createEmptyBoard(9);
    for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) b.grid[y][x] = 'black';
    // 两处 2 格空腔：白棋下进去只剩 1 气，下一手必被提
    for (const h of [
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 5, y: 5 },
      { x: 6, y: 5 },
    ]) {
      b.grid[h.y][h.x] = null;
    }
    b.turn = 'white';
    b.moveHistory = [];

    const legal = GoAI.getFastLegalMoves(b, 'white');
    expect(legal.length).toBeGreaterThan(0); // 规则上"能下"
    for (const level of ['club', 'master', 'grandmaster'] as const) {
      const mv = GoAI.getBestMove(b, 'white', { sparringLevel: level, captureTarget: 20 });
      expect(mv, `${level} 不应往死空腔里填子`).toBeNull();
    }
  }, 60000);

  /**
   * v9.9 回归：限时吃子「双方都无棋可下」必须能结算。
   * 曾经的行为：判断「无棋可下」时，AI 用「无安全点」（排除死洞），
   * 小选手却用「无合法点」（死洞仍算合法）——两把尺子不一样，
   * 导致双方在死洞残局里互相停手、却永远不触发结算，只能干等 15 分钟计时结束。
   * 正确行为：hasMeaningfulMove 用和 AI 同一把尺子，死洞不算「有意义落点」。
   */
  it('全盘只剩死洞时，hasMeaningfulMove 应判 false（死洞不是有意义落点）', () => {
    const b = GoCore.createEmptyBoard(9);
    for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) b.grid[y][x] = 'black';
    // 四处 2 格死洞：白棋下进去只剩 1 气，规则上合法但属于送子
    for (const h of [
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 5, y: 5 },
      { x: 6, y: 5 },
    ]) {
      b.grid[h.y][h.x] = null;
    }
    b.turn = 'white';
    b.moveHistory = [];

    // 规则上仍「能下」（死洞是合法落点）——这正是旧代码误判「还有棋可下」的地方
    expect(GoAI.getFastLegalMoves(b, 'white').length).toBeGreaterThan(0);
    // 但没有任何「有意义」落点（全是送子/眼位）→ 双方都该停手结算
    expect(GoAI.hasMeaningfulMove(b, 'white')).toBe(false);
  }, 60000);

  it('盘面还有普通空点时，hasMeaningfulMove 应判 true', () => {
    const b = GoCore.createEmptyBoard(9);
    // 中间留一片空旷区域：白棋随便下都有气，属于有意义落点
    b.turn = 'white';
    expect(GoAI.hasMeaningfulMove(b, 'white')).toBe(true);
  }, 30000);
});
