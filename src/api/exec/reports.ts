import { Hono } from 'hono';

const reports = new Hono<{ Bindings: any }>();

reports.get('/stats', async (c) => {
  const user = c.get('jwtPayload');
  
  // Get counts by status for the dashboard charts
  const { results } = await c.env.DB.prepare(
    "SELECT status, COUNT(*) as total FROM leads WHERE tenant_id = ? GROUP BY status"
  ).bind(user.tenant_id).all();

  return c.json({
    summary: results,
    last_updated: new Date().toISOString()
  });
});

export default reports;