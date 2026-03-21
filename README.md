# 🌀 CloudBase CRM
**The Edge-Native, AI-Driven Prospecting Engine for Built Networks**

CloudBase is a high-performance, multi-tenant CRM built specifically for the Cloudflare ecosystem. It identifies technical debt in local business websites, generates AI-backed security audits, and manages the sales pipeline—all with zero manual staff intervention.

---

## ## 🚀 Core Philosophy: "Zero-Staff"
* **Automated Hunting:** Cron-triggered Workers scan local Iowa niches (MSP, HVAC, Plumbing) for vulnerabilities.
* **AI-Led Auditing:** Uses Workers AI (Llama 3.1) to score leads based on SSL, mobile speed, and infrastructure risks.
* **Product-Led Growth:** A self-service onboarding flow that provisions new tenant environments via Stripe webhooks.

---

## ## 🛠 Technical Stack (The "Antigravity" Stack)
| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Gateway** | Cloudflare Workers (Hono) | Sub-50ms API routing and middleware. |
| **Database** | Cloudflare D1 (SQLite) | Multi-tenant relational data & RBAC. |
| **Storage** | Cloudflare R2 | Versioned Markdown audits and technical evidence. |
| **Intelligence**| Workers AI | Lead scoring and automated proposal generation. |
| **Frontend** | React + Tailwind CSS | High-performance, responsive Kanban dashboard. |

---

## ## 📂 Project Manifest
* `/src`: The core TypeScript logic (Auth, API, and Background Workers).
* `/migrations`: D1 SQL schemas for Tenants, Users, Leads, and Billing.
* `/flavors`: Industry-specific configurations (MSP, Service Trades, Non-Profit).
* `/templates`: Professional Markdown templates for technical auditing.
* `/dashboard`: The React-based user interface.

---

## ## 🔐 Security & Isolation
* **Tenant Scoping:** Every SQL query and R2 bucket path is strictly scoped via `tenant_id` extracted from JWT.
* **RBAC:** Role-Based Access Control (Admin, Manager, User) enforced at the middleware level.
* **Zero Trust:** Designed to integrate with Cloudflare Access for secure administrative oversight.

---

## ## 📈 Roadmap
- [x] Multi-tenant Core Infrastructure
- [x] AI Lead Hunter (Iowa Edition)
- [x] MSP & Service Trades Flavoring
- [ ] Automated Stripe Provisioning (In Progress)
- [ ] Direct MailChannels Integration for Automated Outreach
- [ ] Mobile PWA for Field Technicians

---

## ## 🛠 Getting Started
1. **Install:** `npm install`
2. **Local Dev:** `npm run dev`
3. **Migrate DB:** `npx wrangler d1 migrations apply cloudbase-db --local`
4. **Deploy:** `git push origin main`