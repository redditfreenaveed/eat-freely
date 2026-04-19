# Backend Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Node.js/Express REST API backed by Neon Postgres, replace localStorage in both apps with real API calls, and add JWT-based admin authentication.

**Architecture:** Express app in `server/` (CommonJS, no `"type":"module"`). Public endpoints serve restaurant data to the customer app. Protected admin endpoints handle CRUD with JWT auth. Menu is normalized into `menu_sections` and `menu_items` tables. Both frontend apps are updated to fetch from `VITE_API_BASE_URL` instead of localStorage.

**Tech Stack:** Node.js, Express 4, pg (node-postgres), jsonwebtoken, bcrypt, Jest + Supertest (tests), dotenv

---

## File Map

**New — server:**
- `server/package.json` — server dependencies and Jest config
- `server/.env.example` — env var template (committed)
- `server/src/server.js` — HTTP server entry point
- `server/src/app.js` — Express app, middleware, route mounts
- `server/src/db/client.js` — pg Pool connection + `query` helper
- `server/src/db/schema.sql` — CREATE TABLE statements for all 4 tables
- `server/src/db/seed.js` — runs schema, inserts 8 restaurants + default admin
- `server/src/routes/restaurants.js` — public GET /api/restaurants and GET /api/restaurants/:id
- `server/src/routes/admin/auth.js` — POST /api/admin/auth/login
- `server/src/routes/admin/restaurants.js` — admin restaurant CRUD + mounts menu sub-router
- `server/src/routes/admin/menu.js` — section + item CRUD (mergeParams, receives `:id` from parent)
- `server/src/middleware/requireAdmin.js` — verifies JWT, attaches `req.admin`
- `server/src/middleware/requireOwner.js` — blocks owners from touching other restaurants
- `server/src/__tests__/app.test.js` — health check test
- `server/src/__tests__/restaurants.test.js` — public route tests
- `server/src/__tests__/admin.auth.test.js` — login route tests
- `server/src/__tests__/middleware.test.js` — requireAdmin + requireOwner unit tests
- `server/src/__tests__/admin.restaurants.test.js` — admin CRUD tests
- `server/src/__tests__/admin.menu.test.js` — menu CRUD tests

**Modified — customer app:**
- `src/services/restaurantService.js` — replace localStorage with fetch

**Modified — admin app:**
- `admin/src/context/AuthContext.jsx` — login calls API, stores JWT
- `admin/src/context/RestaurantContext.jsx` — all CRUD via API, localStorage removed

---

## Task 1: Server scaffold + health check

**Files:**
- Create: `server/package.json`
- Create: `server/.env.example`
- Create: `server/src/app.js`
- Create: `server/src/server.js`
- Create: `server/src/__tests__/app.test.js`

- [ ] **Create `server/package.json`:**

```json
{
  "name": "eat-freely-server",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js",
    "seed": "node src/db/seed.js",
    "test": "jest --runInBand"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.18.3",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.5"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^7.0.0"
  },
  "jest": {
    "testEnvironment": "node"
  }
}
```

- [ ] **Create `server/.env.example`:**

```
DATABASE_URL=
JWT_SECRET=
PORT=3000
SEED_ADMIN_PASSWORD=
```

- [ ] **Install dependencies:**

```bash
cd server && npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Write the failing test — `server/src/__tests__/app.test.js`:**

```js
'use strict';
const request = require('supertest');

jest.mock('../db/client', () => ({ query: jest.fn() }));

const app = require('../app');

test('GET /health returns 200 with ok:true', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ ok: true });
});
```

- [ ] **Run test to confirm it fails:**

```bash
cd server && npm test -- --testPathPattern=app.test
```

Expected: FAIL — `Cannot find module '../app'`

- [ ] **Create `server/src/app.js`:**

```js
'use strict';
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

module.exports = app;
```

- [ ] **Create `server/src/server.js`:**

```js
'use strict';
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

- [ ] **Run test to confirm it passes:**

```bash
cd server && npm test -- --testPathPattern=app.test
```

Expected: PASS — 1 test passed

- [ ] **Commit:**

```bash
git add server/
git commit -m "feat: scaffold Express server with health check"
```

---

## Task 2: Database client

**Files:**
- Create: `server/src/db/client.js`

No unit test — this is infrastructure. It is exercised by every subsequent route test via mocking.

- [ ] **Create `server/src/db/client.js`:**

```js
'use strict';
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
```

- [ ] **Commit:**

```bash
git add server/src/db/client.js
git commit -m "feat: add Postgres client with connection pool"
```

---

## Task 3: Schema + seed script

**Files:**
- Create: `server/src/db/schema.sql`
- Create: `server/src/db/seed.js`

No Jest test — verified by running the script against a real Neon database. Running it twice must be idempotent (uses `IF NOT EXISTS` + conflict guards).

- [ ] **Create `server/src/db/schema.sql`:**

```sql
CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin', 'owner')),
  restaurant_id INTEGER,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

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
```

- [ ] **Create `server/src/db/seed.js`:**

```js
'use strict';
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const RESTAURANTS = [
  {
    name: 'Zam Zam Palace', cuisine: 'Middle Eastern', location: 'Downtown',
    rating: 4.8, price_range: '$$', distance: '0.3 mi', image: '🕌',
    highlights: ['Halal Certified', 'Family Friendly'], tags: ['halal', 'vegetarian'],
    description: 'Authentic Middle Eastern flavors with a fully halal kitchen.',
    menu: [
      { section: 'Starters', items: [
        { name: 'Hummus & Pita', description: 'Creamy chickpea dip with warm pita bread', price: '$8', tags: ['halal', 'vegetarian'] },
        { name: 'Fattoush Salad', description: 'Fresh greens, radish, cucumber, crispy bread', price: '$10', tags: ['halal', 'vegetarian'] },
        { name: 'Kibbeh', description: 'Fried bulgur shells stuffed with spiced lamb', price: '$12', tags: ['halal'] },
      ]},
      { section: 'Mains', items: [
        { name: 'Chicken Shawarma Platter', description: 'Marinated chicken, rice, salad, garlic sauce', price: '$18', tags: ['halal'] },
        { name: 'Lamb Kofta', description: 'Grilled spiced lamb skewers with flatbread', price: '$22', tags: ['halal'] },
        { name: 'Falafel Wrap', description: 'Crispy falafel, tahini, preserved vegetables, fresh herbs', price: '$14', tags: ['halal', 'vegetarian'] },
        { name: 'Mujaddara', description: 'Lentils and rice topped with caramelised onions', price: '$13', tags: ['halal', 'vegetarian'] },
      ]},
      { section: 'Desserts', items: [
        { name: 'Baklava', description: 'Layered pastry with honey and pistachios', price: '$7', tags: ['halal', 'vegetarian'] },
        { name: 'Umm Ali', description: 'Warm bread pudding with cream and nuts', price: '$8', tags: ['halal', 'vegetarian'] },
      ]},
    ],
  },
  {
    name: 'The Green Temple', cuisine: 'Indian Vegetarian', location: 'Midtown',
    rating: 4.6, price_range: '$', distance: '0.7 mi', image: '🌿',
    highlights: ['100% Veg', 'No Onion/Garlic available'], tags: ['vegetarian', 'vegan', 'sattvic', 'gluten-free'],
    description: 'Pure vegetarian Indian cuisine with Sattvic options.',
    menu: [
      { section: 'Starters', items: [
        { name: 'Samosa (2 pcs)', description: 'Crispy pastry filled with spiced potatoes and peas', price: '$6', tags: ['vegetarian', 'vegan'] },
        { name: 'Dhokla', description: 'Steamed fermented chickpea cake, light and tangy', price: '$7', tags: ['vegetarian', 'vegan', 'gluten-free'] },
        { name: 'Papdi Chaat', description: 'Crispy wafers, yoghurt, tamarind, chutneys', price: '$8', tags: ['vegetarian'] },
      ]},
      { section: 'Mains', items: [
        { name: 'Dal Tadka', description: 'Yellow lentils tempered with cumin and dried chilli', price: '$11', tags: ['vegetarian', 'vegan', 'gluten-free', 'sattvic'] },
        { name: 'Palak Paneer', description: 'Cottage cheese in creamy spinach gravy', price: '$13', tags: ['vegetarian', 'gluten-free'] },
        { name: 'Aloo Gobi', description: 'Dry-spiced cauliflower and potato', price: '$11', tags: ['vegetarian', 'vegan', 'gluten-free', 'sattvic'] },
        { name: 'Chole Bhature', description: 'Spiced chickpea curry with fluffy fried bread', price: '$12', tags: ['vegetarian', 'vegan'] },
      ]},
      { section: 'Desserts', items: [
        { name: 'Gulab Jamun', description: 'Soft milk dumplings in rose-flavoured syrup', price: '$5', tags: ['vegetarian'] },
        { name: 'Kheer', description: 'Slow-cooked rice pudding with cardamom and saffron', price: '$5', tags: ['vegetarian', 'gluten-free'] },
      ]},
    ],
  },
  {
    name: 'Sakura Garden', cuisine: 'Japanese', location: 'East Side',
    rating: 4.5, price_range: '$$$', distance: '1.2 mi', image: '🌸',
    highlights: ['Vegetarian Sushi', 'GF Soy Sauce'], tags: ['vegetarian', 'pescatarian', 'gluten-free'],
    description: 'Modern Japanese with extensive vegetarian and pescatarian menus.',
    menu: [
      { section: 'Starters', items: [
        { name: 'Edamame', description: 'Steamed salted soy beans', price: '$6', tags: ['vegetarian', 'vegan', 'gluten-free', 'pescatarian'] },
        { name: 'Miso Soup', description: 'Traditional dashi broth with tofu and wakame', price: '$5', tags: ['vegetarian', 'gluten-free', 'pescatarian'] },
        { name: 'Agedashi Tofu', description: 'Lightly battered tofu in tentsuyu broth', price: '$9', tags: ['vegetarian', 'pescatarian'] },
      ]},
      { section: 'Sushi & Rolls', items: [
        { name: 'Avocado Roll (6 pcs)', description: 'Fresh avocado, cucumber, sesame', price: '$10', tags: ['vegetarian', 'vegan', 'gluten-free', 'pescatarian'] },
        { name: 'Salmon Nigiri (2 pcs)', description: 'Fresh Atlantic salmon over seasoned rice', price: '$9', tags: ['pescatarian', 'gluten-free'] },
        { name: 'Rainbow Roll (8 pcs)', description: 'Crab, tuna, salmon, avocado over California roll', price: '$18', tags: ['pescatarian'] },
        { name: 'Veggie Tempura Roll', description: 'Sweet potato, asparagus, avocado, GF soy', price: '$14', tags: ['vegetarian', 'pescatarian'] },
      ]},
      { section: 'Mains', items: [
        { name: 'Vegetable Ramen', description: 'Kombu broth, mushrooms, bok choy, soft egg', price: '$16', tags: ['vegetarian', 'pescatarian'] },
        { name: 'Salmon Teriyaki', description: 'Grilled salmon, teriyaki glaze, steamed rice', price: '$22', tags: ['pescatarian', 'gluten-free'] },
      ]},
    ],
  },
  {
    name: 'Mediterranean Bites', cuisine: 'Mediterranean', location: 'West End',
    rating: 4.7, price_range: '$$', distance: '0.9 mi', image: '🫒',
    highlights: ['Halal Meat', 'Vegan Mezze Platter'], tags: ['halal', 'vegetarian', 'vegan', 'pescatarian'],
    description: 'Fresh Mediterranean fare, halal meats and plant-based options.',
    menu: [
      { section: 'Mezze', items: [
        { name: 'Mixed Mezze Board', description: 'Hummus, baba ganoush, tzatziki, olives, pita', price: '$16', tags: ['halal', 'vegetarian'] },
        { name: 'Vegan Mezze Board', description: 'Hummus, muhammara, tabbouleh, flatbread', price: '$15', tags: ['halal', 'vegetarian', 'vegan'] },
        { name: 'Grilled Halloumi', description: 'Charred halloumi, honey, thyme, lemon', price: '$11', tags: ['halal', 'vegetarian'] },
      ]},
      { section: 'Mains', items: [
        { name: 'Lamb Souvlaki', description: 'Grilled halal lamb skewers, pita, tzatziki', price: '$21', tags: ['halal'] },
        { name: 'Grilled Sea Bass', description: 'Whole sea bass, herbs, lemon, olive oil', price: '$26', tags: ['pescatarian', 'halal', 'gluten-free'] },
        { name: 'Falafel Plate', description: 'House falafel, tabouleh, preserved lemon, tahini', price: '$15', tags: ['halal', 'vegetarian', 'vegan'] },
        { name: 'Moussaka', description: 'Baked aubergine, spiced lamb, bechamel', price: '$18', tags: ['halal'] },
      ]},
      { section: 'Desserts', items: [
        { name: 'Baklava Selection', description: 'Pistachio, walnut, and honey varieties', price: '$8', tags: ['halal', 'vegetarian'] },
        { name: 'Loukoumades', description: 'Greek honey doughnuts with cinnamon', price: '$7', tags: ['halal', 'vegetarian'] },
      ]},
    ],
  },
  {
    name: "Klein's Deli", cuisine: 'Jewish Deli', location: 'Uptown',
    rating: 4.4, price_range: '$$', distance: '1.5 mi', image: '🥯',
    highlights: ['Kosher Certified', 'Classic NYC Deli'], tags: ['kosher', 'vegetarian'],
    description: 'Authentic kosher deli with vegetarian options.',
    menu: [
      { section: 'Starters', items: [
        { name: 'Matzo Ball Soup', description: 'Classic chicken broth with fluffy matzo balls', price: '$9', tags: ['kosher'] },
        { name: 'Smoked Salmon Platter', description: 'Nova lox, cream cheese, capers, red onion, bagel', price: '$16', tags: ['kosher'] },
        { name: 'Knish', description: 'Baked dough filled with potato and onion', price: '$7', tags: ['kosher', 'vegetarian'] },
      ]},
      { section: 'Sandwiches', items: [
        { name: 'Pastrami on Rye', description: 'House-cured pastrami, spicy mustard, rye bread', price: '$16', tags: ['kosher'] },
        { name: 'Corned Beef Special', description: 'Sliced corned beef, Swiss, sauerkraut, Thousand Island', price: '$17', tags: ['kosher'] },
        { name: 'Egg Salad on Challah', description: 'House egg salad, lettuce, tomato', price: '$12', tags: ['kosher', 'vegetarian'] },
        { name: 'Veggie Reuben', description: 'Sauerkraut, Swiss, Thousand Island on rye', price: '$13', tags: ['kosher', 'vegetarian'] },
      ]},
      { section: 'Desserts', items: [
        { name: 'Black & White Cookie', description: 'Classic NYC half-and-half fondant cookie', price: '$4', tags: ['kosher', 'vegetarian'] },
        { name: 'Rugelach (4 pcs)', description: 'Flaky pastry with jam and walnut filling', price: '$6', tags: ['kosher', 'vegetarian'] },
      ]},
    ],
  },
  {
    name: 'Verde Cucina', cuisine: 'Italian Vegan', location: 'Arts District',
    rating: 4.9, price_range: '$$$', distance: '2.1 mi', image: '🍝',
    highlights: ['Fully Vegan', 'GF Pasta Available'], tags: ['vegan', 'vegetarian', 'gluten-free'],
    description: 'Upscale Italian dining reimagined with plant-based ingredients.',
    menu: [
      { section: 'Antipasti', items: [
        { name: 'Bruschetta al Pomodoro', description: 'Grilled sourdough, heirloom tomato, basil, olive oil', price: '$10', tags: ['vegan', 'vegetarian'] },
        { name: 'Burrata di Mandorle', description: 'Almond-milk burrata, roasted peppers, focaccia', price: '$14', tags: ['vegan', 'vegetarian'] },
        { name: 'Carpaccio di Barbabietola', description: 'Thin-sliced beetroot, capers, herb oil, pine nuts', price: '$12', tags: ['vegan', 'vegetarian', 'gluten-free'] },
      ]},
      { section: 'Pasta & Risotto', items: [
        { name: 'Pappardelle al Ragu Verde', description: 'House pasta, slow-cooked lentil ragu, gremolata', price: '$22', tags: ['vegan', 'vegetarian'] },
        { name: 'Risotto ai Funghi', description: 'Wild mushroom risotto, truffle oil, crispy sage', price: '$24', tags: ['vegan', 'vegetarian', 'gluten-free'] },
        { name: 'Spaghetti Aglio e Olio', description: 'Garlic, chilli, parsley, premium olive oil', price: '$18', tags: ['vegan', 'vegetarian', 'gluten-free'] },
      ]},
      { section: 'Dolci', items: [
        { name: 'Tiramisu Vegano', description: 'Cashew mascarpone, espresso-soaked ladyfingers', price: '$10', tags: ['vegan', 'vegetarian'] },
        { name: 'Panna Cotta di Cocco', description: 'Coconut panna cotta, berry coulis', price: '$9', tags: ['vegan', 'vegetarian', 'gluten-free'] },
      ]},
    ],
  },
  {
    name: 'Punjabi Dhaba', cuisine: 'North Indian', location: 'Little India',
    rating: 4.3, price_range: '$', distance: '1.8 mi', image: '🍛',
    highlights: ['Halal Certified', 'Authentic Recipes'], tags: ['halal', 'vegetarian'],
    description: 'Hearty North Indian curries and breads in a lively setting.',
    menu: [
      { section: 'Starters', items: [
        { name: 'Tandoori Chicken (half)', description: 'Yoghurt-marinated chicken from the clay oven', price: '$12', tags: ['halal'] },
        { name: 'Seekh Kebab (4 pcs)', description: 'Minced lamb kebabs with mint chutney', price: '$11', tags: ['halal'] },
        { name: 'Paneer Tikka', description: 'Grilled spiced cottage cheese, peppers, onion', price: '$10', tags: ['halal', 'vegetarian'] },
      ]},
      { section: 'Mains', items: [
        { name: 'Butter Chicken', description: 'Tender chicken in rich tomato cream sauce', price: '$14', tags: ['halal'] },
        { name: 'Lamb Rogan Josh', description: 'Slow-braised lamb, Kashmiri spices', price: '$15', tags: ['halal'] },
        { name: 'Dal Makhani', description: 'Black lentils and kidney beans, slow-cooked overnight', price: '$11', tags: ['halal', 'vegetarian'] },
        { name: 'Saag Paneer', description: 'Cottage cheese in spiced mustard greens', price: '$12', tags: ['halal', 'vegetarian'] },
      ]},
      { section: 'Breads & Rice', items: [
        { name: 'Garlic Naan', description: 'Leavened bread baked in tandoor with garlic butter', price: '$4', tags: ['halal', 'vegetarian'] },
        { name: 'Jeera Rice', description: 'Basmati rice tempered with cumin', price: '$4', tags: ['halal', 'vegetarian'] },
      ]},
    ],
  },
  {
    name: 'The Harvest Table', cuisine: 'American', location: 'Suburbs',
    rating: 4.2, price_range: '$$', distance: '3.4 mi', image: '🥬',
    highlights: ['Farm-to-Table', 'Allergen Menu Available'], tags: ['vegetarian', 'vegan', 'gluten-free'],
    description: 'Seasonal American cuisine with robust plant-based offerings.',
    menu: [
      { section: 'Starters', items: [
        { name: 'Roasted Beet Salad', description: 'Golden beets, arugula, candied walnuts, citrus dressing', price: '$11', tags: ['vegetarian', 'vegan', 'gluten-free'] },
        { name: 'Corn Chowder', description: 'Sweet corn, potato, coconut cream, chives', price: '$9', tags: ['vegetarian', 'vegan', 'gluten-free'] },
        { name: 'Devilled Eggs', description: 'Free-range eggs, smoked paprika, chive oil', price: '$8', tags: ['vegetarian', 'gluten-free'] },
      ]},
      { section: 'Mains', items: [
        { name: 'Mushroom Wellington', description: 'Wild mushroom duxelles in golden pastry, red wine jus', price: '$22', tags: ['vegetarian', 'vegan'] },
        { name: 'Black Bean Burger', description: 'House black bean patty, avocado, chipotle mayo, brioche', price: '$16', tags: ['vegetarian', 'vegan'] },
        { name: 'Harvest Grain Bowl', description: 'Farro, roasted squash, kale, tahini, pepitas', price: '$17', tags: ['vegetarian', 'vegan', 'gluten-free'] },
        { name: 'GF Mac & Cheese', description: 'Cashew cheese sauce, gluten-free pasta, breadcrumb', price: '$15', tags: ['vegetarian', 'vegan', 'gluten-free'] },
      ]},
      { section: 'Desserts', items: [
        { name: 'Seasonal Fruit Crumble', description: 'Rotating seasonal fruit, oat crumble, vanilla ice cream', price: '$9', tags: ['vegetarian', 'vegan'] },
        { name: 'Dark Chocolate Tart', description: 'Gluten-free almond crust, ganache, sea salt', price: '$10', tags: ['vegetarian', 'vegan', 'gluten-free'] },
      ]},
    ],
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);
    console.log('Tables created');

    const existing = await client.query('SELECT COUNT(*) FROM restaurants');
    if (parseInt(existing.rows[0].count) > 0) {
      console.log('Restaurants already seeded — skipping');
    } else {
      await client.query('BEGIN');
      for (const r of RESTAURANTS) {
        const { name, cuisine, location, rating, price_range, distance, image, highlights, tags, description, menu } = r;
        const rRes = await client.query(
          `INSERT INTO restaurants (name, cuisine, location, rating, price_range, distance, image, highlights, tags, description)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
          [name, cuisine, location, rating, price_range, distance, image, highlights, tags, description]
        );
        const restaurantId = rRes.rows[0].id;
        for (let si = 0; si < menu.length; si++) {
          const sec = menu[si];
          const sRes = await client.query(
            'INSERT INTO menu_sections (restaurant_id, name, sort_order) VALUES ($1,$2,$3) RETURNING id',
            [restaurantId, sec.section, si]
          );
          const sectionId = sRes.rows[0].id;
          for (let ii = 0; ii < sec.items.length; ii++) {
            const item = sec.items[ii];
            await client.query(
              'INSERT INTO menu_items (section_id, name, description, price, tags, sort_order) VALUES ($1,$2,$3,$4,$5,$6)',
              [sectionId, item.name, item.description, item.price, item.tags, ii]
            );
          }
        }
      }
      await client.query('COMMIT');
      console.log('Seeded 8 restaurants');
    }

    const existing2 = await client.query('SELECT COUNT(*) FROM admins');
    if (parseInt(existing2.rows[0].count) > 0) {
      console.log('Admin already seeded — skipping');
    } else {
      const hash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 10);
      await client.query(
        "INSERT INTO admins (email, password_hash, role) VALUES ('admin@eatfreely.com', $1, 'admin')",
        [hash]
      );
      console.log('Seeded admin: admin@eatfreely.com');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => { console.error(err); process.exit(1); });
```

- [ ] **Commit:**

```bash
git add server/src/db/
git commit -m "feat: add database schema and seed script"
```

---

## Task 4: Public restaurant routes

**Files:**
- Create: `server/src/routes/restaurants.js`
- Modify: `server/src/app.js`
- Create: `server/src/__tests__/restaurants.test.js`

- [ ] **Write the failing tests — `server/src/__tests__/restaurants.test.js`:**

```js
'use strict';
const request = require('supertest');

jest.mock('../db/client', () => ({ query: jest.fn() }));
const { query } = require('../db/client');
const app = require('../app');

const MOCK_ROW = {
  id: 1, name: 'Test Place', cuisine: 'Italian', location: 'Downtown',
  rating: '4.5', price_range: '$$', distance: '0.5 mi',
  description: 'Good food', highlights: ['Award winning'], tags: ['vegan'], image: '🍕',
};

beforeEach(() => query.mockReset());

describe('GET /api/restaurants', () => {
  it('returns 200 with camelCase priceRange', async () => {
    query.mockResolvedValueOnce({ rows: [MOCK_ROW] });
    const res = await request(app).get('/api/restaurants');
    expect(res.status).toBe(200);
    expect(res.body[0].priceRange).toBe('$$');
    expect(res.body[0]).not.toHaveProperty('price_range');
  });

  it('passes tags array to query when ?tags param given', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    await request(app).get('/api/restaurants?tags=halal,vegan');
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('&&'),
      [['halal', 'vegan']]
    );
  });
});

describe('GET /api/restaurants/:id', () => {
  it('returns 200 with empty menu array when no sections', async () => {
    query.mockResolvedValueOnce({ rows: [MOCK_ROW] });
    query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/restaurants/1');
    expect(res.status).toBe(200);
    expect(res.body.menu).toEqual([]);
    expect(res.body.priceRange).toBe('$$');
  });

  it('assembles menu sections and items correctly', async () => {
    query.mockResolvedValueOnce({ rows: [MOCK_ROW] });
    query.mockResolvedValueOnce({ rows: [
      { section_id: 10, section_name: 'Starters', s_order: 0, item_id: 1, item_name: 'Soup', description: 'Hot', price: '$5', tags: ['vegan'], i_order: 0 },
      { section_id: 10, section_name: 'Starters', s_order: 0, item_id: 2, item_name: 'Salad', description: 'Fresh', price: '$7', tags: ['vegan'], i_order: 1 },
    ]});
    const res = await request(app).get('/api/restaurants/1');
    expect(res.status).toBe(200);
    expect(res.body.menu).toHaveLength(1);
    expect(res.body.menu[0].section).toBe('Starters');
    expect(res.body.menu[0].items).toHaveLength(2);
  });

  it('returns 404 when restaurant not found', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/restaurants/999');
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Run tests to confirm they fail:**

```bash
cd server && npm test -- --testPathPattern=restaurants.test
```

Expected: FAIL — routes not mounted yet

- [ ] **Create `server/src/routes/restaurants.js`:**

```js
'use strict';
const express = require('express');
const { query } = require('../db/client');
const router = express.Router();

function toClient(row) {
  return {
    id: row.id,
    name: row.name,
    cuisine: row.cuisine,
    location: row.location,
    rating: parseFloat(row.rating),
    priceRange: row.price_range,
    distance: row.distance,
    description: row.description,
    highlights: row.highlights || [],
    tags: row.tags || [],
    image: row.image,
  };
}

router.get('/', async (req, res) => {
  try {
    let result;
    if (req.query.tags) {
      const tags = req.query.tags.split(',').map((t) => t.trim());
      result = await query('SELECT * FROM restaurants WHERE tags && $1 ORDER BY id', [tags]);
    } else {
      result = await query('SELECT * FROM restaurants ORDER BY id', []);
    }
    res.json(result.rows.map(toClient));
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const rResult = await query('SELECT * FROM restaurants WHERE id = $1', [req.params.id]);
    const row = rResult.rows[0];
    if (!row) return res.status(404).json({ error: 'Not found' });

    const menuResult = await query(
      `SELECT ms.id AS section_id, ms.name AS section_name, ms.sort_order AS s_order,
              mi.id AS item_id, mi.name AS item_name, mi.description, mi.price, mi.tags, mi.sort_order AS i_order
       FROM menu_sections ms
       LEFT JOIN menu_items mi ON mi.section_id = ms.id
       WHERE ms.restaurant_id = $1
       ORDER BY ms.sort_order, mi.sort_order`,
      [req.params.id]
    );

    const sectionsMap = new Map();
    for (const r of menuResult.rows) {
      if (!sectionsMap.has(r.section_id)) {
        sectionsMap.set(r.section_id, { section: r.section_name, items: [] });
      }
      if (r.item_id) {
        sectionsMap.get(r.section_id).items.push({
          name: r.item_name,
          description: r.description,
          price: r.price,
          tags: r.tags || [],
        });
      }
    }

    res.json({ ...toClient(row), menu: Array.from(sectionsMap.values()) });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

- [ ] **Mount the route in `server/src/app.js`:**

```js
'use strict';
const express = require('express');
const cors = require('cors');
const restaurantRoutes = require('./routes/restaurants');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/restaurants', restaurantRoutes);

module.exports = app;
```

- [ ] **Run tests to confirm they pass:**

```bash
cd server && npm test -- --testPathPattern=restaurants.test
```

Expected: PASS — 5 tests passed

- [ ] **Commit:**

```bash
git add server/src/routes/restaurants.js server/src/app.js
git commit -m "feat: add public restaurant list and detail endpoints"
```

---

## Task 5: Admin auth middleware + login route

**Files:**
- Create: `server/src/middleware/requireAdmin.js`
- Create: `server/src/middleware/requireOwner.js`
- Create: `server/src/routes/admin/auth.js`
- Modify: `server/src/app.js`
- Create: `server/src/__tests__/middleware.test.js`
- Create: `server/src/__tests__/admin.auth.test.js`

- [ ] **Write failing middleware tests — `server/src/__tests__/middleware.test.js`:**

```js
'use strict';
process.env.JWT_SECRET = 'test-secret';
const jwt = require('jsonwebtoken');
const requireAdmin = require('../middleware/requireAdmin');
const requireOwner = require('../middleware/requireOwner');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('requireAdmin', () => {
  it('returns 401 when no Authorization header', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();
    requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for invalid token', () => {
    const req = { headers: { authorization: 'Bearer bad.token.here' } };
    const res = mockRes();
    const next = jest.fn();
    requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next and sets req.admin for valid token', () => {
    const token = jwt.sign({ adminId: 1, role: 'admin', restaurantId: null }, 'test-secret');
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();
    requireAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.admin.adminId).toBe(1);
  });
});

describe('requireOwner', () => {
  it('calls next for admin role regardless of restaurant id', () => {
    const req = { admin: { role: 'admin', restaurantId: null }, params: { id: '5' } };
    const res = mockRes();
    const next = jest.fn();
    requireOwner(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('calls next for owner when restaurant id matches', () => {
    const req = { admin: { role: 'owner', restaurantId: 3 }, params: { id: '3' } };
    const res = mockRes();
    const next = jest.fn();
    requireOwner(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 403 for owner when restaurant id does not match', () => {
    const req = { admin: { role: 'owner', restaurantId: 3 }, params: { id: '7' } };
    const res = mockRes();
    const next = jest.fn();
    requireOwner(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
```

- [ ] **Write failing login tests — `server/src/__tests__/admin.auth.test.js`:**

```js
'use strict';
process.env.JWT_SECRET = 'test-secret';

jest.mock('../db/client', () => ({ query: jest.fn() }));
const { query } = require('../db/client');
const bcrypt = require('bcrypt');
const request = require('supertest');
const app = require('../app');

beforeEach(() => query.mockReset());

describe('POST /api/admin/auth/login', () => {
  it('returns 400 when body is missing', async () => {
    const res = await request(app).post('/api/admin/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('returns 401 when email not found', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: 'unknown@x.com', password: 'pass' });
    expect(res.status).toBe(401);
  });

  it('returns 401 when password is wrong', async () => {
    const hash = await bcrypt.hash('correct', 10);
    query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'a@b.com', password_hash: hash, role: 'admin', restaurant_id: null }] });
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: 'a@b.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('returns 200 with token when credentials are valid', async () => {
    const hash = await bcrypt.hash('correct', 10);
    query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'a@b.com', password_hash: hash, role: 'admin', restaurant_id: null }] });
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: 'a@b.com', password: 'correct' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.role).toBe('admin');
  });
});
```

- [ ] **Run both test files to confirm they fail:**

```bash
cd server && npm test -- --testPathPattern="middleware|admin.auth"
```

Expected: FAIL — modules not found

- [ ] **Create `server/src/middleware/requireAdmin.js`:**

```js
'use strict';
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    req.admin = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

- [ ] **Create `server/src/middleware/requireOwner.js`:**

```js
'use strict';

module.exports = (req, res, next) => {
  if (req.admin.role === 'admin') return next();
  if (req.admin.restaurantId !== parseInt(req.params.id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
```

- [ ] **Create `server/src/routes/admin/auth.js`:**

```js
'use strict';
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../../db/client');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const result = await query('SELECT * FROM admins WHERE email = $1', [email]);
    const admin = result.rows[0];
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { adminId: admin.id, role: admin.role, restaurantId: admin.restaurant_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, role: admin.role, restaurantId: admin.restaurant_id });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

- [ ] **Update `server/src/app.js` to mount admin auth route:**

```js
'use strict';
const express = require('express');
const cors = require('cors');
const restaurantRoutes = require('./routes/restaurants');
const adminAuthRoutes = require('./routes/admin/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/admin/auth', adminAuthRoutes);

module.exports = app;
```

- [ ] **Run all tests to confirm they pass:**

```bash
cd server && npm test -- --testPathPattern="middleware|admin.auth"
```

Expected: PASS — 7 tests passed

- [ ] **Commit:**

```bash
git add server/src/middleware/ server/src/routes/admin/auth.js server/src/app.js
git commit -m "feat: add admin JWT auth middleware and login route"
```

---

## Task 6: Admin restaurant CRUD routes

**Files:**
- Create: `server/src/routes/admin/restaurants.js`
- Modify: `server/src/app.js`
- Create: `server/src/__tests__/admin.restaurants.test.js`

- [ ] **Write failing tests — `server/src/__tests__/admin.restaurants.test.js`:**

```js
'use strict';
process.env.JWT_SECRET = 'test-secret';

jest.mock('../db/client', () => ({ query: jest.fn() }));
const { query } = require('../db/client');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../app');

const adminToken = jwt.sign({ adminId: 1, role: 'admin', restaurantId: null }, 'test-secret');
const ownerToken = jwt.sign({ adminId: 2, role: 'owner', restaurantId: 3 }, 'test-secret');
const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

const MOCK_ROW = {
  id: 1, name: 'Test', cuisine: 'Italian', location: 'City',
  rating: '4.5', price_range: '$$', distance: '1 mi',
  description: 'Nice', highlights: [], tags: ['vegan'], image: '🍕',
};

beforeEach(() => query.mockReset());

describe('GET /api/admin/restaurants', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/admin/restaurants');
    expect(res.status).toBe(401);
  });

  it('returns all restaurants for admin', async () => {
    query.mockResolvedValueOnce({ rows: [MOCK_ROW] });
    const res = await request(app).get('/api/admin/restaurants').set(authHeader(adminToken));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('returns only own restaurant for owner', async () => {
    query.mockResolvedValueOnce({ rows: [{ ...MOCK_ROW, id: 3 }] });
    const res = await request(app).get('/api/admin/restaurants').set(authHeader(ownerToken));
    expect(res.status).toBe(200);
    expect(query).toHaveBeenCalledWith(expect.any(String), [3]);
  });
});

describe('POST /api/admin/restaurants', () => {
  it('returns 403 for owner role', async () => {
    const res = await request(app)
      .post('/api/admin/restaurants')
      .set(authHeader(ownerToken))
      .send({ name: 'New Place', cuisine: 'Thai', location: 'Uptown' });
    expect(res.status).toBe(403);
  });

  it('creates restaurant and returns 201 for admin', async () => {
    query.mockResolvedValueOnce({ rows: [MOCK_ROW] });
    const res = await request(app)
      .post('/api/admin/restaurants')
      .set(authHeader(adminToken))
      .send({ name: 'New Place', cuisine: 'Thai', location: 'Uptown', priceRange: '$$' });
    expect(res.status).toBe(201);
    expect(res.body.priceRange).toBe('$$');
  });
});

describe('PATCH /api/admin/restaurants/:id', () => {
  it('returns 403 for owner trying to edit another restaurant', async () => {
    const res = await request(app)
      .patch('/api/admin/restaurants/99')
      .set(authHeader(ownerToken))
      .send({ name: 'Updated' });
    expect(res.status).toBe(403);
  });

  it('updates and returns 200 for owner editing their own restaurant', async () => {
    query.mockResolvedValueOnce({ rows: [{ ...MOCK_ROW, id: 3, name: 'Updated' }] });
    const res = await request(app)
      .patch('/api/admin/restaurants/3')
      .set(authHeader(ownerToken))
      .send({ name: 'Updated' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/admin/restaurants/:id', () => {
  it('returns 403 for owner', async () => {
    const res = await request(app)
      .delete('/api/admin/restaurants/3')
      .set(authHeader(ownerToken));
    expect(res.status).toBe(403);
  });

  it('deletes and returns 204 for admin', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .delete('/api/admin/restaurants/1')
      .set(authHeader(adminToken));
    expect(res.status).toBe(204);
  });
});
```

- [ ] **Run tests to confirm they fail:**

```bash
cd server && npm test -- --testPathPattern=admin.restaurants.test
```

Expected: FAIL — route not mounted

- [ ] **Create `server/src/routes/admin/restaurants.js`:**

```js
'use strict';
const express = require('express');
const { query } = require('../../db/client');
const requireAdmin = require('../../middleware/requireAdmin');
const requireOwner = require('../../middleware/requireOwner');
const menuRouter = require('./menu');

const router = express.Router();
router.use(requireAdmin);

function toClient(row) {
  return {
    id: row.id,
    name: row.name,
    cuisine: row.cuisine,
    location: row.location,
    rating: parseFloat(row.rating),
    priceRange: row.price_range,
    distance: row.distance,
    description: row.description,
    highlights: row.highlights || [],
    tags: row.tags || [],
    image: row.image,
  };
}

router.get('/', async (req, res) => {
  try {
    const result = req.admin.role === 'admin'
      ? await query('SELECT * FROM restaurants ORDER BY id', [])
      : await query('SELECT * FROM restaurants WHERE id = $1', [req.admin.restaurantId]);
    res.json(result.rows.map(toClient));
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  if (req.admin.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { name, cuisine, location, rating, priceRange, distance, description, highlights, tags, image } = req.body;
  try {
    const result = await query(
      `INSERT INTO restaurants (name, cuisine, location, rating, price_range, distance, description, highlights, tags, image)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, cuisine, location, rating || null, priceRange || null, distance || null, description || null, highlights || [], tags || [], image || null]
    );
    res.status(201).json(toClient(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', requireOwner, async (req, res) => {
  const { name, cuisine, location, rating, priceRange, distance, description, highlights, tags, image } = req.body;
  try {
    const result = await query(
      `UPDATE restaurants SET
        name        = COALESCE($1,  name),
        cuisine     = COALESCE($2,  cuisine),
        location    = COALESCE($3,  location),
        rating      = COALESCE($4,  rating),
        price_range = COALESCE($5,  price_range),
        distance    = COALESCE($6,  distance),
        description = COALESCE($7,  description),
        highlights  = COALESCE($8,  highlights),
        tags        = COALESCE($9,  tags),
        image       = COALESCE($10, image),
        updated_at  = NOW()
       WHERE id = $11 RETURNING *`,
      [name, cuisine, location, rating, priceRange, distance, description, highlights, tags, image, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(toClient(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  if (req.admin.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    await query('DELETE FROM restaurants WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.use('/:id/menu', requireOwner, menuRouter);

module.exports = router;
```

- [ ] **Update `server/src/app.js`:**

```js
'use strict';
const express = require('express');
const cors = require('cors');
const restaurantRoutes = require('./routes/restaurants');
const adminAuthRoutes = require('./routes/admin/auth');
const adminRestaurantRoutes = require('./routes/admin/restaurants');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/restaurants', adminRestaurantRoutes);

module.exports = app;
```

- [ ] **Run tests:**

```bash
cd server && npm test -- --testPathPattern=admin.restaurants.test
```

Expected: FAIL — `menuRouter` (menu.js) not found yet. Create a stub first:

```bash
mkdir -p server/src/routes/admin
```

Create `server/src/routes/admin/menu.js` with just:

```js
'use strict';
const express = require('express');
const router = express.Router({ mergeParams: true });
module.exports = router;
```

Then run again:

```bash
cd server && npm test -- --testPathPattern=admin.restaurants.test
```

Expected: PASS — 7 tests passed

- [ ] **Commit:**

```bash
git add server/src/routes/admin/restaurants.js server/src/routes/admin/menu.js server/src/app.js
git commit -m "feat: add admin restaurant CRUD endpoints"
```

---

## Task 7: Admin menu CRUD routes

**Files:**
- Modify: `server/src/routes/admin/menu.js` (replace stub with full implementation)
- Create: `server/src/__tests__/admin.menu.test.js`

- [ ] **Write failing tests — `server/src/__tests__/admin.menu.test.js`:**

```js
'use strict';
process.env.JWT_SECRET = 'test-secret';

jest.mock('../db/client', () => ({ query: jest.fn() }));
const { query } = require('../db/client');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../app');

const adminToken = jwt.sign({ adminId: 1, role: 'admin', restaurantId: null }, 'test-secret');
const ownerToken = jwt.sign({ adminId: 2, role: 'owner', restaurantId: 3 }, 'test-secret');
const auth = (token) => ({ Authorization: `Bearer ${token}` });

beforeEach(() => query.mockReset());

describe('POST /api/admin/restaurants/:id/menu/sections', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/admin/restaurants/1/menu/sections');
    expect(res.status).toBe(401);
  });

  it('returns 403 when owner tries to edit another restaurant', async () => {
    const res = await request(app)
      .post('/api/admin/restaurants/99/menu/sections')
      .set(auth(ownerToken))
      .send({ name: 'Starters' });
    expect(res.status).toBe(403);
  });

  it('creates a section and returns 201', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 10, restaurant_id: 1, name: 'Starters', sort_order: 0 }] });
    const res = await request(app)
      .post('/api/admin/restaurants/1/menu/sections')
      .set(auth(adminToken))
      .send({ name: 'Starters' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Starters');
  });
});

describe('PATCH /api/admin/restaurants/:id/menu/sections/:sectionId', () => {
  it('renames a section and returns 200', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 10, restaurant_id: 1, name: 'Appetisers', sort_order: 0 }] });
    const res = await request(app)
      .patch('/api/admin/restaurants/1/menu/sections/10')
      .set(auth(adminToken))
      .send({ name: 'Appetisers' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Appetisers');
  });
});

describe('DELETE /api/admin/restaurants/:id/menu/sections/:sectionId', () => {
  it('deletes a section and returns 204', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .delete('/api/admin/restaurants/1/menu/sections/10')
      .set(auth(adminToken));
    expect(res.status).toBe(204);
  });
});

describe('POST /api/admin/restaurants/:id/menu/sections/:sectionId/items', () => {
  it('creates an item and returns 201', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 50, section_id: 10, name: 'Soup', description: 'Hot', price: '$5', tags: ['vegan'], sort_order: 0 }] });
    const res = await request(app)
      .post('/api/admin/restaurants/1/menu/sections/10/items')
      .set(auth(adminToken))
      .send({ name: 'Soup', description: 'Hot', price: '$5', tags: ['vegan'] });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Soup');
  });
});

describe('PATCH /api/admin/restaurants/:id/menu/items/:itemId', () => {
  it('updates an item and returns 200', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 50, section_id: 10, name: 'Updated Soup', description: 'Hot', price: '$6', tags: ['vegan'], sort_order: 0 }] });
    const res = await request(app)
      .patch('/api/admin/restaurants/1/menu/items/50')
      .set(auth(adminToken))
      .send({ name: 'Updated Soup', price: '$6' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Soup');
  });
});

describe('DELETE /api/admin/restaurants/:id/menu/items/:itemId', () => {
  it('deletes an item and returns 204', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .delete('/api/admin/restaurants/1/menu/items/50')
      .set(auth(adminToken));
    expect(res.status).toBe(204);
  });
});
```

- [ ] **Run tests to confirm they fail:**

```bash
cd server && npm test -- --testPathPattern=admin.menu.test
```

Expected: FAIL — stub router has no routes

- [ ] **Replace `server/src/routes/admin/menu.js` with full implementation:**

```js
'use strict';
const express = require('express');
const { query } = require('../../db/client');

const router = express.Router({ mergeParams: true });

// Sections
router.post('/sections', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Section name required' });
  try {
    const result = await query(
      'INSERT INTO menu_sections (restaurant_id, name, sort_order) VALUES ($1, $2, 0) RETURNING *',
      [req.params.id, name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/sections/:sectionId', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await query(
      'UPDATE menu_sections SET name = COALESCE($1, name) WHERE id = $2 RETURNING *',
      [name, req.params.sectionId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/sections/:sectionId', async (req, res) => {
  try {
    await query('DELETE FROM menu_sections WHERE id = $1', [req.params.sectionId]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Items
router.post('/sections/:sectionId/items', async (req, res) => {
  const { name, description, price, tags } = req.body;
  if (!name) return res.status(400).json({ error: 'Item name required' });
  try {
    const result = await query(
      'INSERT INTO menu_items (section_id, name, description, price, tags, sort_order) VALUES ($1,$2,$3,$4,$5,0) RETURNING *',
      [req.params.sectionId, name, description || null, price || null, tags || []]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/items/:itemId', async (req, res) => {
  const { name, description, price, tags } = req.body;
  try {
    const result = await query(
      `UPDATE menu_items SET
        name        = COALESCE($1, name),
        description = COALESCE($2, description),
        price       = COALESCE($3, price),
        tags        = COALESCE($4, tags)
       WHERE id = $5 RETURNING *`,
      [name, description, price, tags, req.params.itemId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/items/:itemId', async (req, res) => {
  try {
    await query('DELETE FROM menu_items WHERE id = $1', [req.params.itemId]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

- [ ] **Run all tests to confirm everything passes:**

```bash
cd server && npm test
```

Expected: PASS — all test suites pass

- [ ] **Commit:**

```bash
git add server/src/routes/admin/menu.js
git commit -m "feat: add admin menu section and item CRUD endpoints"
```

---

## Task 8: Wire customer app

**Files:**
- Modify: `src/services/restaurantService.js`

- [ ] **Replace the entire content of `src/services/restaurantService.js`:**

```js
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const getRestaurants = async () => {
  const res = await fetch(`${API_URL}/api/restaurants`);
  if (!res.ok) throw new Error('Failed to fetch restaurants');
  return res.json();
};

export const getRestaurantById = async (id) => {
  const res = await fetch(`${API_URL}/api/restaurants/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch restaurant');
  return res.json();
};
```

- [ ] **Ensure `VITE_API_BASE_URL` is set in the customer app's `.env`:**

Open `.env` (create from `.env.example` if it doesn't exist) and confirm:

```
VITE_API_BASE_URL=http://localhost:3000
```

- [ ] **Start the server and customer app together and verify the home page loads restaurants:**

```bash
# Terminal 1
cd server && node src/server.js

# Terminal 2 (only after DATABASE_URL is set in server/.env)
npm run dev
```

Open http://localhost:5173 — the home page should show the 8 restaurants from Postgres (or fall back gracefully if the DB is not yet connected).

- [ ] **Commit:**

```bash
git add src/services/restaurantService.js
git commit -m "feat: wire customer app to REST API"
```

---

## Task 9: Wire admin app

**Files:**
- Modify: `admin/src/context/AuthContext.jsx`
- Modify: `admin/src/context/RestaurantContext.jsx`

- [ ] **Replace `admin/src/context/AuthContext.jsx`:**

```jsx
import { createContext, useContext, useState } from 'react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const TOKEN_KEY = 'eatfreely_admin_token';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return { role: null, token: null, restaurantId: null };
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { role: payload.role, token, restaurantId: payload.restaurantId };
    } catch {
      return { role: null, token: null, restaurantId: null };
    }
  });

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    setAuth({ role: data.role, token: data.token, restaurantId: data.restaurantId });
    return data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAuth({ role: null, token: null, restaurantId: null });
  };

  return (
    <AuthContext.Provider value={{ role: auth.role, token: auth.token, restaurantId: auth.restaurantId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
```

- [ ] **Replace `admin/src/context/RestaurantContext.jsx`:**

```jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const RestaurantContext = createContext(null);

export const RestaurantProvider = ({ children }) => {
  const { token } = useAuth();
  const [restaurants, setRestaurants] = useState([]);

  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const loadRestaurants = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/api/admin/restaurants`, { headers: authHeaders });
    if (res.ok) setRestaurants(await res.json());
  }, [token]);

  useEffect(() => { loadRestaurants(); }, [loadRestaurants]);

  const addRestaurant = async (data) => {
    const res = await fetch(`${API_URL}/api/admin/restaurants`, {
      method: 'POST', headers: authHeaders, body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create restaurant');
    const created = await res.json();
    setRestaurants((prev) => [...prev, created]);
    return created.id;
  };

  const updateRestaurant = async (id, data) => {
    const res = await fetch(`${API_URL}/api/admin/restaurants/${id}`, {
      method: 'PATCH', headers: authHeaders, body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update restaurant');
    const updated = await res.json();
    setRestaurants((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  const deleteRestaurant = async (id) => {
    const res = await fetch(`${API_URL}/api/admin/restaurants/${id}`, {
      method: 'DELETE', headers: authHeaders,
    });
    if (!res.ok) throw new Error('Failed to delete restaurant');
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
  };

  const addSection = async (restaurantId, name) => {
    const res = await fetch(`${API_URL}/api/admin/restaurants/${restaurantId}/menu/sections`, {
      method: 'POST', headers: authHeaders, body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to add section');
    return res.json();
  };

  const updateSection = async (restaurantId, sectionId, name) => {
    const res = await fetch(`${API_URL}/api/admin/restaurants/${restaurantId}/menu/sections/${sectionId}`, {
      method: 'PATCH', headers: authHeaders, body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to update section');
    return res.json();
  };

  const deleteSection = async (restaurantId, sectionId) => {
    const res = await fetch(`${API_URL}/api/admin/restaurants/${restaurantId}/menu/sections/${sectionId}`, {
      method: 'DELETE', headers: authHeaders,
    });
    if (!res.ok) throw new Error('Failed to delete section');
  };

  const addItem = async (restaurantId, sectionId, item) => {
    const res = await fetch(`${API_URL}/api/admin/restaurants/${restaurantId}/menu/sections/${sectionId}/items`, {
      method: 'POST', headers: authHeaders, body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to add item');
    return res.json();
  };

  const updateItem = async (restaurantId, itemId, item) => {
    const res = await fetch(`${API_URL}/api/admin/restaurants/${restaurantId}/menu/items/${itemId}`, {
      method: 'PATCH', headers: authHeaders, body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to update item');
    return res.json();
  };

  const deleteItem = async (restaurantId, itemId) => {
    const res = await fetch(`${API_URL}/api/admin/restaurants/${restaurantId}/menu/items/${itemId}`, {
      method: 'DELETE', headers: authHeaders,
    });
    if (!res.ok) throw new Error('Failed to delete item');
  };

  return (
    <RestaurantContext.Provider value={{
      restaurants, addRestaurant, updateRestaurant, deleteRestaurant,
      addSection, updateSection, deleteSection, addItem, updateItem, deleteItem,
    }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurants = () => {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error('useRestaurants must be used within RestaurantProvider');
  return ctx;
};
```

- [ ] **Update `admin/src/pages/Login/Login.jsx` to use the new async login API:**

The current login page calls `login(role)` with a role string. Now `login(email, password)` is an async function. Replace the Login page:

```jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🍽️</div>
        <h1 className="login-title">Eat Freely Admin</h1>
        <p className="login-subtitle">Sign in to continue</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@eatfreely.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p style={{ color: 'var(--color-danger)', fontSize: 13, margin: 0 }}>{error}</p>}
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Update `admin/src/App.jsx` — remove `OwnerRedirect` role check on `restaurantId` from localStorage (now comes from JWT):**

The `OwnerRedirect` component reads `role` from `useAuth()`. Since `AuthContext` now derives role from the JWT on mount, the check still works. However, owner's `restaurantId` now comes from `useAuth()` not hardcoded. Update `OwnerRedirect` in `admin/src/App.jsx`:

```jsx
function OwnerRedirect() {
  const { role, restaurantId } = useAuth();
  if (role === 'owner') return <Navigate to={`/restaurant/${restaurantId}`} replace />;
  return <Dashboard />;
}
```

- [ ] **Update `admin/src/pages/RestaurantForm/RestaurantForm.jsx` to load full restaurant data (with menu) from the public API on mount:**

Find the `useEffect` that loads restaurant data (currently reads from `restaurants` context). Replace it with a fetch to the public API:

```jsx
// At the top, add:
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Replace the existing useEffect with:
useEffect(() => {
  if (!isNew) {
    fetch(`${API_URL}/api/restaurants/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.id) setForm(data);
        else navigate('/dashboard', { replace: true });
      })
      .catch(() => navigate('/dashboard', { replace: true }));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [id, isNew]);
```

Also update `handleSubmit` to use the new context methods. The `addRestaurant` and `updateRestaurant` calls are now async — wrap in try/catch:

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  const data = {
    ...form,
    rating: parseFloat(form.rating) || 0,
    highlights: form.highlights.filter(Boolean),
  };
  try {
    if (isNew) {
      await addRestaurant(data);
    } else {
      await updateRestaurant(Number(id), data);
    }
    navigate('/dashboard');
  } catch (err) {
    alert(err.message);
  }
};
```

Note: The menu sections/items in RestaurantForm still use the local `form.menu` state (inline MenuManager). On save, the full menu array is sent as part of the restaurant update. The server's PATCH handler accepts the full menu array and the admin context calls `updateRestaurant` with it. This matches the existing form structure — no MenuManager API refactor needed in Phase 1.

- [ ] **Ensure `admin/.env` has `VITE_API_BASE_URL`:**

```
VITE_API_BASE_URL=http://localhost:3000
```

- [ ] **Commit:**

```bash
git add admin/src/context/AuthContext.jsx admin/src/context/RestaurantContext.jsx admin/src/pages/Login/Login.jsx admin/src/App.jsx admin/src/pages/RestaurantForm/RestaurantForm.jsx
git commit -m "feat: wire admin app to REST API with JWT auth"
```

---

## Task 10: Smoke test

- [ ] **Set up Neon database:**
  1. Go to https://neon.tech, create a free project named `eat-freely`
  2. Copy the connection string from the dashboard
  3. Create `server/.env`:
     ```
     DATABASE_URL=postgres://...copied from Neon...
     JWT_SECRET=replace-with-random-32-char-string
     PORT=3000
     SEED_ADMIN_PASSWORD=changeme123
     ```

- [ ] **Run the seed script:**

```bash
cd server && npm run seed
```

Expected output:
```
Tables created
Seeded 8 restaurants
Seeded admin: admin@eatfreely.com
```

- [ ] **Start the server:**

```bash
cd server && node src/server.js
```

Expected: `Server running on port 3000`

- [ ] **Verify public API:**

```bash
curl http://localhost:3000/api/restaurants | head -c 200
```

Expected: JSON array starting with `[{"id":1,"name":"Zam Zam Palace"...`

```bash
curl http://localhost:3000/api/restaurants/1 | python3 -m json.tool | grep '"section"'
```

Expected: `"section": "Starters"`, `"section": "Mains"`, `"section": "Desserts"`

- [ ] **Verify admin login:**

```bash
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@eatfreely.com","password":"changeme123"}'
```

Expected: `{"token":"eyJ...","role":"admin","restaurantId":null}`

- [ ] **Start customer app and verify restaurants load from API:**

```bash
npm run dev
```

Open http://localhost:5173 — home page shows 8 restaurants from Postgres (not localStorage).

- [ ] **Start admin app and verify real login:**

```bash
cd admin && npm run dev
```

Open http://localhost:5174 — login form appears. Enter `admin@eatfreely.com` / `changeme123`. Dashboard shows all 8 restaurants.

- [ ] **Final commit:**

```bash
git add .
git commit -m "feat: complete backend Phase 1 — Postgres API replacing localStorage"
```
