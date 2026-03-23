import { Hono } from 'hono';

const schema = new Hono<{ 
  Bindings: any,
  Variables: { jwtPayload: any }
}>();

// GET /api/schema/collections
schema.get('/collections', async (c) => {
  // 1. Query System Tables (SQLite/D1 Parity)
  const { results: tables } = await c.env.DB.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf%'"
  ).all();

  // 2. Combine with our Metadata layer
  const { results: meta } = await c.env.DB.prepare(
    "SELECT * FROM _collections"
  ).all();

  return c.json({ tables, meta });
});

// POST /api/schema/create (Basics)
schema.post('/collections', async (c) => {
  const { name, schema: schemaJson } = await c.req.json();
  
  if (!name) return c.json({ error: "Collection name required" }, 400);

  // PB-style Dynamic DDL (Warning: Use cautiously on D1)
  const query = `CREATE TABLE IF NOT EXISTS ${name} (id TEXT PRIMARY KEY, tenant_id TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`;
  
  try {
    await c.env.DB.prepare(query).run();
    
    // Register metadata
    await c.env.DB.prepare(
        "INSERT INTO _collections (id, name, schema) VALUES (?, ?, ?)"
    ).bind(crypto.randomUUID(), name, JSON.stringify(schemaJson)).run();

    return c.json({ success: true, collection: name });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export default schema;
