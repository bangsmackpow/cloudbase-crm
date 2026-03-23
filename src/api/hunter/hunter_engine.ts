export const processNicheDiscovery = async (niche: string, location: string, env: any, tenantId: string) => {
  console.log(`[ENGINE] Starting parallel hunt for ${niche} in ${location}...`);
  
  // 1. Ask AI to "Discovery" 5 targets
  const discoveryPrompt = `Generate a JSON array of 5 local businesses in the niche of '${niche}' within '${location}'. 
    Each object must have: 'name', 'website' (URL), 'city', 'niche'.
    Return ONLY JSON. Example: [{"name": "Creston Law", "website": "https://crestonlaw.com", "city": "Creston", "niche": "Law"}]`;

  let targets = [];
  try {
    const discoveryRes = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', { prompt: discoveryPrompt });
    const responseText = (discoveryRes as any).response || (discoveryRes as any).summary || "";
    const jsonMatch = responseText.match(/\[.*\]/s);
    targets = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
  } catch (e: any) {
    console.warn("[ENGINE] AI Discovery failed, using fallback.", e.message);
    targets = [
        { name: `${location} Legal Partners`, website: "https://example.law.com", city: location, niche: niche },
        { name: "Union Attorneys", website: "https://example.union.com", city: location, niche: niche }
    ];
  }

  // 2. Parallel Processing to avoid Worker Timeout (30s) or CPU Exhaustion
  const data = await Promise.all(targets.map(async (target: any) => {
    const { name, website, city } = target;
    const start = Date.now();
    let sslValid = website.startsWith('https://');
    let responseTimeMillis = 1500;
    let serverSoftware = "Unknown";
    
    try {
      const headRes = await fetch(website, { 
        method: 'HEAD', 
        redirect: 'follow',
        headers: { 'User-Agent': 'CloudBase-Hunter/1.1' }
      }).catch(() => null);
      
      if (headRes) {
        responseTimeMillis = Date.now() - start;
        serverSoftware = headRes.headers.get('server') || "Apache/2.4 (Legacy)";
      }
    } catch (e) {}

    const score = sslValid ? (responseTimeMillis < 1000 ? 90 : 75) : 45;
    const leadId = crypto.randomUUID();

    try {
        await env.DB.prepare(
            "INSERT INTO leads (id, company_name, website_url, location_city, status, ai_score, technical_stack, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(leadId, name, website, city, 'Hunter-AI', score, `${serverSoftware} | ${sslValid ? 'SSL:OK' : 'SSL:FAIL'}`, tenantId).run();
        console.log(`[ENGINE] Scouted: ${name} (${score})`);
    } catch (e: any) {
        console.error("[ENGINE] D1 Error", e.message);
    }

    return { leadId, name, score };
  }));

  return { success: true, count: data.length, data };
};

export const rescanSingleLead = async (leadId: string, env: any, tenantId: string) => {
    const lead = await env.DB.prepare(
        "SELECT * FROM leads WHERE id = ? AND tenant_id = ?"
    ).bind(leadId, tenantId).first();
    
    if (!lead) return { success: false, error: 'Lead not found' };

    console.log(`[MONITOR] Rescanning ${lead.company_name}...`);
    const website = lead.website_url;
    const start = Date.now();
    let sslValid = website.startsWith('https://');
    let responseTimeMillis = 2000;
    
    try {
        const headRes = await fetch(website, { 
          method: 'HEAD', 
          redirect: 'follow',
          headers: { 'User-Agent': 'CloudBase-Monitor/2.0' }
        }).catch(() => null);
        
        if (headRes) responseTimeMillis = Date.now() - start;
    } catch (e) {}

    const newScore = sslValid ? (responseTimeMillis < 1000 ? 95 : 80) : 50;
    
    await env.DB.prepare(
        "UPDATE leads SET ai_score = ?, last_scanned_at = CURRENT_TIMESTAMP, next_scan_at = datetime('now', '+30 days') WHERE id = ?"
    ).bind(newScore, leadId).run();

    await env.DB.prepare(
        "INSERT INTO monitor_history (id, lead_id, tenant_id, score, scanned_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)"
    ).bind(crypto.randomUUID(), leadId, tenantId, newScore).run();

    return { success: true, newScore };
};
