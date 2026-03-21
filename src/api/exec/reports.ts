$reportsTs = @'
import { Hono } from 'hono';
const reports = new Hono<{ Bindings: any }>();

reports.get('/pipeline', async (c) => {
  const user = c.get('jwtPayload');
  const { results } = await c.env.DB.prepare(
    "SELECT status, COUNT(*) as count FROM leads WHERE tenant_id = ? GROUP BY status"
  ).bind(user.tenant_id).all();
  return c.json(results);
});

export default reports;
'@