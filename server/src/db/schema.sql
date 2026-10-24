CREATE TABLE IF NOT EXISTS restaurants (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  cuisine     TEXT,
  location    TEXT,
  rating      NUMERIC(3,1),
  price_range TEXT CHECK (price_range IN ('$', '$$', '$$$')),
  distance    TEXT,
  description TEXT,
  highlights  TEXT[],
  tags        TEXT[],
  image       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin', 'owner')),
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_admins_owner_restaurant
  ON admins (restaurant_id)
  WHERE role = 'owner';

CREATE TABLE IF NOT EXISTS menu_sections (
  id            SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  sort_order    INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menu_items (
  id          SERIAL PRIMARY KEY,
  section_id  INTEGER NOT NULL REFERENCES menu_sections(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  price       TEXT,
  tags        TEXT[],
  sort_order  INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_menu_sections_restaurant_id ON menu_sections (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_section_id ON menu_items (section_id);
