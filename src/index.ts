import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authMiddleware } from './auth/middleware';
import auth from './api/auth';
import technical from './api/technical/audits';
import reports from './api/exec/reports';
import hunter from './api/hunter/trigger';
import collections from './api/collections/generic';
import sse from './api/realtime/sse';
import scheduledHandler from './workers/hunter';
import storage from './api/storage/handler';
import schema from './api/schema/admin';
import search from './api/ai/search';
import crm from './api/crm/operations';
import { processNicheDiscovery } from './api/hunter/hunter_engine';

const app = new Hono<{ Bindings: any }>();

// Global Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PATCH', 'DELETE', 'PUT'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
}));

// 1. Health Check
app.get('/', (c) => c.text('CloudBase API is Online in Creston!'));

// 2. Authentication Routes (Public)
app.route('/api/auth', auth);

// PocketBase Parity: Magic Link Auth (Basics)
app.post('/api/auth/magic', async (c) => {
  const { email } = await c.req.json();
  const token = crypto.randomUUID().slice(0, 8); // 8-char PIN
  
  // Logic: Send email via Cloudflare Email Workers or Mailgun
  console.log(`[AUTH] Magic PIN for ${email}: ${token}`);
  
  return c.json({ 
    success: true, 
    message: "Magic Link Issued (Check logs)",
    pin: token // Mocked for local testing
  });
});

// 3. Public AI Audit (Lite)
app.post('/api/public/audit-lite', async (c) => {
  const { url } = await c.req.json();
  const res = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', { 
    prompt: 'Analyze this site for technical debt and MSP opportunities: ' + url 
  });
  return c.json({ summary: (res as any).response || (res as any).summary });
});

// 4. Public Client Portal (Phase 9: Transparency)
app.get('/api/portal/:id', async (c) => {
    const id = c.req.param('id');
    const lead = await c.env.DB.prepare(
        "SELECT company_name, website_url, ai_score, last_scanned_at, status FROM leads WHERE id = ?"
    ).bind(id).first();
    
    if (!lead) return c.json({ error: "Node not found" }, 404);

    const { results: history } = await c.env.DB.prepare(
        "SELECT score, scanned_at FROM monitor_history WHERE lead_id = ? ORDER BY scanned_at DESC LIMIT 5"
    ).bind(id).all();

    return c.json({ lead, history });
});

// 5. Protected CRM Sub-App
const api = new Hono<{ Bindings: any }>();

// JWT Guard - Extracts tenant_id and role
api.use('/*', (c, next) => authMiddleware(c.env.JWT_SECRET)(c, next));

// Mounted Protected Routes
api.route('/technical', technical);
api.route('/reports', reports);
api.route('/hunter', hunter);
api.route('/collections', collections); // PocketBase parity
api.route('/realtime', sse); // PocketBase parity
api.route('/storage', storage); // PB/SB parity
api.route('/schema', schema); // PB parity
api.route('/ai/search', search); // Supabase parity
api.route('/crm', crm); // Salesforce/SugarCRM parity

// Mount the Protected API to /api
app.route('/api', api);

export default {
    fetch: app.fetch,
    scheduled: scheduledHandler.scheduled
};