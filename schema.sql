-- Chalkboard CRM Master Schema
-- Multi-tenant Architecture

-- 1. Organizations (Tenants)
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE,
    logo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users (Across Orgs)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Org Memberships (Roles)
CREATE TABLE IF NOT EXISTS memberships (
    user_id TEXT REFERENCES users(id),
    org_id TEXT REFERENCES organizations(id),
    role TEXT CHECK(role IN ('admin', 'member')) DEFAULT 'member',
    PRIMARY KEY (user_id, org_id)
);

-- 4. Workspaces (Groups for Boards)
CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Boards
CREATE TABLE IF NOT EXISTS boards (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id),
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Items (Rows on the board)
CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL REFERENCES boards(id),
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Item Values (Cells)
-- Starting with fixed columns: Status, Date, Text, Person
CREATE TABLE IF NOT EXISTS item_values (
    item_id TEXT REFERENCES items(id),
    column_key TEXT NOT NULL, -- 'status', 'date', 'text', 'person'
    value_text TEXT,
    value_json TEXT, -- For complex objects like people lists or date ranges
    PRIMARY KEY (item_id, column_key)
);
