import { Hono } from 'hono';

const crm = new Hono<{ Bindings: any }>();

// --- REVENUE STATS (Phase 5: Financial Layer) ---
crm.get('/stats', async (c) => {
  const user = c.get('jwtPayload') as any;
  const { results: totals } = await c.env.DB.prepare(
    "SELECT COUNT(*) as total, SUM(deal_value) as revenue FROM leads WHERE tenant_id = ? AND status = 'Won'"
  ).bind(user.tenant_id).all();
  
  const { results: pipe } = await c.env.DB.prepare(
    "SELECT SUM(deal_value) as pipelined FROM leads WHERE tenant_id = ? AND status != 'Won' AND status != 'Lost'"
  ).bind(user.tenant_id).all();

  return c.json({ 
      revenue: (totals[0] as any)?.revenue || 0,
      won_count: (totals[0] as any)?.total || 0,
      pipe_value: (pipe[0] as any)?.pipelined || 0
  });
});

// --- CONVERT TO CUSTOMER ---
crm.post('/convert/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload') as any;
  const { value, stripe_id } = await c.req.json();

  await c.env.DB.prepare(
    "UPDATE leads SET status = 'Won', deal_value = ?, stripe_customer_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?"
  ).bind(value || 1500, stripe_id || 'cus_mock', id, user.tenant_id).run();

  await c.env.DB.prepare(
      "INSERT INTO activities (id, lead_id, tenant_id, type, content) VALUES (?, ?, ?, ?, ?)"
  ).bind(crypto.randomUUID(), id, user.tenant_id, 'Financial Conversion', `Customer Won! Confirmed deal value: $${value || 1500}`).run();

  return c.json({ success: true });
});

// --- TASKS ---
crm.get('/tasks', async (c) => {
  const user = c.get('jwtPayload') as any;
  const { results } = await c.env.DB.prepare(
    "SELECT t.*, l.company_name FROM tasks t JOIN leads l ON t.lead_id = l.id WHERE t.tenant_id = ? AND t.completed = 0 ORDER BY t.due_at ASC"
  ).bind(user.tenant_id).all();
  return c.json(results);
});

crm.get('/tasks/:leadId', async (c) => {
  const leadId = c.req.param('leadId');
  const user = c.get('jwtPayload') as any;
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM tasks WHERE lead_id = ? AND tenant_id = ? ORDER BY completed ASC, due_at ASC"
  ).bind(leadId, user.tenant_id).all();
  return c.json(results);
});

crm.post('/tasks/:leadId', async (c) => {
  const leadId = c.req.param('leadId');
  const user = c.get('jwtPayload') as any;
  const { title, due_at, priority } = await c.req.json();
  const id = crypto.randomUUID();

  await c.env.DB.prepare(
    "INSERT INTO tasks (id, lead_id, tenant_id, title, due_at, priority) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(id, leadId, user.tenant_id, title, due_at, priority || 'Medium').run();

  return c.json({ success: true, id });
});

crm.patch('/tasks/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload') as any;
  const { completed } = await c.req.json();

  await c.env.DB.prepare(
    "UPDATE tasks SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?"
  ).bind(completed ? 1 : 0, id, user.tenant_id).run();

  return c.json({ success: true });
});

// --- ACTIVITIES ---
crm.get('/activities/:leadId', async (c) => {
  const leadId = c.req.param('leadId');
  const user = c.get('jwtPayload') as any;
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM activities WHERE lead_id = ? AND tenant_id = ? ORDER BY created_at DESC"
  ).bind(leadId, user.tenant_id).all();
  return c.json(results);
});

crm.post('/activities/:leadId', async (c) => {
  const leadId = c.req.param('leadId');
  const user = c.get('jwtPayload') as any;
  const { type, content } = await c.req.json();
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    "INSERT INTO activities (id, lead_id, tenant_id, type, content) VALUES (?, ?, ?, ?, ?)"
  ).bind(id, leadId, user.tenant_id, type || 'Note', content).run();
  return c.json({ success: true, id });
});

// --- LEAD STATUS ---
crm.patch('/leads/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload') as any;
  const { status, contact_id } = await c.req.json();
  
  let query = "UPDATE leads SET updated_at = CURRENT_TIMESTAMP";
  const params = [];

  if (status) {
    query += ", status = ?";
    params.push(status);
  }
  if (contact_id) {
    query += ", contact_id = ?";
    params.push(contact_id);
  }

  query += " WHERE id = ? AND tenant_id = ?";
  params.push(id, user.tenant_id);

  await c.env.DB.prepare(query).bind(...params).run();

  if (status) {
    await c.env.DB.prepare(
        "INSERT INTO activities (id, lead_id, tenant_id, type, content) VALUES (?, ?, ?, ?, ?)"
    ).bind(crypto.randomUUID(), id, user.tenant_id, 'Status Change', `Stage updated to: ${status}`).run();
  }

  return c.json({ success: true });
});

// --- CONTACTS ---
crm.get('/contacts/:leadId', async (c) => {
  const leadId = c.req.param('leadId');
  const user = c.get('jwtPayload') as any;
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM contacts WHERE lead_id = ? AND tenant_id = ? ORDER BY first_name ASC"
  ).bind(leadId, user.tenant_id).all();
  return c.json(results);
});

crm.post('/contacts/:leadId', async (c) => {
  const leadId = c.req.param('leadId');
  const user = c.get('jwtPayload') as any;
  const body = await c.req.json();
  const id = crypto.randomUUID();

  await c.env.DB.prepare(
    "INSERT INTO contacts (id, lead_id, tenant_id, first_name, last_name, title, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, leadId, user.tenant_id, body.first_name, body.last_name, body.title, body.email, body.phone).run();

  return c.json({ success: true, id });
});

export default crm;
