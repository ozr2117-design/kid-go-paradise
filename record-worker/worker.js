// 森森围棋 · 棋谱上传 Worker
// 接收 app POST 来的棋谱，写入 Cloudflare D1。D1 binding 名为 DB（见 wrangler.toml）。
export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const body = await request.json();
      const {
        played_at,
        board_size,
        win_rule,
        opponent,
        ai_level,
        player_color,
        winner,
        player_captures,
        ai_captures,
        total_moves,
        moves_json,
      } = body;

      await env.DB.prepare(
        `INSERT INTO game_records
          (played_at, board_size, win_rule, opponent, ai_level, player_color,
           winner, player_captures, ai_captures, total_moves, moves_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          played_at,
          board_size,
          win_rule,
          opponent,
          ai_level,
          player_color,
          winner,
          player_captures,
          ai_captures,
          total_moves,
          moves_json
        )
        .run();

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: String(e) }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
