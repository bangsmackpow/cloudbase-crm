-- Enhance the Tenants table with Billing and Quota info
ALTER TABLE tenants ADD COLUMN plan_type TEXT DEFAULT 'free'; -- 'free', 'basic', 'pro', 'enterprise'
ALTER TABLE tenants ADD COLUMN subscription_status TEXT;      -- 'active', 'past_due', 'canceled'
ALTER TABLE tenants ADD COLUMN lead_quota_monthly INTEGER DEFAULT 50;
ALTER TABLE tenants ADD COLUMN current_month_usage INTEGER DEFAULT 0;
ALTER TABLE tenants ADD COLUMN last_billing_cycle DATETIME;

-- Table to track AI "Hunter" logs for billing transparency
CREATE TABLE hunter_logs (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    lead_url TEXT NOT NULL,
    tokens_used INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_hunter_tenant_logs ON hunter_logs(tenant_id);