import { Hono } from 'hono';
import { processNicheDiscovery } from './hunter_engine';

const hunter = new Hono<{ Bindings: any }>();

// Trigger a scan for a specific niche and location
hunter.post('/trigger', async (c) => {
  const user = c.get('jwtPayload');
  const { niche, location } = await c.req.json();

  if (!niche || !location) {
    return c.json({ success: false, error: "Niche and Location are required." }, 400);
  }

  // 1. Trigger AI Discovery and Infrastructure Scan
  const result = await processNicheDiscovery(niche, location, c.env, user.tenant_id);

  return c.json(result);
});

export default hunter;
