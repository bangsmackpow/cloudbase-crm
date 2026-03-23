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
                const notifyPayload = JSON.parse(workflow.action_payload || '{}');
                // 1. Create a true notification for the user to see in their bell icon
                await db.prepare(
                    "INSERT INTO notifications (id, tenant_id, user_id, sender_id, type, message, link) VALUES (?, ?, ?, ?, ?, ?, ?)"
                ).bind(
                    crypto.randomUUID(), 
                    tenantId, 
                    notifyPayload.recipient || 'admin@cloudbase-crm.com', // fallback to tenant admin
                    'SYSTEM',
                    'WORKFLOW',
                    notifyPayload.message || `Workflow '${workflow.name}' triggered.`,
                    `/lead/${leadId}`
                ).run();

                // 2. Also log to activities for timeline
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
