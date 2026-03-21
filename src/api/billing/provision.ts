// src/api/billing/provision.ts
export async function provisionNewTenant(c, session) {
  const { tenant_name, flavor, admin_email } = session.metadata;
  const tenantId = `t_${crypto.randomUUID().split('-')[0]}`;
  const tempPassword = crypto.randomUUID().split('-')[0]; // User resets this on first login

  // 1. Create the Tenant Entry
  await c.env.DB.prepare(
    "INSERT INTO tenants (id, name, flavor, stripe_id, is_active) VALUES (?, ?, ?, ?, 1)"
  ).bind(tenantId, tenant_name, flavor, session.customer).run();

  // 2. Create the Initial Admin User for that Tenant
  await c.env.DB.prepare(
    "INSERT INTO _users (id, email, password_hash, role, tenant_id) VALUES (?, ?, ?, 'Admin', ?)"
  ).bind(crypto.randomUUID(), admin_email, tempPassword, tenantId).run();

  // 3. Trigger the "Welcome Hunter"
  // Seed their new CRM with 3 local leads immediately to show value
  await c.env.DB.prepare(`
    INSERT INTO leads (id, company_name, status, tenant_id, ai_score) 
    VALUES (hex(randomblob(4)), 'Initial Lead Alpha', 'New', ?, 85)
  `).bind(tenantId).run();

  return { tenantId, tempPassword };
}