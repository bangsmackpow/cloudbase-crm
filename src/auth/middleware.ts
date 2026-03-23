import { jwt } from 'hono/jwt';
import { createMiddleware } from 'hono/factory';

export const authMiddleware = (secret: string) => 
  createMiddleware(async (c, next) => {
    // 1. Correctly handle token in Header (Standard) or Query Param (SSE/Media)
    const authHeader = c.req.header('Authorization');
    const authQuery = c.req.query('token');

    // Hono's jwt middleware reads from c.req.header('Authorization')
    if (!authHeader && authQuery) {
        c.req.raw.headers.set('Authorization', `Bearer ${authQuery}`);
    }

    // 2. We chain the built-in JWT middleware
    const handler = jwt({ 
        secret,
        alg: 'HS256'
    });

    try {
      // Use the built-in logic and perform tenant validation within the success callback
      return await handler(c, async () => {
          const payload = c.get('jwtPayload') as any;
          
          if (!payload || !payload.tenant_id) {
              // Instead of returning c.json (which fails type check), we throw to catch block
              throw new Error('Missing Tenant Context');
          }
          
          // Successful JWT + Tenant validation
          await next();
      });
    } catch (e: any) { 
      const status = e.message === 'Missing Tenant Context' ? 403 : 401;
      return c.json({ error: 'Unauthorized', message: e.message }, status as any); 
    }
  });