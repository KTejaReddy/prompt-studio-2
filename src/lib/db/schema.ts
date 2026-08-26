/**
 * Relational schema for Promptly.
 * Designed to scale: JSON columns hold arrays/maps that are read back whole,
 * while scalar columns used for filtering/sorting are indexed directly.
 */

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#F4572E',
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS subcategories (
  id TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  PRIMARY KEY (id, category_id)
);

CREATE TABLE IF NOT EXISTS platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#472B52',
  note TEXT NOT NULL DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  tasks TEXT NOT NULL DEFAULT '[]',
  tags TEXT NOT NULL DEFAULT '[]',
  difficulty TEXT NOT NULL DEFAULT 'intermediate',
  prompt_text TEXT NOT NULL,
  variables TEXT NOT NULL DEFAULT '[]',
  input_type TEXT NOT NULL DEFAULT 'text',
  output_type TEXT NOT NULL DEFAULT 'text',
  purpose TEXT,
  transformation TEXT,
  tone TEXT,
  best_for TEXT NOT NULL DEFAULT '[]',
  platforms TEXT NOT NULL DEFAULT '[]',
  platform_adaptations TEXT NOT NULL DEFAULT '{}',
  quality_score REAL NOT NULL DEFAULT 0.8,
  usage_count INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  author TEXT NOT NULL DEFAULT 'Promptly Editorial',
  status TEXT NOT NULL DEFAULT 'published',
  source TEXT NOT NULL DEFAULT 'seed',
  is_featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  search_text TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts(status);
CREATE INDEX IF NOT EXISTS idx_prompts_featured ON prompts(is_featured);
CREATE INDEX IF NOT EXISTS idx_prompts_usage ON prompts(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_rating ON prompts(rating DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_created ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_quality ON prompts(quality_score DESC) WHERE status='published';
CREATE INDEX IF NOT EXISTS idx_prompts_pub_usage ON prompts(usage_count DESC) WHERE status='published';
CREATE INDEX IF NOT EXISTS idx_prompts_pub_rating ON prompts(rating DESC) WHERE status='published';
CREATE INDEX IF NOT EXISTS idx_prompts_pub_created ON prompts(created_at DESC) WHERE status='published';

-- Full-text retrieval over prompts. Kept in sync by triggers so runtime
-- inserts/updates stay searchable; bulk seeding writes both directly.
CREATE VIRTUAL TABLE IF NOT EXISTS prompts_fts USING fts5(id UNINDEXED, text);
CREATE TRIGGER IF NOT EXISTS prompts_fts_insert AFTER INSERT ON prompts BEGIN
  INSERT INTO prompts_fts (id, text) VALUES (new.id, new.search_text);
END;
CREATE TRIGGER IF NOT EXISTS prompts_fts_delete AFTER DELETE ON prompts BEGIN
  DELETE FROM prompts_fts WHERE id = old.id;
END;
CREATE TRIGGER IF NOT EXISTS prompts_fts_update AFTER UPDATE OF search_text ON prompts BEGIN
  UPDATE prompts_fts SET text = new.search_text WHERE id = new.id;
END;

CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  steps TEXT NOT NULL DEFAULT '[]',
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  author TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS commands (
  cmd TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  intent_patch TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  prompt_id TEXT,
  outcome TEXT,
  meta TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type, created_at DESC);
`;
