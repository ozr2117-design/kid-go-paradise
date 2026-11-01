import { GameRecord } from './game-recorder';

// 棋谱上传 Worker（Cloudflare Workers + D1），挂在独立域名，app 跨域 POST 即可。
const WORKER_URL = 'https://weiqi-kids-record.ozr2117.workers.dev';

/**
 * 把一局棋谱上传到 Cloudflare D1，AI 侧可直接读表分析孩子棋路。
 * 返回 true 表示上传成功，false 表示失败（断网等），失败时静默降级到本地 localStorage，不影响对局。
 */
export async function uploadGameRecord(record: GameRecord): Promise<boolean> {
  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        played_at: record.timestamp,
        board_size: record.boardSize,
        win_rule: record.winRule,
        opponent: record.opponent,
        ai_level: record.aiLevel,
        player_color: record.playerColor,
        winner: record.winner,
        player_captures: record.playerCaptures,
        ai_captures: record.aiCaptures,
        total_moves: record.totalMoves,
        moves_json: JSON.stringify(record.moves),
      }),
    });
    return res.ok;
  } catch (e) {
    // 上传失败不打断对局，只记日志；本地 localStorage 仍保留棋谱兜底
    console.warn('[棋谱上传] 云端上传失败，保留本地记录', e);
    return false;
  }
}
