/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

// D1 and R2 types are provided by @cloudflare/workers-types
interface Env {
  DB: D1Database;
  CHALKBOARD_ASSETS: R2Bucket;
  JWT_SECRET: string;
}

type User = {
  id: string;
  email: string;
  full_name?: string;
};

type Variables = {
  orgSubdomain: string;
  user?: User;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>().basePath('/api');

/**
 * Multi-tenancy & Auth Middleware
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

  // Session Check
  const sessionToken = getCookie(c, 'cb_session');
  if (sessionToken) {
    const session = await c.env.DB.prepare(`
      SELECT u.id, u.email, u.full_name 
      FROM sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.id = ? AND s.expires_at > DATETIME('now')
    `).bind(sessionToken).first<User>();
    
    if (session) {
      c.set('user', session);
    }
  }

  await next();
});

const requireAuth = async (c: any, next: any) => {
  if (!c.get('user')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
};

// Health check
app.get('/health', (c) => c.json({ 
  status: 'ok', 
  domain: c.get('orgSubdomain'),
  user: c.get('user')?.email || null
}));

/**
 * Auth Endpoints
 */

// 1. Generate Magic Link
app.post('/auth/magic-link', async (c) => {
  const { email } = await c.req.json();
  const orgSubdomain = c.get('orgSubdomain');

  const org = await c.env.DB.prepare('SELECT id FROM organizations WHERE subdomain = ?')
    .bind(orgSubdomain).first<{ id: string }>();

  if (!org) return c.json({ error: 'Organization not found' }, 404);

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

  await c.env.DB.prepare('INSERT INTO magic_links (id, email, org_id, expires_at) VALUES (?, ?, ?, ?)')
    .bind(token, email, org.id, expiresAt).run();

  // In production, send email. For dev, log to console.
  console.log(`[AUTH] Magic Link for ${email}: http://localhost:8788/api/auth/verify?token=${token}`);
  
  return c.json({ success: true, message: 'Magic link generated (Check server logs)' });
});

// 2. Verify Magic Link & Create Session
app.get('/auth/verify', async (c) => {
  const token = c.req.query('token');
  if (!token) return c.redirect('/login?error=invalid_token');

  const link = await c.env.DB.prepare('SELECT * FROM magic_links WHERE id = ? AND expires_at > DATETIME(\'now\')')
    .bind(token).first<{ email: string, org_id: string }>();

  if (!link) return c.redirect('/login?error=expired_token');

  // Find or Create User
  let user = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
    .bind(link.email).first<{ id: string }>();

  if (!user) {
    const userId = crypto.randomUUID();
    await c.env.DB.prepare('INSERT INTO users (id, email) VALUES (?, ?)')
      .bind(userId, link.email).run();
    user = { id: userId };
  }

  // Create Session
  const sessionToken = crypto.randomUUID();
  const sessionExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
  
  await c.env.DB.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(sessionToken, user.id, sessionExpires).run();

  // Cleanup used link
  await c.env.DB.prepare('DELETE FROM magic_links WHERE id = ?').bind(token).run();

  setCookie(c, 'cb_session', sessionToken, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 7 * 24 * 60 * 60
  });

  return c.redirect('/dashboard');
});

app.post('/auth/logout', async (c) => {
  const token = getCookie(c, 'cb_session');
  if (token) {
    await c.env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(token).run();
  }
  deleteCookie(c, 'cb_session');
  return c.json({ success: true });
});

/**
 * Protected Boards API
 */
app.get('/boards', requireAuth, async (c) => {
  const orgSubdomain = c.get('orgSubdomain');
  const org = await c.env.DB.prepare('SELECT id FROM organizations WHERE subdomain = ?')
    .bind(orgSubdomain).first<{ id: string }>();

  if (!org) return c.json({ error: 'Organization not found' }, 404);

  const result = await c.env.DB.prepare(`
    SELECT b.* FROM boards b 
    JOIN workspaces w ON b.workspace_id = w.id 
    WHERE w.org_id = ?
  `).bind(org.id).all();
  
  return c.json(result.results);
});

export const onRequest = handle(app);
