# 🪵 Chalkboard CRM

Chalkboard is a premium, "Apple/Enterprise" inspired CRM platform built on a modern, unified Cloudflare architecture. It leverages the full power of the Cloudflare ecosystem (Pages, Functions, D1, R2) to provide a high-performance, multi-tenant experience with a "collapsed" single-asset deployment model.

---

## 🎨 Design System: Apple/Enterprise
Chalkboard features a high-end, clean UI defined by:
- **Vertical Command Rail**: A slim, persistent navigation bar for rapid switching between tools.
- **Glassmorphism**: Subtle translucency and blurred backgrounds for a premium feel.
- **Responsive Layout**: Designed to feel native on both desktop and mobile.

## 🏗️ Technical Architecture
The project follows a **single-asset architecture** where the frontend and backend are deployed as a single atomic unit.

- **Frontend**: React (Vite) at the project root.
- **Backend**: Hono API (Edge-native) at `functions/[[path]].ts`.
- **Database**: Cloudflare D1 (SQLite) with a multi-tenant schema.
- **Storage**: Cloudflare R2 for tenant assets.
- **Routing**: Cloudflare Pages Functions handle both static assets and API requests.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Wrangler (v4+)

### Installation
```bash
git clone https://github.com/bangsmackpow/cloudbase-crm.git
cd cloudbase-crm
npm install
```

### Local Development
```bash
# 1. Initialize local D1 database schema
npm run db:migrate

# 2. Seed with sample multi-tenant data
npm run db:seed

# 3. Start the unified full-stack server
npm run dev
```
The app will be available at [http://localhost:8788](http://localhost:8788).

## 📡 API Reference
- `GET /api/health` - Check health and verify domain detection.
- `GET /api/boards` - List CRM boards (automatically scoped to the current tenant).

---

## 📅 Roadmap & Future Plans
- [ ] **Multi-tenant Authentication**: Magic Link and OAuth integration (D1-backed).
- [ ] **R2 Asset Management**: "One bucket per tenant" logic for file storage.
- [ ] **Real-time Presence**: "Active Now" indicators and clickable chat integration.
- [ ] **Dynamic Columns**: Support for custom field types (Status, Date, Number, Relation).
- [ ] **CI/CD Automation**: Automated deployments via GitHub Actions to Cloudflare Pages.

---

**Engage!** Built with ❤️ using [Hono](https://hono.dev/) and [Cloudflare](https://www.cloudflare.com/).
