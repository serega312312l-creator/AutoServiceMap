-- AutoServiceMap: структурована база авто-локацій України

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name_uk TEXT NOT NULL,
  name_en TEXT NOT NULL,
  emoji TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS regions (
  id TEXT PRIMARY KEY,
  name_uk TEXT NOT NULL,
  name_en TEXT
);

CREATE TABLE IF NOT EXISTS places (
  id TEXT PRIMARY KEY,
  osm_type TEXT NOT NULL,
  osm_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id),
  subcategory TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  street TEXT,
  housenumber TEXT,
  city TEXT,
  district TEXT,
  region_id TEXT REFERENCES regions(id),
  region_name TEXT,
  postal_code TEXT,
  full_address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  opening_hours TEXT,
  brand TEXT,
  operator TEXT,
  wheelchair TEXT,
  services_json TEXT,
  tags_json TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'osm',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (osm_type, osm_id)
);

CREATE INDEX IF NOT EXISTS idx_places_category ON places(category_id);
CREATE INDEX IF NOT EXISTS idx_places_lat ON places(latitude);
CREATE INDEX IF NOT EXISTS idx_places_lon ON places(longitude);
CREATE INDEX IF NOT EXISTS idx_places_city ON places(city);
CREATE INDEX IF NOT EXISTS idx_places_region ON places(region_id);
CREATE INDEX IF NOT EXISTS idx_places_name ON places(name);
