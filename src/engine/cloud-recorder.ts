import { createWorkBuddyCloud } from '@tencent-ai/workbuddy-cloud-sdk';
import { cloudConfig } from '../cloud-config';
import { GameRecord } from './game-recorder';

// 棋谱表的 schema 类型（supabase 风格），让 SDK 的 from()/insert() 有正确类型。
type GameRecordRow = {
  id: number;
  played_at: number;
  board_size: number;
  win_rule: string;
  opponent: string;
  ai_level: string;
  player_color: string;
  winner: string;
  player_captures: number;
  ai_captures: number;
  total_moves: number;
  moves_json: string;
  created_at: string;
};

type Database = {
  Tables: {
    game_records: {
      Row: GameRecordRow;
      Insert: Omit<GameRecordRow, 'id' | 'created_at'>;
      Update: Partial<GameRecordRow>;
    };
  };
  Views: Record<string, never>;
  Functions: Record<string, never>;
};

// 云服务客户端：初始化一次，全局复用。
// 棋谱表 game_records 是 public 表（anon 可写），因此上传不需要登录。
const cloud = createWorkBuddyCloud<Database>({
  endpoint: cloudConfig.endpoint,
  oauthRelayBaseUrl: cloudConfig.oauthRelayBaseUrl,
  publishableKey: cloudConfig.publishableKey,
});

/**
 * 把一局棋谱上传到云端数据库，AI 侧可直接读表分析孩子棋路。
 * 返回 true 表示上传成功，false 表示失败（网络/未部署到正确域名等），
 * 失败时静默降级到本地 localStorage，不影响对局。
 */
export async function uploadGameRecord(record: GameRecord): Promise<boolean> {
  try {
    const { error } = await cloud.database.from('game_records').insert({
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
    });
    return !error;
  } catch (e) {
    // 上传失败不打断对局，只记日志；本地 localStorage 仍保留棋谱兜底
    console.warn('[棋谱上传] 云端上传失败，保留本地记录', e);
    return false;
  }
}
