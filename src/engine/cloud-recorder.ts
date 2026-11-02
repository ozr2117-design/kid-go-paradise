import {
  GameRecord,
  getUnsyncedRecords,
  markRecordsSynced,
} from './game-recorder';

/**
 * 确定棋谱上报端点：
 * 1. 优先使用 Cloudflare Pages 同源相对路径 '/api/record'，彻底解决 workers.dev 在大陆被 GFW 阻断问题；
 * 2. 在非 Web/本地静态调试环境下，回退至线上主站同源接口 'https://weiqi-kids.pages.dev/api/record'。
 */
function getApiEndpoint(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    if (origin.startsWith('http') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      return '/api/record';
    }
  }
  return 'https://weiqi-kids.pages.dev/api/record';
}

function formatPayload(r: GameRecord) {
  return {
    played_at: r.timestamp,
    board_size: r.boardSize,
    win_rule: r.winRule,
    opponent: r.opponent,
    ai_level: r.aiLevel,
    player_color: r.playerColor,
    winner: r.winner,
    player_captures: r.playerCaptures,
    ai_captures: r.aiCaptures,
    total_moves: r.totalMoves,
    moves_json: JSON.stringify(r.moves),
  };
}

let isSyncing = false;

/**
 * 自动挽救并同步本地未上传的棋谱：
 * 扫描 localStorage 中所有未标记 synced 的历史棋谱（例如此前因 workers.dev 域名受阻积压的对局），
 * 批量推送至云端 D1 数据库，并标记为已同步。
 */
export async function syncPendingLocalRecords(): Promise<number> {
  if (isSyncing) return 0;
  const pending = getUnsyncedRecords();
  if (!pending || pending.length === 0) return 0;

  isSyncing = true;
  try {
    const endpoint = getApiEndpoint();
    const batch = pending.slice(0, 30); // 每次最多同步 30 局
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: batch.map(formatPayload) }),
    });

    if (res.ok) {
      const ids = batch.map((r) => r.id);
      markRecordsSynced(ids);
      console.log(`[棋谱同步] 成功补传 ${batch.length} 局历史棋谱至云端`);
      return batch.length;
    }
    return 0;
  } catch (e) {
    console.warn('[棋谱同步] 后台补传历史棋谱遇阻，保留本地数据', e);
    return 0;
  } finally {
    isSyncing = false;
  }
}

/**
 * 把当前一局棋谱上传到 Cloudflare D1，并自动触发未同步历史棋谱的批量补传。
 */
export async function uploadGameRecord(record: GameRecord): Promise<boolean> {
  try {
    const endpoint = getApiEndpoint();
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formatPayload(record)),
    });

    if (res.ok) {
      markRecordsSynced([record.id]);
      // 成功后顺便异步检查补传之前遗留的本地棋谱
      setTimeout(() => {
        syncPendingLocalRecords().catch(() => {});
      }, 500);
      return true;
    }
    return false;
  } catch (e) {
    console.warn('[棋谱上传] 云端直传受阻，已安全保存在本地 localStorage，后续将自动补传', e);
    return false;
  }
}
