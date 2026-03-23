import { processNicheDiscovery } from '../api/hunter/hunter_engine';

export default {
  async scheduled(event: any, env: any, ctx: any) {
    // PocketBase Logic: You can run automated hunts on a schedule
    // Let's hunt for "Dentists" in "Creston, IA" every day at 8 AM.
    const niche = "Dentists";
    const location = "Creston, IA";
    const tenantId = "built-networks-001"; // Default admin tenant

    console.log(`[SCHEDULED] Launching Lead Hunter for ${niche} in ${location}...`);
    
    // We reuse the central discovery engine
    const result = await processNicheDiscovery(niche, location, env, tenantId);
    
    console.log(`[SCHEDULED] Hunt complete. Found ${result.count} high-risk leads.`);
  }
};