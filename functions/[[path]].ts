/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';

// D1 and R2 types are provided by @cloudflare/workers-types
interface Env {
  DB: D1Database;
  CHALKBOARD_ASSETS: R2Bucket;
  JWT_SECRET: string;
}

type Variables = {
  orgSubdomain: string;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>().basePath('/api');

/**
 * Multi-tenancy Middleware
 * Detects the organization via subdomain or custom header
 */
app.use('*', async (c, next) => {
  const host = c.req.header('host') || '';
  let orgSubdomain = '';
  
  if (host.includes('.chalkboard.com')) {
    orgSubdomain = host.split('.')[0];
  } else {
    orgSubdomain = c.req.header('x-org-subdomain') || 'default';
  }
  
  c.set('orgSubdomain', orgSubdomain);
  await next();
});

// Health check -> /api/health
app.get('/health', (c) => c.json({ 
  status: 'ok', 
  domain: c.get('orgSubdomain'),
  version: '1.0.0-alpha'
}));

/**
 * Boards API (Multi-tenant scoped)
 */
app.get('/boards', async (c) => {
  try {
    const orgSubdomain = c.get('orgSubdomain');
    
    // Organization Lookup
    const org = await c.env.DB.prepare('SELECT id FROM organizations WHERE subdomain = ?')
      .bind(orgSubdomain)
      .first<{ id: string }>();

    if (!org) return c.json({ error: 'Organization not found' }, 404);

    const result = await c.env.DB.prepare(`
      SELECT b.* FROM boards b 
      JOIN workspaces w ON b.workspace_id = w.id 
      WHERE w.org_id = ?
    `).bind(org.id).all();
    
    return c.json(result.results);
  } catch (err: any) {
    return c.json({ error: 'Database error', message: err.message }, 500);
  }
});

export const onRequest = handle(app);
