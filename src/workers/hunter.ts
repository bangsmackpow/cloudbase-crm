export default {
  async scheduled(event: any, env: any, ctx: any) {
    // List of local Iowa business niches to audit
    const targets = [
      { name: "Creston Hardware", url: "https://example-creston-hardware.com" },
      { name: "Des Moines Tech Hub", url: "https://example-dm-tech.com" }
    ];

    for (const target of targets) {
      // 1. Run AI Analysis via Llama 3.1
      const analysis = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        prompt: `Scan this business for MSP opportunities: ${target.url}. Focus on SSL and Page Speed.`
      });

      // 2. Save as a "New" lead for Built Networks
      await env.DB.prepare(
        "INSERT INTO leads (id, company_name, website_url, status, ai_score, tenant_id) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(crypto.randomUUID(), target.name, target.url, 'New', 85, 'built-networks-001').run();
    }
  }
};