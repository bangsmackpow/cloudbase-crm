import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { verifyPassword, hashPassword } from '../auth/crypto';
import { authMiddleware } from '../auth/middleware';

const auth = new Hono<{ 
  Bindings: any, 
  Variables: { jwtPayload: any } 
}>();

// 🔒 Middleware Guard for all management routes
auth.use('/users/*', (c, next) => authMiddleware(c.env.JWT_SECRET)(c, next));
auth.use('/users', (c, next) => authMiddleware(c.env.JWT_SECRET)(c, next));
auth.use('/me/*', (c, next) => authMiddleware(c.env.JWT_SECRET)(c, next));

// --- ADMIN: LIST ALL USERS ---
auth.get('/users', async (c) => {
  const user = c.get('jwtPayload');
  if (user.role?.toLowerCase() !== 'admin') return c.json({ error: "Forbidden" }, 403);
  
  const { results } = await c.env.DB.prepare(
    "SELECT id, email, role, created_at FROM _users WHERE tenant_id = ? ORDER BY created_at DESC"
  ).bind(user.tenant_id).all();
  
  return c.json(results);
});

// --- ADMIN: CREATE NEW USER ---
auth.post('/users', async (c) => {
    const user = c.get('jwtPayload');
    if (user.role?.toLowerCase() !== 'admin') return c.json({ error: "Forbidden" }, 403);
    
    const { email, password, role } = await c.req.json();
    const id = crypto.randomUUID();
    const passHash = await hashPassword(password);
    
    await c.env.DB.prepare(
        "INSERT INTO _users (id, tenant_id, email, password_hash, role) VALUES (?, ?, ?, ?, ?)"
    ).bind(id, user.tenant_id, email, passHash, role || 'staff').run();
    
    return c.json({ success: true, id });
});

// --- ADMIN: UPDATE ANY USER (EMAIL/PASSWORD/ROLE) ---
auth.patch('/users/:id', async (c) => {
    const admin = c.get('jwtPayload');
    if (admin.role?.toLowerCase() !== 'admin') return c.json({ error: "Forbidden" }, 403);
    const targetId = c.req.param('id');
    const { email, password, role } = await c.req.json();
    
    let query = "UPDATE _users SET updated_at = CURRENT_TIMESTAMP";
    const params = [];
    
    if (email) { query += ", email = ?"; params.push(email); }
    if (role) { query += ", role = ?"; params.push(role); }
    if (password) { 
        const passHash = await hashPassword(password);
        query += ", password_hash = ?"; params.push(passHash); 
    }
    
    query += " WHERE id = ? AND tenant_id = ?";
    params.push(targetId, admin.tenant_id);
    
    await c.env.DB.prepare(query).bind(...params).run();
    return c.json({ success: true });
});

// --- ADMIN: DELETE USER ---
auth.delete('/users/:id', async (c) => {
    const admin = c.get('jwtPayload');
    if (admin.role?.toLowerCase() !== 'admin') return c.json({ error: "Forbidden" }, 403);
    const targetId = c.req.param('id');
    
    await c.env.DB.prepare("DELETE FROM _users WHERE id = ? AND tenant_id = ?").bind(targetId, admin.tenant_id).run();
    return c.json({ success: true });
});

// --- SELF: RESET PASSWORD ---
auth.patch('/me/password', async (c) => {
    const user = c.get('jwtPayload');
    const { oldPassword, newPassword } = await c.req.json();
    
    // Verify old password
    const dbUser = await c.env.DB.prepare("SELECT password_hash FROM _users WHERE id = ?").bind(user.sub).first();
    if (!dbUser || !(await verifyPassword(oldPassword, dbUser.password_hash))) {
        return c.json({ error: "Invalid original password" }, 401);
    }
    
    const newHash = await hashPassword(newPassword);
    await c.env.DB.prepare("UPDATE _users SET password_hash = ? WHERE id = ?").bind(newHash, user.sub).run();
    
    return c.json({ success: true });
});

// --- SELF: CHANGE LOGIN EMAIL ---
auth.patch('/me/email', async (c) => {
    const user = c.get('jwtPayload');
    const { newEmail } = await c.req.json();
    
    await c.env.DB.prepare("UPDATE _users SET email = ? WHERE id = ?").bind(newEmail, user.sub).run();
    return c.json({ success: true, message: "Email updated. Next login will require new email." });
});

// --- LOGIN ---
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