import { processNicheDiscovery, rescanSingleLead } from '../api/hunter/hunter_engine';

export default {
  async scheduled(event: any, env: any, ctx: any) {
    // 1. Discovery Pulse (Lead Generation)
    const niche = "Dentists";
    const location = "Creston, IA";
    const tenantId = "built-networks-001"; 

    console.log(`[SCHEDULED] Launching Lead Hunter...`);
    const result = await processNicheDiscovery(niche, location, env, tenantId);
    console.log(`[SCHEDULED] Discovery complete. Found ${result.count} leads.`);

    // 2. Audit Pulse (Phase 9: Audit Intelligence 2.0)
    // Find all leads that are due for a rescan today
    const { results } = await env.DB.prepare(
        "SELECT id, tenant_id FROM leads WHERE auto_monitoring_enabled = 1 AND next_scan_at <= datetime('now')"
    ).all();

    console.log(`[MONITOR] Found ${results.length} leads due for technical rescan.`);
    
    for (const lead of results) {
        await rescanSingleLead(lead.id, env, lead.tenant_id);
    }

    console.log(`[MONITOR] Audit Pulse cycle complete.`);
  }
};