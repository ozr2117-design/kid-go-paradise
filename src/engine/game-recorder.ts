import {
  AISparringLevel,
  BoardSize,
  Color,
  Move,
  WinRuleMode,
} from '../types/go';

/** 一局对弈的完整记录，用于家长导出、AI 分析孩子棋路 */
export interface GameRecord {
  id: string;
  timestamp: number;
  boardSize: BoardSize;
  winRule: WinRuleMode;
  opponent: string;
  aiLevel: AISparringLevel;
  playerColor: Color;
  winner: 'player' | 'ai' | 'draw';
  playerCaptures: number;
  aiCaptures: number;
  totalMoves: number;
  moves: Move[];
}

const STORAGE_KEY = 'weiqi-kids-game-records';
const MAX_RECORDS = 200;

export function saveGameRecord(record: GameRecord): void {
  try {
    const list = loadGameRecords();
    list.push(record);
    if (list.length > MAX_RECORDS) {
      list.splice(0, list.length - MAX_RECORDS);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // localStorage 不可用（隐私模式等）时静默失败，不影响对局
  }
}

export function loadGameRecords(): GameRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GameRecord[]) : [];
  } catch {
    return [];
  }
}

/** 取最近一局记录（结算页「导出棋谱」用） */
export function loadLatestRecord(): GameRecord | null {
  const list = loadGameRecords();
  return list.length > 0 ? list[list.length - 1] : null;
}

const COL_LETTERS = 'ABCDEFGHJKLMNOPQRST'; // 围棋坐标跳过 I

/** 把 {x,y} 转成围棋标准坐标，如 (3,4) on 13路 -> "D9" */
function pointToCoord(m: Move, size: number): string {
  const col = COL_LETTERS[m.x] ?? String(m.x);
  const row = size - m.y;
  return `${col}${row}`;
}

/** 导出单局为可读文本（家长复制后发给 AI 分析） */
export function exportGameRecord(record: GameRecord): string {
  const when = new Date(record.timestamp).toLocaleString('zh-CN', {
    hour12: false,
  });
  const winnerText =
    record.winner === 'player'
      ? '你赢'
      : record.winner === 'ai'
        ? 'AI 赢'
        : '平局';
  const ruleText =
    record.winRule === 'timed-capture'
      ? '限时吃子'
      : record.winRule === 'capture'
        ? '吃子战'
        : '全盘围空';

  const blackMoves: string[] = [];
  const whiteMoves: string[] = [];
  record.moves.forEach((m, i) => {
    const coord = pointToCoord(m, record.boardSize);
    if (m.color === 'black') blackMoves.push(`${i + 1}.${coord}`);
    else whiteMoves.push(`${i + 1}.${coord}`);
  });

  return [
    `【森森围棋对局记录】`,
    `时间: ${when}`,
    `对手: ${record.opponent}`,
    `盘型: ${record.boardSize}路 | 模式: ${ruleText}`,
    `结果: ${winnerText}（你吃 ${record.playerCaptures} : AI吃 ${record.aiCaptures}）`,
    `执子: ${record.playerColor === 'black' ? '黑' : '白'}`,
    `总手数: ${record.totalMoves}`,
    `黑棋: ${blackMoves.join(' ')}`,
    `白棋: ${whiteMoves.join(' ')}`,
  ].join('\n');
}
