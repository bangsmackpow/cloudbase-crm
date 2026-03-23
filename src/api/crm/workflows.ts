import { D1Database } from '@cloudflare/workers-types';

export const triggerWorkflow = async (db: any, tenantId: string, triggerType: string, triggerValue: string, leadId: string) => {
    console.log(`[WORKFLOW] Evaluating ${triggerType}:${triggerValue} for Lead:${leadId}`);
    
    // 1. Fetch matching active workflows
    const { results: wf } = await db.prepare(
        "SELECT * FROM workflows WHERE tenant_id = ? AND trigger_type = ? AND trigger_value = ? AND enabled = 1"
    ).bind(tenantId, triggerType, triggerValue).all();

    for (const workflow of wf) {
        console.log(`[WORKFLOW] Executing Action: ${workflow.action_type} for Workflow: ${workflow.name}`);
        
        switch (workflow.action_type) {
            case 'CREATE_TASK':
                const payload = JSON.parse(workflow.action_payload || '{}');
                await db.prepare(
                    "INSERT INTO tasks (id, lead_id, tenant_id, title, priority, due_at) VALUES (?, ?, ?, ?, ?, datetime('now', '+1 day'))"
                ).bind(crypto.randomUUID(), leadId, tenantId, payload.title || 'Workflow Task', payload.priority || 'Medium').run();
                break;
                
            case 'SEND_NOTIFICATION':
                // Simple mock: log to activities as 'Automation Notification'
                await db.prepare(
                    "INSERT INTO activities (id, lead_id, tenant_id, type, content) VALUES (?, ?, ?, ?, ?)"
                ).bind(crypto.randomUUID(), leadId, tenantId, 'Automation', `Workflow '${workflow.name}' triggered: Notification Sent.`).run();
                break;
                
            case 'LOG_ACTIVITY':
                const logPayload = JSON.parse(workflow.action_payload || '{}');
                await db.prepare(
                    "INSERT INTO activities (id, lead_id, tenant_id, type, content) VALUES (?, ?, ?, ?, ?)"
                ).bind(crypto.randomUUID(), leadId, tenantId, 'Automation', logPayload.message || 'Workflow executed.').run();
                break;
        }
    }
    
    return { success: true, count: wf.length };
};
