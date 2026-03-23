// CloudBase Hook Dispatcher (PocketBase Parity)
// Add logic here to trigger on record operations

export const collectionHooks = {
  afterCreate: async (collection: string, record: any, env: any) => {
    console.log(`[HOOK] Created record in ${collection}: ${record.id}`);
    
    // Example: Trigger an AI recap if a lead is manually created
    if (collection === 'leads') {
        // notify an external system, or log to activity
        await env.DB.prepare(
            "INSERT INTO activities (id, lead_id, tenant_id, type, content) VALUES (?, ?, ?, ?, ?)"
        ).bind(crypto.randomUUID(), record.id, record.tenant_id, 'System', `New Lead ${record.company_name} identified.`).run();
    }
  },
  
  beforeUpdate: async (collection: string, delta: any, env: any) => {
     // Validate change
     return true;
  }
};
