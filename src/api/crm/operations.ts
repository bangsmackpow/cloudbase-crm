import { Hono } from 'hono';
import { rescanSingleLead } from '../hunter/hunter_engine';
import { triggerWorkflow } from './workflows';

// CRM Core Operations v4.2 (Fixed Context Typing)
const crm = new Hono<{ 
  Bindings: any, 
  Variables: { jwtPayload: any } 
}>();

// --- REVENUE STATS (Phase 5: Financial Layer) ---
crm.get('/stats', async (c) => {
  const user = c.get('jwtPayload');
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
crm.post('/leads', async (c) => {
  const user = c.get('jwtPayload');
  const { company_name, website_url, status } = await c.req.json();
  const id = crypto.randomUUID();

  return c.json({ success: true, id });
});

crm.get('/leads/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload');
  const lead = await c.env.DB.prepare(
    "SELECT * FROM leads WHERE id = ? AND tenant_id = ?"
  ).bind(id, user.tenant_id).first();
  if (!lead) return c.json({ error: "Not Found" }, 404);
  return c.json(lead);
});

crm.post('/convert/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload');
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
  const user = c.get('jwtPayload');
  const { results } = await c.env.DB.prepare(
    "SELECT t.*, l.company_name FROM tasks t JOIN leads l ON t.lead_id = l.id WHERE t.tenant_id = ? AND t.completed = 0 ORDER BY t.due_at ASC"
  ).bind(user.tenant_id).all();
  return c.json(results);
});

crm.get('/tasks/:leadId', async (c) => {
  const leadId = c.req.param('leadId');
  const user = c.get('jwtPayload');
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM tasks WHERE lead_id = ? AND tenant_id = ? ORDER BY completed ASC, due_at ASC"
  ).bind(leadId, user.tenant_id).all();
  return c.json(results);
});

crm.post('/tasks/:leadId', async (c) => {
  const leadId = c.req.param('leadId');
  const user = c.get('jwtPayload');
  const { title, due_at, priority } = await c.req.json();
  const id = crypto.randomUUID();

  await c.env.DB.prepare(
    "INSERT INTO tasks (id, lead_id, tenant_id, title, due_at, priority) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(id, leadId, user.tenant_id, title, due_at, priority || 'Medium').run();

  return c.json({ success: true, id });
});

crm.patch('/tasks/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload');
  const { completed } = await c.req.json();

  await c.env.DB.prepare(
    "UPDATE tasks SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?"
  ).bind(completed ? 1 : 0, id, user.tenant_id).run();

  return c.json({ success: true });
});

crm.delete('/tasks/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload');
  await c.env.DB.prepare("DELETE FROM tasks WHERE id = ? AND tenant_id = ?").bind(id, user.tenant_id).run();
  return c.json({ success: true });
});

// --- ACTIVITIES ---
crm.get('/activities/:leadId', async (c) => {
  const leadId = c.req.param('leadId');
  const user = c.get('jwtPayload');
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM activities WHERE lead_id = ? AND tenant_id = ? ORDER BY created_at DESC"
  ).bind(leadId, user.tenant_id).all();
  return c.json(results);
});

crm.post('/activities/:leadId', async (c) => {
  const leadId = c.req.param('leadId');
  const user = c.get('jwtPayload');
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
  const user = c.get('jwtPayload');
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
    
    // 🔥 TRIGGER WORKFLOW LOGIC (Phase 9)
    await triggerWorkflow(c.env.DB, user.tenant_id, 'STATUS_CHANGED', status, id);
  }

  return c.json({ success: true });
});

// --- CONTACTS ---
crm.get('/contacts/:leadId', async (c) => {
  const leadId = c.req.param('leadId');
  const user = c.get('jwtPayload');
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM contacts WHERE lead_id = ? AND tenant_id = ? ORDER BY first_name ASC"
  ).bind(leadId, user.tenant_id).all();
  return c.json(results);
});

crm.delete('/contacts/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload');
  await c.env.DB.prepare("DELETE FROM contacts WHERE id = ? AND tenant_id = ?").bind(id, user.tenant_id).run();
  return c.json({ success: true });
});

// --- VAULT / AUDIT HISTORY (Phase 7) ---
crm.get('/vault/:leadId', async (c) => {
  const leadId = c.req.param('leadId');
  const user = c.get('jwtPayload');
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM audit_history WHERE lead_id = ? AND tenant_id = ? ORDER BY created_at DESC"
  ).bind(leadId, user.tenant_id).all();
  return c.json(results);
});

// --- MONITORING (Phase 9: Audit Intelligence 2.0) ---
crm.get('/monitoring/:leadId', async (c) => {
    const leadId = c.req.param('leadId');
    const user = c.get('jwtPayload');
    const { results } = await c.env.DB.prepare(
        "SELECT * FROM monitor_history WHERE lead_id = ? AND tenant_id = ? ORDER BY scanned_at DESC LIMIT 10"
    ).bind(leadId, user.tenant_id).all();
    return c.json(results);
});

crm.patch('/monitoring/:id', async (c) => {
    const id = c.req.param('id');
    const user = c.get('jwtPayload');
    const { enabled } = await c.req.json();
    await c.env.DB.prepare(
        "UPDATE leads SET auto_monitoring_enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?"
    ).bind(enabled ? 1 : 0, id, user.tenant_id).run();
    return c.json({ success: true });
});

crm.post('/rescan/:id', async (c) => {
    const id = c.req.param('id');
    const user = c.get('jwtPayload');
    const result = await rescanSingleLead(id, c.env, user.tenant_id);
    return c.json(result);
});

crm.post('/checkout/:id', async (c) => {
    const id = c.req.param('id');
    const user = c.get('jwtPayload');
    
    // 1. Fetch lead details
    const lead = await c.env.DB.prepare(
        "SELECT company_name, deal_value FROM leads WHERE id = ? AND tenant_id = ?"
    ).bind(id, user.tenant_id).first();
    
    if (!lead) return c.json({ error: "Node invalid" }, 404);

    // 2. Stripe Checkout Integration (Native Fetch for zero-dep edge)
    const stripeKey = c.env.STRIPE_SECRET_KEY;
    const amount = (lead.deal_value || 1500) * 100; // in cents

    const params = new URLSearchParams({
        'success_url': `http://localhost:5173/lead/${id}?payment=success`,
        'cancel_url': `http://localhost:5173/lead/${id}?payment=failed`,
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][product_data][name]': `Technical Management: ${lead.company_name}`,
        'line_items[0][price_data][unit_amount]': amount.toString(),
        'line_items[0][quantity]': '1',
        'mode': 'payment'
    });

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${stripeKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
    });

    const session = await stripeRes.json();
    return c.json({ url: (session as any).url || 'https://stripe.com/docs/testing' });
});

crm.get('/notifications', async (c) => {
    const user = c.get('jwtPayload');
    const { results } = await c.env.DB.prepare(
        "SELECT * FROM notifications WHERE user_id = ? AND tenant_id = ? AND is_read = 0 ORDER BY created_at DESC LIMIT 10"
    ).bind(user.email, user.tenant_id).all();
    return c.json(results);
});

crm.patch('/notifications/read/:id', async (c) => {
    const id = c.req.param('id');
    const user = c.get('jwtPayload');
    await c.env.DB.prepare(
        "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?"
    ).bind(id, user.email).run();
    return c.json({ success: true });
});

export default crm;
