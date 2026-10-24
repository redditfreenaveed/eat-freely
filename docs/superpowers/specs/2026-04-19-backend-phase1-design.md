# Backend Phase 1 — Design Spec

## Goal

Replace localStorage with a real Postgres-backed REST API. Admins and restaurant owners authenticate with email + password (JWT). The customer app reads restaurants from the API. The admin app performs full CRUD via the API. No customer accounts in this phase — that is Phase 2.

## Phasing

**Phase 1 (this spec):** Database schema, public restaurant endpoints, admin CRUD with JWT auth, wire customer app and admin app to the API. Removes localStorage entirely.

**Phase 2 (next spec):** Customer accounts (email/password + Google login), favorites, dietary preference persistence, Cloudinary image uploads.

## Stack

| Concern | Choice | Notes |
|---|---|---|
| Runtime | Node.js + Express | Standard, no lock-in |
| Database | Postgres via Neon | Free tier, no pausing, portable |
| Auth | JWT (jsonwebtoken) + bcrypt | Stateless, simple |
| Deployment | Render (free tier) | Cold starts acceptable for Phase 1 |

## Folder Structure

The backend lives in `server/` at the repo root, alongside `src/` and `admin/`.

```
server/
  src/
    db/
      client.js        — Neon Postgres connection (pg Pool)
      schema.sql       — all table definitions
      seed.js          — creates tables + seeds 8 mock restaurants + default admin
    routes/
      restaurants.js   — public: GET /api/restaurants, GET /api/restaurants/:id
      admin/
        auth.js        — POST /api/admin/auth/login
        restaurants.js — admin CRUD: list, create, update, delete
        menu.js        — section + item CRUD
    middleware/
      requireAdmin.js  — verifies admin JWT, attaches admin to req
      requireOwner.js  — ensures owner can only touch their restaurant
    app.js             — Express setup, CORS, mounts all routes
    server.js          — HTTP server entry point
  package.json
  .env.example
```

## Database Schema

### `admins`
Manually created rows — no self-registration endpoint.

```sql
CREATE TABLE admins (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin', 'owner')),
  restaurant_id INTEGER,                    -- null for admins, set for owners
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### `restaurants`
```sql
CREATE TABLE restaurants (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  cuisine     TEXT,
  location    TEXT,
  rating      NUMERIC(3,1),
  price_range TEXT CHECK (price_range IN ('$', '$$', '$$$')),
  distance    TEXT,
  description TEXT,
  highlights  TEXT[],
  tags        TEXT[],                       -- dietary tags: halal, vegan, etc.
  image       TEXT,                         -- emoji icon
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `menu_sections`
```sql
CREATE TABLE menu_sections (
  id            SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  sort_order    INTEGER DEFAULT 0
);
```

### `menu_items`
```sql
CREATE TABLE menu_items (
  id          SERIAL PRIMARY KEY,
  section_id  INTEGER NOT NULL REFERENCES menu_sections(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  price       TEXT,
  tags        TEXT[],
  sort_order  INTEGER DEFAULT 0
);
```

Dietary tags are stored as `TEXT[]` Postgres arrays. Filtering uses the `&&` (overlap) operator: `WHERE tags && ARRAY['halal','vegan']`.

## API Endpoints

### Public (no auth)

| Method | Path | Description |
|---|---|---|
| GET | `/api/restaurants` | List all restaurants. Optional `?tags=halal,vegan` filter. |
| GET | `/api/restaurants/:id` | Restaurant detail with full menu (sections + items). |

The detail response shape matches the current frontend data shape exactly so no frontend changes are needed beyond pointing to the API:
```json
{
  "id": 1,
  "name": "Zam Zam Palace",
  "cuisine": "Middle Eastern",
  "location": "Downtown",
  "rating": 4.8,
  "priceRange": "$$",
  "distance": "0.3 mi",
  "description": "...",
  "highlights": ["Halal Certified"],
  "tags": ["halal", "vegetarian"],
  "image": "🕌",
  "menu": [
    {
      "section": "Starters",
      "items": [
        { "name": "Hummus & Pita", "description": "...", "price": "$8", "tags": ["halal"] }
      ]
    }
  ]
}
```

### Admin Auth

| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/auth/login` | `{ email, password }` → `{ token }` |

### Admin Protected (JWT required)

| Method | Path | Who |
|---|---|---|
| GET | `/api/admin/restaurants` | admin: all; owner: own only |
| POST | `/api/admin/restaurants` | admin only |
| PATCH | `/api/admin/restaurants/:id` | admin or owner of that restaurant |
| DELETE | `/api/admin/restaurants/:id` | admin only |
| POST | `/api/admin/restaurants/:id/menu/sections` | admin or owner |
| PATCH | `/api/admin/restaurants/:id/menu/sections/:sectionId` | admin or owner |
| DELETE | `/api/admin/restaurants/:id/menu/sections/:sectionId` | admin or owner |
| POST | `/api/admin/restaurants/:id/menu/sections/:sectionId/items` | admin or owner |
| PATCH | `/api/admin/menu/items/:itemId` | admin or owner |
| DELETE | `/api/admin/menu/items/:itemId` | admin or owner |

## Auth Model

**Login flow:**
1. Admin POSTs `{ email, password }` to `/api/admin/auth/login`
2. Server bcrypt-verifies the password against the stored hash
3. On success, returns a signed JWT: `{ adminId, role, restaurantId }`
4. Admin app stores the JWT in `localStorage`, sends `Authorization: Bearer <token>` on every protected request
5. `requireAdmin` middleware decodes and verifies the JWT on every protected route
6. `requireOwner` middleware additionally checks `req.admin.restaurantId === parseInt(params.id)`

**JWT:** Signed with `JWT_SECRET` env var. 7-day expiry. No refresh tokens in Phase 1.

**Seeding the first admin:**
`node src/db/seed.js` creates all tables, inserts the 8 mock restaurants, and creates one admin account: `admin@eatfreely.com` with password from the `SEED_ADMIN_PASSWORD` env var. Additional admins and owners are inserted directly with SQL.

## App Wiring

### Customer app (`src/services/restaurantService.js`)
- `getRestaurants()` → `fetch(VITE_API_BASE_URL + '/api/restaurants')`
- `getRestaurantById(id)` → `fetch(VITE_API_BASE_URL + '/api/restaurants/' + id)`
- localStorage fallback removed

### Admin app
- `admin/src/context/AuthContext.jsx` — login calls `POST /api/admin/auth/login`, stores JWT, logout clears it
- `admin/src/context/RestaurantContext.jsx` — all CRUD becomes `fetch()` calls with `Authorization: Bearer <token>` header; localStorage CRUD removed

## Environment Variables

**`server/.env`**
```
DATABASE_URL=        # from Neon dashboard (postgres://...)
JWT_SECRET=          # random 32-char string
PORT=3000
SEED_ADMIN_PASSWORD= # password for the seeded admin@eatfreely.com account
```

**`server/.env.example`** — same keys with empty values, committed to the repo.

**Customer app (`.env`):**
```
VITE_API_BASE_URL=http://localhost:3000   # dev
```

**Admin app (`admin/.env`):**
```
VITE_API_BASE_URL=http://localhost:3000   # dev
```

In production both point to the Render URL.

## Deployment

- **Database:** Neon — create a project, copy the connection string into `DATABASE_URL`
- **API:** Render — connect repo, set root directory to `server/`, build command `npm install`, start command `node src/server.js`, add env vars in dashboard
- **Customer app:** Vercel — connect repo, root directory `./`, set `VITE_API_BASE_URL` to Render URL
- **Admin app:** Vercel — connect repo, root directory `admin/`, set `VITE_API_BASE_URL` to Render URL

CORS in `app.js` allows requests from both Vercel URLs.
