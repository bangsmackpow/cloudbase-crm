import { Hono } from 'hono';
const technical = new Hono<{ Bindings: any }>();

technical.post('/:leadId', async (c) => {
  const { leadId } = c.req.param();
  const user = c.get('jwtPayload');
  const content = await c.req.text();
  const ts = Date.now();
  const r2Key = `tenants/${user.tenant_id}/leads/${leadId}/audits/${ts}.md`;

  // Store in R2
  await c.env.BUCKET.put(r2Key, content);

  // Store pointer in D1
  await c.env.DB.prepare(
    "INSERT INTO audit_history (id, lead_id, tenant_id, r2_key, version_ts, created_by) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(crypto.randomUUID(), leadId, user.tenant_id, r2Key, ts, user.id).run();

  return c.json({ success: true, r2Key });
});

export default technical;