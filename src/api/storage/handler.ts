import { Hono } from 'hono';

const storage = new Hono<{ Bindings: any }>();

// POST /api/storage/upload (PocketBase Parity)
storage.post('/upload', async (c) => {
  const user = c.get('jwtPayload');
  const body = await c.req.parseBody();
  const file = body['file'] as File;

  if (!file) return c.json({ error: "No file provided" }, 400);

  const key = `tenants/${user.tenant_id}/${crypto.randomUUID()}-${file.name}`;
  
  // 1. Upload to R2 (Standard S3-compatible cloud storage)
  await c.env.BUCKET.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { 
        tenant_id: user.tenant_id,
        original_name: file.name
    }
  });

  // 2. Register in D1 (Metadata tracking parity)
  await c.env.DB.prepare(
    "INSERT INTO audit_history (id, lead_id, tenant_id, r2_key, created_by) VALUES (?, ?, ?, ?, ?)"
  ).bind(crypto.randomUUID(), 'unlinked', user.tenant_id, key, user.email).run();

  return c.json({ 
    success: true, 
    key, 
    url: `/api/storage/view/${key}` 
  });
});

// GET /api/storage/view/:key (Integrated Access Control)
storage.get('/view/:key', async (c) => {
  const key = c.req.param('key');
  const user = c.get('jwtPayload');

  // Verify tenant ownership via key prefix
  if (!key.startsWith(`tenants/${user.tenant_id}`)) {
      return c.json({ error: "Access Denied" }, 403);
  }

  const object = await c.env.BUCKET.get(key);
  if (!object) return c.json({ error: "File not found" }, 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);

  return new Response(object.body, { headers });
});

export default storage;
