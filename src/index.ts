import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authMiddleware } from './auth/middleware';
import auth from './api/auth';
import technical from './api/technical/audits';
import reports from './api/exec/reports';

const app = new Hono<{ Bindings: any }>();

// Global Middleware
app.use('*', cors());

// 1. Health Check
app.get('/', (c) => c.text('CloudBase API is Online in Creston!'));

// 2. Authentication Routes (Public)
app.route('/api/auth', auth);

// 3. Public AI Audit (Lite)
app.post('/api/public/audit-lite', async (c) => {
  const { url } = await c.req.json();
  const res = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', { 
    prompt: 'Analyze this site for technical debt and MSP opportunities: ' + url 
  });
  return c.json({ summary: res.response });
});

// 4. Protected CRM Sub-App
const api = new Hono<{ Bindings: any }>();

// JWT Guard - Extracts tenant_id and role
api.use('/*', (c, next) => authMiddleware(c.env.JWT_SECRET)(c, next));

// Mounted Protected Routes
api.route('/technical', technical);
api.route('/reports', reports);

api.get('/leads', async (c) => {
  const user = c.get('jwtPayload');
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM leads WHERE tenant_id = ? ORDER BY created_at DESC"
  ).bind(user.tenant_id).all();
  return c.json(results);
});

// Mount the Protected API to /api
app.route('/api', api);

export default app;