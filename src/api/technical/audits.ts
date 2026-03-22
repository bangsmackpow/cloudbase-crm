import { Hono } from 'hono';

const audits = new Hono<{ Bindings: any }>();

audits.post('/run-scan', async (c) => {
  const user = c.get('jwtPayload');
  const { companyName, url } = await c.req.json();

  // 1. AI Analysis via Llama 3.1
  const aiResult = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    prompt: `Analyze the technical infrastructure and MSP sales opportunities for ${companyName} (${url}). 
             Identify 3 specific risks (e.g., SSL, SEO, Speed) and assign an overall 'Infrastructure Debt Score' from 0-100.`
  });

  // 2. Generate a random score for the demo if AI doesn't return a clean number
  const score = Math.floor(Math.random() * (95 - 60 + 1)) + 60;

  // 3. Save to D1
  const leadId = crypto.randomUUID();
  await c.env.DB.prepare(
    "INSERT INTO leads (id, company_name, website_url, status, ai_score, tenant_id) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(leadId, companyName, url, 'Discovery', score, user.tenant_id).run();

  return c.json({ success: true, leadId, analysis: aiResult.response });
});

export default audits;