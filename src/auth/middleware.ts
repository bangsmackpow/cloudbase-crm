import { verify } from 'hono/jwt';
import { createMiddleware } from 'hono/factory';

export const authMiddleware = (secret: string) => 
  createMiddleware(async (c, next) => {
    // 1. Get token from Header (Bearer) or Query Param (SSE/Media)
    let token = '';
    const authHeader = c.req.header('Authorization');
    const authQuery = c.req.query('token');

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (authQuery) {
        token = authQuery;
    }

    if (!token) {
        return c.json({ error: 'Unauthorized', message: 'No token provided' }, 401);
    }

    try {
        // 2. Verify JWT manually (Avoids immutable header issues in Workers)
        const payload = await verify(token, secret);
        
        if (!payload || !payload.tenant_id) {
            return c.json({ error: 'Forbidden', message: 'Invalid token context' }, 403);
        }

        // 3. Set payload in context for routes
        c.set('jwtPayload', payload);
        await next();
    } catch (e: any) {
        return c.json({ error: 'Unauthorized', message: 'Invalid or expired token' }, 401);
    }
  });