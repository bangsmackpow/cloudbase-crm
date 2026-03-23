import { Hono } from 'hono';

const reports = new Hono<{ Bindings: any }>();

// GET /api/reports/dossier/:id (AI Generation)
reports.get('/dossier/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload');

  // 1. Fetch Lead Context
  const lead = await c.env.DB.prepare(
    "SELECT * FROM leads WHERE id = ? AND tenant_id = ?"
  ).bind(id, user.tenant_id).first();

  if (!lead) return c.json({ error: "Lead not found" }, 404);

  // 2. Generate Detailed AI Dossier
  const prompt = `System: You are an expert MSP (Managed Service Provider) architecture auditor.
    Task: Generate a technical dossier and sales strategy for the following business.
    Lead: ${lead.company_name}
    Website: ${lead.website_url}
    Technical Debt Score: ${lead.ai_score}
    Detected Stack: ${lead.technical_stack}

    Structure the response in JSON with these keys: 
    - "executiveSummary": One paragraph on the risks.
    - "vulnerabilities": Array of 3 specific technical risks.
    - "mspStrategy": How to pitch the solution (Creston local context).
    - "estimatedRecoveryTime": Days to fix debt.`;

  const dossierRes = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    prompt
  });

  const responseText = (dossierRes as any).response || "";
  let data = {};
  try {
     const match = responseText.match(/\{.*\}/s);
     if (match) data = JSON.parse(match[0]);
  } catch (e) {
     data = { error: "AI Format failed", raw: responseText };
  }

  return c.json({ lead, dossier: data });
});

export default reports;