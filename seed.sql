-- Seed Data for Chalkboard CRM

-- 1. Default Organization
INSERT OR IGNORE INTO organizations (id, name, subdomain) VALUES ('org_1', 'Default Org', 'default');

-- 2. Default User
INSERT OR IGNORE INTO users (id, email, password_hash, full_name) VALUES ('user_1', 'admin@chalkboard.com', 'hash_placeholder', 'Chalkboard Admin');

-- 3. Membership
INSERT OR IGNORE INTO memberships (user_id, org_id, role) VALUES ('user_1', 'org_1', 'admin');

-- 4. Default Workspace
INSERT OR IGNORE INTO workspaces (id, org_id, name) VALUES ('ws_1', 'org_1', 'Main Workspace');

-- 5. Default Board
INSERT OR IGNORE INTO boards (id, workspace_id, name) VALUES ('board_1', 'ws_1', 'Company Roadmap');

-- 6. Sample Items
INSERT OR IGNORE INTO items (id, board_id, name) VALUES ('item_1', 'board_1', 'Initial Setup');
INSERT OR IGNORE INTO items (id, board_id, name) VALUES ('item_2', 'board_1', 'Design System');
INSERT OR IGNORE INTO items (id, board_id, name) VALUES ('item_3', 'board_1', 'Multi-tenancy Flow');

-- 7. Sample Values
INSERT OR IGNORE INTO item_values (item_id, column_key, value_text) VALUES ('item_1', 'status', 'Done');
INSERT OR IGNORE INTO item_values (item_id, column_key, value_text) VALUES ('item_2', 'status', 'In Progress');
INSERT OR IGNORE INTO item_values (item_id, column_key, value_text) VALUES ('item_3', 'status', 'Pending');
