import { Hono } from 'hono';

const search = new Hono<{ Bindings: any }>();

// GET /api/search/smart (Supabase AI Parity)
search.get('/smart', async (c) => {
  const query = c.req.query('q');
  const user = c.get('jwtPayload');

  if (!query) return c.json({ results: [] });

  // 1. Initial D1 Keyword Filtering (Performance Layer)
  const { results: rawLeads } = await c.env.DB.prepare(
    "SELECT * FROM leads WHERE tenant_id = ? AND (company_name LIKE ? OR technical_stack LIKE ?) LIMIT 20"
  ).bind(user.tenant_id, `%${query}%`, `%${query}%`).all();

  // 2. AI Semantic Re-ranking (Llama 3.1 Intelligence Layer)
  // Instead of simple keyword match, we ask Llama to rank relevance
  const prompt = `User Query: "${query}"
    Target Leads:
    ${rawLeads.map((l: any, i: number) => `${i}. ${l.company_name} - ${l.technical_stack}`).join('\n')}
    Respond with a JSON array of indices [0, 1, 2...] ranked by relevance. 
    Return ONLY JSON.`;

  const rankingRes = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    prompt
  });

  const responseText = (rankingRes as any).response || "";
  let rankedIndices = [];
  try {
    const match = responseText.match(/\[.*\]/s);
    if (match) {
        rankedIndices = JSON.parse(match[0]);
    }
  } catch (e) {
    console.warn("AI Ranking failed, using keyword sort", e);
    return c.json({ results: rawLeads });
  }

  const results = rankedIndices
    .map((idx: number) => rawLeads[idx])
    .filter(Boolean);

  return c.json({ 
    results: results.length > 0 ? results : rawLeads,
    engine: 'Edge-AI (Llama 3.1)' 
  });
});

export default search;
