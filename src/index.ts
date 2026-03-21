import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authMiddleware } from './auth/middleware';
import technical from './api/technical/audits';

// 1. Declare 'app' ONLY ONCE
const app = new Hono<{ Bindings: any }>();

// 2. Global Middleware
app.use('*', cors());

// 3. Health Check (To fix the 404 and verify it works)
app.get('/', (c) => c.text('CloudBase API is Online in Creston!'));

// 4. Public Audit Route
app.post('/api/public/audit-lite', async (c) => {
  const { url } = await c.req.json();
  // Ensure your wrangler.toml has [ai] binding enabled
  const res = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', { 
    prompt: 'Audit this site for technical debt: ' + url 
  });
  return c.json({ summary: res.response });
});

// 5. Protected CRM Sub-App
const api = new Hono<{ Bindings: any }>();

// Security Guard
api.use('/*', (c, next) => authMiddleware(c.env.JWT_SECRET)(c, next));

// Route Handlers
api.route('/technical', technical);

api.get('/leads', async (c) => {
  const user = c.get('jwtPayload');
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM leads WHERE tenant_id = ?"
  ).bind(user.tenant_id).all();
  return c.json(results);
});

// 6. Mount the Protected API to /api
app.route('/api', api);

export default app;