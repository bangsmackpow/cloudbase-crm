import { Hono } from 'hono';
import { processNicheDiscovery, processWebDiscovery } from './hunter_engine';

const hunter = new Hono<{ 
  Bindings: any, 
  Variables: { jwtPayload: any } 
}>();

// Trigger AI Discovery
hunter.post('/trigger', async (c) => {
  const user = c.get('jwtPayload');
  const { niche, location } = await c.req.json();

  if (!niche || !location) {
    return c.json({ success: false, error: "Niche and Location are required." }, 400);
  }

  const result = await processNicheDiscovery(niche, location, c.env, user.tenant_id);
  return c.json(result);
});

// Trigger Web Search Discovery
hunter.post('/web', async (c) => {
    const user = c.get('jwtPayload');
    const { niche, location } = await c.req.json();
  
    if (!niche || !location) {
      return c.json({ success: false, error: "Niche and Location are required." }, 400);
    }
  
    const result = await processWebDiscovery(niche, location, c.env, user.tenant_id);
    return c.json(result);
});

export default hunter;
