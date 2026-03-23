import { Hono } from 'hono';
import { stream } from 'hono/streaming';

const realtime = new Hono<{ Bindings: any }>();

realtime.get('/leads', (c) => {
  const user = c.get('jwtPayload');
  
  return stream(c, async (stream) => {
    // 1. Send initial heartbeat
    await stream.write(`data: ${JSON.stringify({ type: 'connected', tenantId: user.tenant_id })}\n\n`);

    let lastLeadsCount = 0;
    
    // 2. Poll the DB every 5 seconds (Edge simulated realtime)
    // Note: In production, D1 changes usually trigger a Webhook or Durable Object broadcast.
    while (true) {
      const { results } = await c.env.DB.prepare(
        "SELECT count(*) as count FROM leads WHERE tenant_id = ?"
      ).bind(user.tenant_id).all();

      const count = results[0]?.count || 0;
      
      if (count !== lastLeadsCount) {
        lastLeadsCount = count;
        // Signal a refresh needed
        await stream.write(`data: ${JSON.stringify({ type: 'update', collection: 'leads', count })}\n\n`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  });
});

export default realtime;
