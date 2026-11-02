// Cloudflare Pages Function: /api/record
// 接收前端棋谱上报并写入 D1 数据库 (weiqi-kids-db)
// 具备 D1 Binding 与 Cloudflare REST API 双重通道，同源直达，彻底解决 workers.dev 大陆阻断

const CF_ACCOUNT_ID = '006960eb51dac6fb10e8b8b253083c1f';
const CF_D1_DATABASE_ID = '87149d92-522c-4fe4-a4ed-6a6b9d4fef29';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function onRequestGet(context) {
  const { env } = context;
  try {
    if (env && env.DB) {
      const res = await env.DB.prepare('SELECT COUNT(*) as count FROM game_records').first();
      return new Response(
        JSON.stringify({ ok: true, d1_binding: true, count: res ? res.count : 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = env?.CF_D1_TOKEN || env?.CLOUDFLARE_API_TOKEN;
    if (!token) {
      return new Response(
        JSON.stringify({ ok: true, d1_binding: false, message: 'Ready (waiting for binding or token)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 备用：边缘节点直连 D1 REST 接口
    const fallbackRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_D1_DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql: 'SELECT COUNT(*) as count FROM game_records;' }),
      }
    );
    const data = await fallbackRes.json();
    const count = data?.result?.[0]?.results?.[0]?.count ?? 0;
    return new Response(
      JSON.stringify({ ok: true, d1_binding: false, count }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const records = Array.isArray(body)
      ? body
      : Array.isArray(body.records)
      ? body.records
      : [body];

    if (records.length === 0) {
      return new Response(JSON.stringify({ ok: true, count: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. 若 Pages 绑定了 env.DB（优先原生零开销 Binding）
    if (env && env.DB) {
      const stmt = env.DB.prepare(
        `INSERT INTO game_records
          (played_at, board_size, win_rule, opponent, ai_level, player_color,
           winner, player_captures, ai_captures, total_moves, moves_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      const batch = records.map((r) =>
        stmt.bind(
          r.played_at,
          r.board_size,
          r.win_rule,
          r.opponent,
          r.ai_level,
          r.player_color,
          r.winner,
          r.player_captures,
          r.ai_captures,
          r.total_moves,
          typeof r.moves_json === 'string' ? r.moves_json : JSON.stringify(r.moves_json || [])
        )
      );
      await env.DB.batch(batch);
      return new Response(
        JSON.stringify({ ok: true, mode: 'd1-binding', inserted: records.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. 备用链路：通过环境变量 Token 调用 D1 REST API
    const token = env?.CF_D1_TOKEN || env?.CLOUDFLARE_API_TOKEN;
    if (!token) {
      throw new Error('D1 binding (env.DB) not configured and no API token provided.');
    }

    for (const r of records) {
      const movesStr =
        typeof r.moves_json === 'string' ? r.moves_json : JSON.stringify(r.moves_json || []);
      const sqlRes = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_D1_DATABASE_ID}/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sql: `INSERT INTO game_records
                    (played_at, board_size, win_rule, opponent, ai_level, player_color,
                     winner, player_captures, ai_captures, total_moves, moves_json)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            params: [
              r.played_at,
              r.board_size,
              r.win_rule,
              r.opponent,
              r.ai_level,
              r.player_color,
              r.winner,
              r.player_captures,
              r.ai_captures,
              r.total_moves,
              movesStr,
            ],
          }),
        }
      );
      if (!sqlRes.ok) {
        const errText = await sqlRes.text();
        throw new Error(`D1 REST API error: ${sqlRes.status} ${errText}`);
      }
    }

    return new Response(
      JSON.stringify({ ok: true, mode: 'd1-rest-api', inserted: records.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
