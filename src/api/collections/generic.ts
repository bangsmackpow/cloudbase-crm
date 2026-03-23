import { Hono } from 'hono';
import { collectionHooks } from './hooks';

const collections = new Hono<{ Bindings: any }>();

// GET /api/collections/:name/records
collections.get('/:name/records', async (c) => {
  const name = c.req.param('name');
  const user = c.get('jwtPayload');
  
  const allowed = ['leads', 'activities', 'audit_history'];
  if (!allowed.includes(name)) return c.json({ error: "Forbidden collection" }, 403);

  const { results } = await c.env.DB.prepare(
    `SELECT * FROM ${name} WHERE tenant_id = ? ORDER BY created_at DESC`
  ).bind(user.tenant_id).all();

  return c.json({ items: results });
});

// POST /api/collections/:name/records
collections.post('/:name/records', async (c) => {
  const name = c.req.param('name');
  const user = c.get('jwtPayload');
  const data = await c.req.json();

  const allowed = ['leads', 'activities'];
  if (!allowed.includes(name)) return c.json({ error: "Forbidden collection" }, 403);

  const id = data.id || crypto.randomUUID();
  const keys = Object.keys(data).filter(k => k !== 'id' && k !== 'tenant_id');
  const values = keys.map(k => data[k]);

  const query = `INSERT INTO ${name} (id, tenant_id, ${keys.join(', ')}) VALUES (?, ?, ${keys.map(() => '?').join(', ')})`;
  
  try {
    await c.env.DB.prepare(query)
      .bind(id, user.tenant_id, ...values)
      .run();

    const record = { id, ...data, tenant_id: user.tenant_id };
    
    // PocketBase Hook Parity: Fire afterCreate
    await collectionHooks.afterCreate(name, record, c.env);

    return c.json(record);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export default collections;
