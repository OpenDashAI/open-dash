-- User state: last visited timestamp, per-user preferences
CREATE TABLE IF NOT EXISTS user_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed the last_visited key so first load has a baseline
INSERT OR IGNORE INTO user_state (key, value) VALUES ('last_visited', datetime('now'));
