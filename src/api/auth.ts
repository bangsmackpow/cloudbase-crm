import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { verifyPassword } from '../auth/crypto';

const auth = new Hono<{ 
  Bindings: any, 
  Variables: { jwtPayload: any } 
}>();

auth.get('/users', async (c) => {
  const user = c.get('jwtPayload');
  if (user.role !== 'admin') return c.json({ error: "Forbidden" }, 403);
  
  const { results } = await c.env.DB.prepare(
    "SELECT id, email, role, created_at FROM _users WHERE tenant_id = ? ORDER BY created_at DESC"
  ).bind(user.tenant_id).all();
  
  return c.json(results);
});

auth.post('/login', async (c) => {
  const { email, password } = await c.req.json();
  
  const user = await c.env.DB.prepare(
    "SELECT u.*, t.flavor FROM _users u JOIN tenants t ON u.tenant_id = t.id WHERE u.email = ?"
  ).bind(email).first();

  if (!user || !(await verifyPassword(password, user.password_hash as string))) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const payload = {
    sub: user.id,
    email: user.email,
    tenant_id: user.tenant_id,
    role: user.role,
    flavor: user.flavor,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) 
  };

  const token = await sign(payload, c.env.JWT_SECRET, 'HS256');
  return c.json({ token, user: { email: user.email, role: user.role } });
});

export default auth;