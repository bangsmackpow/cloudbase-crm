import { jwt } from 'hono/jwt';
import { createMiddleware } from 'hono/factory';

export const authMiddleware = (secret: string) => 
  createMiddleware(async (c, next) => {
    // 1. Check for token in Header (Standard) or Query Param (SSE/Media)
    const authHeader = c.req.header('Authorization');
    const authQuery = c.req.query('token');

    // If Authorization header is missing but Query token is present, 
    // we inject it into the header for the Hono JWT middleware.
    if (!authHeader && authQuery) {
      c.req.header('Authorization', `Bearer ${authQuery}`);
    }

    const handler = jwt({ secret });
    try {
      await handler(c, async () => {
        const payload = c.get('jwtPayload');
        if (!payload.tenant_id) return c.json({ error: 'Forbidden' }, 403);
        await next();
      });
    } catch (e) { 
      return c.json({ error: 'Unauthorized', message: 'JWT Verification Failed' }, 401); 
    }
  });