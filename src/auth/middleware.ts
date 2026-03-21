import { jwt } from 'hono/jwt';
import { createMiddleware } from 'hono/factory';

export const authMiddleware = (secret: string) => 
  createMiddleware(async (c, next) => {
    const handler = jwt({ secret });
    try {
      await handler(c, async () => {
        const payload = c.get('jwtPayload');
        if (!payload.tenant_id) return c.json({ error: 'Forbidden' }, 403);
        await next();
      });
    } catch (e) { return c.json({ error: 'Unauthorized' }, 401); }
  });