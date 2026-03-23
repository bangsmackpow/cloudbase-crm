# 🌀 CloudBase CRM
**The Edge-Native, AI-Driven Prospecting Engine for Built Networks**

CloudBase is a high-performance, multi-tenant CRM built specifically for the Cloudflare ecosystem. It identifies technical debt in local business websites, generates AI-backed security audits, and manages the sales pipeline—all with zero manual staff intervention.

---

## 🚀 Core Philosophy: "Zero-Staff Operations"
*   **Automated Scouting:** Cron-triggered Workers scan regional niches (Legal, Healthcare, Trades) for tech-debt and vulnerabilities.
*   **AI-Led Intelligence:** Uses Cloudflare Workers AI (Llama 3.3) to generate deep-logic dossiers and node scores.
*   **Identity Fabric:** Real-time correlation between scraped infrastructure nodes and human decision-maker identities.
*   **Persistent Command:** Global mission tracking and timeline-auditing ensure no lead interaction is lost.

---

## 🛠 Technical Stack (The "Antigravity" Stack)
| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Gateway** | Cloudflare Workers (Hono) | Sub-30ms API routing, JWT Auth, and Middleware. |
| **Database** | Cloudflare D1 (SQLite) | Multi-tenant relational data, RBAC, and Audit Logs. |
| **Storage** | Cloudflare R2 | Integrated Node Vault for technical audits and evidence. |
| **Intelligence**| Workers AI | Recursive lead scoring and autonomous dossier generation. |
| **Frontend** | React + Tailwind CSS | High-density Command Center UI with Glassmorphism. |

---

## 📂 Project Manifest
*   `/src`: The core TypeScript logic (Auth, API, and Background Workers).
*   `/migrations`: D1 SQL schemas for Tenants, Users, Leads, Tasks, and Vault History.
*   `/dashboard`: High-performance React Dashboards (Pipeline, Missions, Identities).
*   `/flavors`: Industry-specific audit logic and hunter logic.

---

## 📈 Recent Operational Milestones (Phase I - VIII)
- [x] **Visual Funnel (Kanban)**: Drag-n-drop lead status movement.
- [x] **Scout Templates**: Industry-specific Hunter presets (Legal, Dental, Home Services).
- [x] **Identity Fabric**: Linking human contact nodes to infrastructure leads.
- [x] **Temporal Logs**: A full human-history timeline for every interaction.
- [x] **Node Vault**: Secure R2 document storage for technical audit PDFs.
- [x] **Global Missions**: A high-persistence board for all cross-pipeline tasks.

---

## 🔮 Next: Apex CRM Roadmap
- [x] **Apex Phase 1: Workflow Automator** (Live If-This-Then-That Engines)
- [x] **Apex Phase 2: Client-Facing Transparency Portal** (Public Dashboard for Prospects)
- [x] **Apex Phase 3: Collaboration Matrix** (@Mentions & Notification Hub)
- [x] **Apex Phase 4: Financial "One-Click" Ledger** (Stripe Checkout sessions from CRM)
- [x] **Apex Phase 5: Audit Intelligence 2.0** (Scheduled Technical Decays & Rescans)

---

## 🛠 Getting Started
1. **Install:** `npm install`
2. **Local Dev:** `npm run dev` (Runs backend and frontend simultaneously)
3. **Deploy API:** `npx wrangler deploy`
4. **Deploy UI:** `cd dashboard && npm run build && npx wrangler pages deploy dist`