# Admin Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a separate Vite/React admin app in `admin/` where admins can manage all restaurants and restaurant owners can manage their own, with mock auth and localStorage persistence.

**Architecture:** Separate Vite app at `admin/` running on port 5174. Mock auth stores role (admin/owner) in React context. All restaurant data is seeded from the existing 8 mock restaurants into localStorage on first load, and all CRUD writes back to localStorage. The customer app's `restaurantService.js` is updated to read from localStorage first so admin changes appear live in the customer-facing app.

**Tech Stack:** React 18, Vite, React Router v6, localStorage, global CSS (matching customer app patterns)

---

## File Map

**New — admin app:**
- `admin/index.html` — Vite entry HTML
- `admin/package.json` — dependencies (react, react-dom, react-router-dom, vite)
- `admin/vite.config.js` — Vite config, port 5174
- `admin/src/main.jsx` — React root
- `admin/src/App.jsx` — router + context providers
- `admin/src/styles/global.css` — admin styles
- `admin/src/context/AuthContext.jsx` — mock role (admin/owner), login/logout
- `admin/src/context/RestaurantContext.jsx` — restaurant CRUD, localStorage sync, seeds from mock data
- `admin/src/pages/Login/Login.jsx` — role selector page
- `admin/src/pages/Dashboard/Dashboard.jsx` — restaurant list (admin) / redirect (owner)
- `admin/src/pages/RestaurantForm/RestaurantForm.jsx` — create + edit restaurant, includes menu management
- `admin/src/components/AdminHeader/AdminHeader.jsx` — top bar: role badge + sign out
- `admin/src/components/TagSelector/TagSelector.jsx` — dietary tag multi-select checkboxes
- `admin/src/components/MenuManager/MenuManager.jsx` — section/item CRUD panel

**Shared constant (new):**
- `src/utils/dietaryTags.js` — canonical list of dietary tags used by both apps

**Modified — customer app:**
- `src/services/restaurantService.js` — read from localStorage first, fall back to mock data

---

## Task 1: Shared dietary tags constant

**Files:**
- Create: `src/utils/dietaryTags.js`
- Modify: `src/utils/dietaryProfiles.js` (import DIETARY_TAGS for reference consistency — read-only, no logic change)

- [ ] **Create `src/utils/dietaryTags.js`:**

```js
export const DIETARY_TAGS = [
  { id: 'halal',       label: 'Halal' },
  { id: 'vegetarian',  label: 'Vegetarian' },
  { id: 'vegan',       label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'kosher',      label: 'Kosher' },
  { id: 'pescatarian', label: 'Pescatarian' },
  { id: 'sattvic',     label: 'Sattvic' },
];
```

- [ ] **Commit:**
```bash
git add src/utils/dietaryTags.js
git commit -m "feat: add shared DIETARY_TAGS constant"
```

---

## Task 2: Update customer restaurantService to read localStorage

**Files:**
- Modify: `src/services/restaurantService.js`

The customer app will read from localStorage key `eatfreely_restaurants` if it exists, otherwise fall back to `MOCK_RESTAURANTS`. This makes admin changes immediately visible in the customer app.

- [ ] **Replace `getRestaurants` and `getRestaurantById` in `src/services/restaurantService.js`:**

Add this above the existing export functions (keep `MOCK_RESTAURANTS` array unchanged):

```js
const STORAGE_KEY = 'eatfreely_restaurants';

const getAll = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : MOCK_RESTAURANTS;
  } catch {
    return MOCK_RESTAURANTS;
  }
};

export const getRestaurants = async () => getAll();

export const getRestaurantById = async (id) => {
  return getAll().find((r) => r.id === Number(id)) || null;
};
```

Remove the old `getRestaurants` and `getRestaurantById` function bodies (the two functions at the bottom of the file) and replace them with the above.

- [ ] **Commit:**
```bash
git add src/services/restaurantService.js
git commit -m "feat: customer app reads restaurants from localStorage with mock fallback"
```

---

## Task 3: Scaffold admin Vite app

**Files:**
- Create: `admin/index.html`
- Create: `admin/package.json`
- Create: `admin/vite.config.js`
- Create: `admin/src/main.jsx`

- [ ] **Create `admin/index.html`:**
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Eat Freely — Admin</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Create `admin/package.json`:**
```json
{
  "name": "eat-freely-admin",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.1.0"
  }
}
```

- [ ] **Create `admin/vite.config.js`:**
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
});
```

- [ ] **Create `admin/src/main.jsx`:**
```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Install dependencies:**
```bash
cd admin && npm install
```

- [ ] **Commit:**
```bash
git add admin/
git commit -m "feat: scaffold admin Vite app"
```

---

## Task 4: AuthContext + Login page

**Files:**
- Create: `admin/src/context/AuthContext.jsx`
- Create: `admin/src/pages/Login/Login.jsx`

- [ ] **Create `admin/src/context/AuthContext.jsx`:**
```jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(null);

  const login = (r) => setRole(r);
  const logout = () => setRole(null);

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
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

- [ ] **Create `admin/src/pages/Login/Login.jsx`:**
```jsx
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role) => {
    login(role);
    navigate('/dashboard');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🍽️</div>
        <h1 className="login-title">Eat Freely Admin</h1>
        <p className="login-subtitle">Choose how you're signing in</p>
        <div className="login-options">
          <button className="login-btn login-btn--admin" onClick={() => handleLogin('admin')}>
            <span className="login-btn__icon">🛡️</span>
            <div>
              <div className="login-btn__label">Sign in as Admin</div>
              <div className="login-btn__desc">Manage all restaurants</div>
            </div>
          </button>
          <button className="login-btn login-btn--owner" onClick={() => handleLogin('owner')}>
            <span className="login-btn__icon">🍴</span>
            <div>
              <div className="login-btn__label">Sign in as Restaurant Owner</div>
              <div className="login-btn__desc">Manage your restaurant</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Commit:**
```bash
git add admin/src/context/AuthContext.jsx admin/src/pages/Login/Login.jsx
git commit -m "feat: admin AuthContext and Login role selector"
```

---

## Task 5: RestaurantContext (localStorage CRUD)

**Files:**
- Create: `admin/src/context/RestaurantContext.jsx`

The context seeds localStorage from `MOCK_RESTAURANTS` on first load, then exposes `restaurants`, `addRestaurant`, `updateRestaurant`, `deleteRestaurant`.

- [ ] **Create `admin/src/context/RestaurantContext.jsx`:**

```jsx
import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'eatfreely_restaurants';

const MOCK_RESTAURANTS = [
  {
    id: 1, name: 'Zam Zam Palace', cuisine: 'Middle Eastern', location: 'Downtown',
    rating: 4.8, tags: ['halal', 'vegetarian'], image: '🕌', priceRange: '$$',
    distance: '0.3 mi', highlights: ['Halal Certified', 'Family Friendly'],
    description: 'Authentic Middle Eastern flavors with a fully halal kitchen.',
    menu: [
      { section: 'Starters', items: [
        { name: 'Hummus & Pita', description: 'Creamy chickpea dip with warm pita bread', price: '$8', tags: ['halal', 'vegetarian'] },
        { name: 'Fattoush Salad', description: 'Fresh greens, radish, cucumber, crispy bread', price: '$10', tags: ['halal', 'vegetarian'] },
      ]},
      { section: 'Mains', items: [
        { name: 'Chicken Shawarma Platter', description: 'Marinated chicken, rice, salad, garlic sauce', price: '$18', tags: ['halal'] },
        { name: 'Falafel Wrap', description: 'Crispy falafel, tahini, preserved vegetables, fresh herbs', price: '$14', tags: ['halal', 'vegetarian'] },
      ]},
    ],
  },
  {
    id: 2, name: 'The Green Temple', cuisine: 'Indian Vegetarian', location: 'Midtown',
    rating: 4.6, tags: ['vegetarian', 'vegan', 'sattvic', 'gluten-free'], image: '🌿',
    priceRange: '$', distance: '0.7 mi', highlights: ['100% Veg', 'No Onion/Garlic available'],
    description: 'Pure vegetarian Indian cuisine with Sattvic options.',
    menu: [
      { section: 'Starters', items: [
        { name: 'Samosa (2 pcs)', description: 'Crispy pastry filled with spiced potatoes and peas', price: '$6', tags: ['vegetarian', 'vegan'] },
        { name: 'Dhokla', description: 'Steamed fermented chickpea cake, light and tangy', price: '$7', tags: ['vegetarian', 'vegan', 'gluten-free'] },
      ]},
      { section: 'Mains', items: [
        { name: 'Dal Tadka', description: 'Yellow lentils tempered with cumin and dried chilli', price: '$11', tags: ['vegetarian', 'vegan', 'gluten-free', 'sattvic'] },
        { name: 'Palak Paneer', description: 'Cottage cheese in creamy spinach gravy', price: '$13', tags: ['vegetarian', 'gluten-free'] },
      ]},
    ],
  },
  {
    id: 3, name: 'Sakura Garden', cuisine: 'Japanese', location: 'East Side',
    rating: 4.5, tags: ['vegetarian', 'pescatarian', 'gluten-free'], image: '🌸',
    priceRange: '$$$', distance: '1.2 mi', highlights: ['Vegetarian Sushi', 'GF Soy Sauce'],
    description: 'Modern Japanese with extensive vegetarian and pescatarian menus.',
    menu: [
      { section: 'Sushi & Rolls', items: [
        { name: 'Avocado Roll (6 pcs)', description: 'Fresh avocado, cucumber, sesame', price: '$10', tags: ['vegetarian', 'vegan', 'gluten-free', 'pescatarian'] },
        { name: 'Salmon Nigiri (2 pcs)', description: 'Fresh Atlantic salmon over seasoned rice', price: '$9', tags: ['pescatarian', 'gluten-free'] },
      ]},
      { section: 'Mains', items: [
        { name: 'Vegetable Ramen', description: 'Kombu broth, mushrooms, bok choy, soft egg', price: '$16', tags: ['vegetarian', 'pescatarian'] },
        { name: 'Salmon Teriyaki', description: 'Grilled salmon, teriyaki glaze, steamed rice', price: '$22', tags: ['pescatarian', 'gluten-free'] },
      ]},
    ],
  },
  {
    id: 4, name: 'Mediterranean Bites', cuisine: 'Mediterranean', location: 'West End',
    rating: 4.7, tags: ['halal', 'vegetarian', 'vegan', 'pescatarian'], image: '🫒',
    priceRange: '$$', distance: '0.9 mi', highlights: ['Halal Meat', 'Vegan Mezze Platter'],
    description: 'Fresh Mediterranean fare, halal meats and plant-based options.',
    menu: [
      { section: 'Mezze', items: [
        { name: 'Mixed Mezze Board', description: 'Hummus, baba ganoush, tzatziki, olives, pita', price: '$16', tags: ['halal', 'vegetarian'] },
        { name: 'Grilled Halloumi', description: 'Charred halloumi, honey, thyme, lemon', price: '$11', tags: ['halal', 'vegetarian'] },
      ]},
      { section: 'Mains', items: [
        { name: 'Lamb Souvlaki', description: 'Grilled halal lamb skewers, pita, tzatziki', price: '$21', tags: ['halal'] },
        { name: 'Falafel Plate', description: 'House falafel, tabouleh, preserved lemon, tahini', price: '$15', tags: ['halal', 'vegetarian', 'vegan'] },
      ]},
    ],
  },
  {
    id: 5, name: "Klein's Deli", cuisine: 'Jewish Deli', location: 'Uptown',
    rating: 4.4, tags: ['kosher', 'vegetarian'], image: '🥯',
    priceRange: '$$', distance: '1.5 mi', highlights: ['Kosher Certified', 'Classic NYC Deli'],
    description: 'Authentic kosher deli with vegetarian options.',
    menu: [
      { section: 'Starters', items: [
        { name: 'Matzo Ball Soup', description: 'Classic chicken broth with fluffy matzo balls', price: '$9', tags: ['kosher'] },
        { name: 'Knish', description: 'Baked dough filled with potato and onion', price: '$7', tags: ['kosher', 'vegetarian'] },
      ]},
      { section: 'Sandwiches', items: [
        { name: 'Pastrami on Rye', description: 'House-cured pastrami, spicy mustard, rye bread', price: '$16', tags: ['kosher'] },
        { name: 'Veggie Reuben', description: 'Sauerkraut, Swiss, Thousand Island on rye', price: '$13', tags: ['kosher', 'vegetarian'] },
      ]},
    ],
  },
  {
    id: 6, name: 'Verde Cucina', cuisine: 'Italian Vegan', location: 'Arts District',
    rating: 4.9, tags: ['vegan', 'vegetarian', 'gluten-free'], image: '🍝',
    priceRange: '$$$', distance: '2.1 mi', highlights: ['Fully Vegan', 'GF Pasta Available'],
    description: 'Upscale Italian dining reimagined with plant-based ingredients.',
    menu: [
      { section: 'Antipasti', items: [
        { name: 'Bruschetta al Pomodoro', description: 'Grilled sourdough, heirloom tomato, basil, olive oil', price: '$10', tags: ['vegan', 'vegetarian'] },
        { name: 'Carpaccio di Barbabietola', description: 'Thin-sliced beetroot, capers, herb oil, pine nuts', price: '$12', tags: ['vegan', 'vegetarian', 'gluten-free'] },
      ]},
      { section: 'Pasta & Risotto', items: [
        { name: 'Risotto ai Funghi', description: 'Wild mushroom risotto, truffle oil, crispy sage', price: '$24', tags: ['vegan', 'vegetarian', 'gluten-free'] },
        { name: 'Pappardelle al Ragu Verde', description: 'House pasta, slow-cooked lentil ragu, gremolata', price: '$22', tags: ['vegan', 'vegetarian'] },
      ]},
    ],
  },
  {
    id: 7, name: 'Punjabi Dhaba', cuisine: 'North Indian', location: 'Little India',
    rating: 4.3, tags: ['halal', 'vegetarian'], image: '🍛',
    priceRange: '$', distance: '1.8 mi', highlights: ['Halal Certified', 'Authentic Recipes'],
    description: 'Hearty North Indian curries and breads in a lively setting.',
    menu: [
      { section: 'Starters', items: [
        { name: 'Seekh Kebab (4 pcs)', description: 'Minced lamb kebabs with mint chutney', price: '$11', tags: ['halal'] },
        { name: 'Paneer Tikka', description: 'Grilled spiced cottage cheese, peppers, onion', price: '$10', tags: ['halal', 'vegetarian'] },
      ]},
      { section: 'Mains', items: [
        { name: 'Butter Chicken', description: 'Tender chicken in rich tomato cream sauce', price: '$14', tags: ['halal'] },
        { name: 'Dal Makhani', description: 'Black lentils and kidney beans, slow-cooked overnight', price: '$11', tags: ['halal', 'vegetarian'] },
      ]},
    ],
  },
  {
    id: 8, name: 'The Harvest Table', cuisine: 'American', location: 'Suburbs',
    rating: 4.2, tags: ['vegetarian', 'vegan', 'gluten-free'], image: '🥬',
    priceRange: '$$', distance: '3.4 mi', highlights: ['Farm-to-Table', 'Allergen Menu Available'],
    description: 'Seasonal American cuisine with robust plant-based offerings.',
    menu: [
      { section: 'Starters', items: [
        { name: 'Roasted Beet Salad', description: 'Golden beets, arugula, candied walnuts, citrus dressing', price: '$11', tags: ['vegetarian', 'vegan', 'gluten-free'] },
        { name: 'Corn Chowder', description: 'Sweet corn, potato, coconut cream, chives', price: '$9', tags: ['vegetarian', 'vegan', 'gluten-free'] },
      ]},
      { section: 'Mains', items: [
        { name: 'Mushroom Wellington', description: 'Wild mushroom duxelles in golden pastry, red wine jus', price: '$22', tags: ['vegetarian', 'vegan'] },
        { name: 'Harvest Grain Bowl', description: 'Farro, roasted squash, kale, tahini, pepitas', price: '$17', tags: ['vegetarian', 'vegan', 'gluten-free'] },
      ]},
    ],
  },
];

const seed = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_RESTAURANTS));
  }
};

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return MOCK_RESTAURANTS;
  }
};

const save = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

const RestaurantContext = createContext(null);

export const RestaurantProvider = ({ children }) => {
  const [restaurants, setRestaurants] = useState(() => {
    seed();
    return load();
  });

  const persist = (updated) => {
    save(updated);
    setRestaurants(updated);
  };

  const addRestaurant = (data) => {
    const id = Date.now();
    persist([...restaurants, { ...data, id }]);
    return id;
  };

  const updateRestaurant = (id, data) => {
    persist(restaurants.map((r) => (r.id === id ? { ...r, ...data } : r)));
  };

  const deleteRestaurant = (id) => {
    persist(restaurants.filter((r) => r.id !== id));
  };

  return (
    <RestaurantContext.Provider value={{ restaurants, addRestaurant, updateRestaurant, deleteRestaurant }}>
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

- [ ] **Commit:**
```bash
git add admin/src/context/RestaurantContext.jsx
git commit -m "feat: admin RestaurantContext with localStorage CRUD and seed data"
```

---

## Task 6: AdminHeader component + global CSS

**Files:**
- Create: `admin/src/components/AdminHeader/AdminHeader.jsx`
- Create: `admin/src/styles/global.css`

- [ ] **Create `admin/src/components/AdminHeader/AdminHeader.jsx`:**
```jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminHeader() {
  const { role, logout } = useAuth();

  return (
    <header className="admin-header">
      <Link to="/dashboard" className="admin-header__brand">
        🍽️ <span>Eat Freely Admin</span>
      </Link>
      <div className="admin-header__right">
        <span className="admin-header__role">
          {role === 'admin' ? '🛡️ Admin' : '🍴 Restaurant Owner'}
        </span>
        <button className="admin-header__signout" onClick={logout}>Sign out</button>
      </div>
    </header>
  );
}
```

- [ ] **Create `admin/src/styles/global.css`** with all admin styles:
```css
*, *::before, *::after { box-sizing: border-box; }

:root {
  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-border: #e2e8f0;
  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;
  --color-text-muted: #94a3b8;
  --color-accent: #0f172a;
  --color-accent-fg: #ffffff;
  --color-danger: #ef4444;
  --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

body { margin: 0; background: var(--color-bg); color: var(--color-text-primary); font-family: var(--font); -webkit-font-smoothing: antialiased; }
a { color: inherit; text-decoration: none; }
button { font-family: inherit; cursor: pointer; }

/* ── Admin Header ── */
.admin-header { background: var(--color-accent); color: var(--color-accent-fg); display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; position: sticky; top: 0; z-index: 10; }
.admin-header__brand { font-weight: 700; font-size: 15px; display: flex; align-items: center; gap: 8px; }
.admin-header__right { display: flex; align-items: center; gap: 16px; }
.admin-header__role { font-size: 13px; color: #94a3b8; }
.admin-header__signout { background: none; border: 1px solid #334155; color: var(--color-accent-fg); border-radius: 6px; padding: 5px 12px; font-size: 12px; }
.admin-header__signout:hover { border-color: #64748b; }

/* ── Login ── */
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--color-bg); }
.login-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 40px 32px; width: 100%; max-width: 400px; text-align: center; }
.login-logo { font-size: 40px; margin-bottom: 12px; }
.login-title { font-size: 20px; font-weight: 700; margin: 0 0 6px; }
.login-subtitle { font-size: 14px; color: var(--color-text-secondary); margin: 0 0 24px; }
.login-options { display: flex; flex-direction: column; gap: 12px; }
.login-btn { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-surface); text-align: left; transition: border-color 0.15s; }
.login-btn:hover { border-color: var(--color-text-muted); }
.login-btn__icon { font-size: 24px; flex-shrink: 0; }
.login-btn__label { font-size: 14px; font-weight: 600; color: var(--color-text-primary); }
.login-btn__desc { font-size: 12px; color: var(--color-text-secondary); margin-top: 2px; }

/* ── Page layout ── */
.admin-main { padding: 24px; max-width: 900px; margin: 0 auto; }
.page-title { font-size: 20px; font-weight: 700; margin: 0 0 20px; }

/* ── Dashboard ── */
.dashboard-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.btn { padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; border: none; }
.btn--primary { background: var(--color-accent); color: var(--color-accent-fg); }
.btn--primary:hover { background: #1e293b; }
.btn--danger { background: none; border: 1px solid var(--color-border); color: var(--color-danger); font-size: 12px; padding: 5px 10px; }
.btn--danger:hover { border-color: var(--color-danger); }
.btn--ghost { background: none; border: 1px solid var(--color-border); color: var(--color-text-primary); }
.btn--ghost:hover { border-color: var(--color-text-muted); }
.btn--small { padding: 5px 10px; font-size: 12px; }

.restaurant-table { width: 100%; border-collapse: collapse; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; }
.restaurant-table th { text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text-muted); padding: 10px 14px; border-bottom: 1px solid var(--color-border); background: var(--color-bg); }
.restaurant-table td { padding: 12px 14px; font-size: 13px; border-bottom: 1px solid var(--color-border); vertical-align: middle; }
.restaurant-table tr:last-child td { border-bottom: none; }
.restaurant-table tr:hover td { background: #f8fafc; }
.table-actions { display: flex; gap: 8px; }

/* ── Form ── */
.form-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; padding: 24px; margin-bottom: 20px; }
.form-card__title { font-size: 15px; font-weight: 700; margin: 0 0 18px; padding-bottom: 12px; border-bottom: 1px solid var(--color-border); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group--full { grid-column: 1 / -1; }
.form-label { font-size: 12px; font-weight: 600; color: var(--color-text-secondary); }
.form-input, .form-select, .form-textarea { padding: 8px 10px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 13px; font-family: var(--font); background: var(--color-surface); color: var(--color-text-primary); }
.form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: var(--color-accent); }
.form-textarea { resize: vertical; min-height: 80px; }
.form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }

/* ── Tag Selector ── */
.tag-selector { display: flex; gap: 8px; flex-wrap: wrap; }
.tag-checkbox { display: flex; align-items: center; gap: 5px; padding: 5px 10px; border: 1px solid var(--color-border); border-radius: 20px; font-size: 12px; cursor: pointer; user-select: none; transition: background 0.1s, border-color 0.1s; }
.tag-checkbox input { display: none; }
.tag-checkbox--checked { background: var(--color-accent); color: var(--color-accent-fg); border-color: var(--color-accent); font-weight: 500; }

/* ── Menu Manager ── */
.menu-manager { display: flex; flex-direction: column; gap: 16px; }
.menu-section { border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; }
.menu-section__header { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--color-bg); border-bottom: 1px solid var(--color-border); }
.menu-section__name { font-size: 13px; font-weight: 700; }
.menu-section__body { padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; }
.menu-item-row { display: flex; flex-direction: column; gap: 6px; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px; background: var(--color-surface); }
.menu-item-row__fields { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; align-items: start; }
.menu-item-row__desc { width: 100%; }
.menu-add-btn { display: flex; align-items: center; gap: 6px; background: none; border: 1px dashed var(--color-border); border-radius: 6px; padding: 8px 12px; font-size: 12px; color: var(--color-text-secondary); width: 100%; justify-content: center; margin-top: 4px; }
.menu-add-btn:hover { border-color: var(--color-text-muted); color: var(--color-text-primary); }
.add-section-btn { display: flex; align-items: center; gap: 6px; background: none; border: 1px dashed var(--color-border); border-radius: 8px; padding: 10px 16px; font-size: 13px; color: var(--color-text-secondary); width: 100%; justify-content: center; }
.add-section-btn:hover { border-color: var(--color-text-muted); color: var(--color-text-primary); }

/* ── Highlights input ── */
.highlights-list { display: flex; flex-direction: column; gap: 6px; }
.highlight-row { display: flex; gap: 8px; align-items: center; }
.highlight-row input { flex: 1; }
.add-highlight-btn { background: none; border: none; color: var(--color-text-secondary); font-size: 13px; padding: 0; }
.add-highlight-btn:hover { color: var(--color-text-primary); }
```

- [ ] **Commit:**
```bash
git add admin/src/components/AdminHeader/ admin/src/styles/global.css
git commit -m "feat: admin header component and global styles"
```

---

## Task 7: TagSelector component

**Files:**
- Create: `admin/src/components/TagSelector/TagSelector.jsx`

- [ ] **Create `admin/src/components/TagSelector/TagSelector.jsx`:**
```jsx
const DIETARY_TAGS = [
  { id: 'halal', label: 'Halal' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'kosher', label: 'Kosher' },
  { id: 'pescatarian', label: 'Pescatarian' },
  { id: 'sattvic', label: 'Sattvic' },
];

export default function TagSelector({ selected = [], onChange }) {
  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter((t) => t !== id) : [...selected, id]);
  };

  return (
    <div className="tag-selector">
      {DIETARY_TAGS.map(({ id, label }) => (
        <label key={id} className={`tag-checkbox${selected.includes(id) ? ' tag-checkbox--checked' : ''}`}>
          <input type="checkbox" checked={selected.includes(id)} onChange={() => toggle(id)} />
          {label}
        </label>
      ))}
    </div>
  );
}
```

- [ ] **Commit:**
```bash
git add admin/src/components/TagSelector/TagSelector.jsx
git commit -m "feat: TagSelector dietary multi-select component"
```

---

## Task 8: MenuManager component

**Files:**
- Create: `admin/src/components/MenuManager/MenuManager.jsx`

`menu` is an array of `{ section: string, items: [{ name, description, price, tags }] }`. `onChange` receives the updated menu array.

- [ ] **Create `admin/src/components/MenuManager/MenuManager.jsx`:**
```jsx
import TagSelector from '../TagSelector/TagSelector';

export default function MenuManager({ menu = [], onChange }) {
  const updateSection = (idx, updated) => {
    onChange(menu.map((s, i) => (i === idx ? updated : s)));
  };

  const deleteSection = (idx) => onChange(menu.filter((_, i) => i !== idx));

  const addSection = () => onChange([...menu, { section: 'New Section', items: [] }]);

  const addItem = (sIdx) => {
    const section = menu[sIdx];
    updateSection(sIdx, {
      ...section,
      items: [...section.items, { name: '', description: '', price: '', tags: [] }],
    });
  };

  const updateItem = (sIdx, iIdx, field, value) => {
    const section = menu[sIdx];
    updateSection(sIdx, {
      ...section,
      items: section.items.map((item, i) =>
        i === iIdx ? { ...item, [field]: value } : item
      ),
    });
  };

  const deleteItem = (sIdx, iIdx) => {
    const section = menu[sIdx];
    updateSection(sIdx, {
      ...section,
      items: section.items.filter((_, i) => i !== iIdx),
    });
  };

  return (
    <div className="menu-manager">
      {menu.map((section, sIdx) => (
        <div key={sIdx} className="menu-section">
          <div className="menu-section__header">
            <input
              className="form-input menu-section__name"
              value={section.section}
              onChange={(e) => updateSection(sIdx, { ...section, section: e.target.value })}
            />
            <button className="btn btn--danger btn--small" onClick={() => deleteSection(sIdx)}>
              Remove section
            </button>
          </div>
          <div className="menu-section__body">
            {section.items.map((item, iIdx) => (
              <div key={iIdx} className="menu-item-row">
                <div className="menu-item-row__fields">
                  <input
                    className="form-input"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => updateItem(sIdx, iIdx, 'name', e.target.value)}
                  />
                  <input
                    className="form-input"
                    placeholder="Price (e.g. $12)"
                    value={item.price}
                    onChange={(e) => updateItem(sIdx, iIdx, 'price', e.target.value)}
                  />
                  <button className="btn btn--danger btn--small" onClick={() => deleteItem(sIdx, iIdx)}>✕</button>
                </div>
                <input
                  className="form-input menu-item-row__desc"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(sIdx, iIdx, 'description', e.target.value)}
                />
                <TagSelector
                  selected={item.tags}
                  onChange={(tags) => updateItem(sIdx, iIdx, 'tags', tags)}
                />
              </div>
            ))}
            <button className="menu-add-btn" onClick={() => addItem(sIdx)}>+ Add item</button>
          </div>
        </div>
      ))}
      <button className="add-section-btn" onClick={addSection}>+ Add section</button>
    </div>
  );
}
```

- [ ] **Commit:**
```bash
git add admin/src/components/MenuManager/MenuManager.jsx
git commit -m "feat: MenuManager component for section/item CRUD with dietary tags"
```

---

## Task 9: Dashboard page

**Files:**
- Create: `admin/src/pages/Dashboard/Dashboard.jsx`

- [ ] **Create `admin/src/pages/Dashboard/Dashboard.jsx`:**
```jsx
import { Link, useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader/AdminHeader';
import { useRestaurants } from '../../context/RestaurantContext';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { restaurants, deleteRestaurant } = useRestaurants();
  const { role } = useAuth();
  const navigate = useNavigate();

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete "${name}"?`)) deleteRestaurant(id);
  };

  return (
    <>
      <AdminHeader />
      <main className="admin-main">
        <div className="dashboard-toolbar">
          <h1 className="page-title" style={{ margin: 0 }}>Restaurants</h1>
          {role === 'admin' && (
            <Link to="/restaurant/new">
              <button className="btn btn--primary">+ Add Restaurant</button>
            </Link>
          )}
        </div>
        <table className="restaurant-table">
          <thead>
            <tr>
              <th>Restaurant</th>
              <th>Cuisine</th>
              <th>Location</th>
              <th>Rating</th>
              <th>Tags</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.image} {r.name}</strong></td>
                <td>{r.cuisine}</td>
                <td>{r.location}</td>
                <td>{r.rating}★</td>
                <td style={{ fontSize: 11, color: '#64748b' }}>{r.tags.join(', ')}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn--ghost btn--small" onClick={() => navigate(`/restaurant/${r.id}`)}>Edit</button>
                    {role === 'admin' && (
                      <button className="btn btn--danger btn--small" onClick={() => handleDelete(r.id, r.name)}>Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
}
```

- [ ] **Commit:**
```bash
git add admin/src/pages/Dashboard/Dashboard.jsx
git commit -m "feat: admin Dashboard page with restaurant table"
```

---

## Task 10: RestaurantForm page (create + edit + menu)

**Files:**
- Create: `admin/src/pages/RestaurantForm/RestaurantForm.jsx`

- [ ] **Create `admin/src/pages/RestaurantForm/RestaurantForm.jsx`:**
```jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader/AdminHeader';
import TagSelector from '../../components/TagSelector/TagSelector';
import MenuManager from '../../components/MenuManager/MenuManager';
import { useRestaurants } from '../../context/RestaurantContext';

const EMPTY = {
  name: '', cuisine: '', location: '', priceRange: '$', image: '',
  rating: '', distance: '', description: '', tags: [], highlights: [], menu: [],
};

export default function RestaurantForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { restaurants, addRestaurant, updateRestaurant } = useRestaurants();
  const isNew = id === 'new';

  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!isNew) {
      const existing = restaurants.find((r) => r.id === Number(id));
      if (existing) setForm(existing);
    }
  }, [id, restaurants, isNew]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleHighlightChange = (idx, value) => {
    const updated = [...form.highlights];
    updated[idx] = value;
    set('highlights', updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      rating: parseFloat(form.rating) || 0,
      highlights: form.highlights.filter(Boolean),
    };
    if (isNew) {
      addRestaurant(data);
    } else {
      updateRestaurant(Number(id), data);
    }
    navigate('/dashboard');
  };

  return (
    <>
      <AdminHeader />
      <main className="admin-main">
        <h1 className="page-title">{isNew ? 'Add Restaurant' : `Edit: ${form.name}`}</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-card">
            <div className="form-card__title">Restaurant Details</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" required value={form.name} onChange={(e) => set('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Cuisine</label>
                <input className="form-input" required value={form.cuisine} onChange={(e) => set('cuisine', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" required value={form.location} onChange={(e) => set('location', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Price Range</label>
                <select className="form-select" value={form.priceRange} onChange={(e) => set('priceRange', e.target.value)}>
                  <option value="$">$ — Budget</option>
                  <option value="$$">$$ — Moderate</option>
                  <option value="$$$">$$$ — Upscale</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Emoji Icon</label>
                <input className="form-input" placeholder="e.g. 🍛" value={form.image} onChange={(e) => set('image', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Rating (0–5)</label>
                <input className="form-input" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => set('rating', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Distance</label>
                <input className="form-input" placeholder="e.g. 0.5 mi" value={form.distance} onChange={(e) => set('distance', e.target.value)} />
              </div>
              <div className="form-group form-group--full">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={(e) => set('description', e.target.value)} />
              </div>
              <div className="form-group form-group--full">
                <label className="form-label">Dietary Tags</label>
                <TagSelector selected={form.tags} onChange={(tags) => set('tags', tags)} />
              </div>
              <div className="form-group form-group--full">
                <label className="form-label">Highlights</label>
                <div className="highlights-list">
                  {[...form.highlights, ''].map((h, idx) => (
                    <div key={idx} className="highlight-row">
                      <input
                        className="form-input"
                        placeholder="e.g. Halal Certified"
                        value={h}
                        onChange={(e) => {
                          const updated = [...form.highlights];
                          if (idx === form.highlights.length) updated.push(e.target.value);
                          else updated[idx] = e.target.value;
                          set('highlights', updated.filter((_, i) => i < updated.length - 1 || updated[i]));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="form-card">
            <div className="form-card__title">Menu</div>
            <MenuManager menu={form.menu} onChange={(menu) => set('menu', menu)} />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={() => navigate('/dashboard')}>Cancel</button>
            <button type="submit" className="btn btn--primary">{isNew ? 'Create Restaurant' : 'Save Changes'}</button>
          </div>
        </form>
      </main>
    </>
  );
}
```

- [ ] **Commit:**
```bash
git add admin/src/pages/RestaurantForm/RestaurantForm.jsx
git commit -m "feat: RestaurantForm page with details, dietary tags, and menu management"
```

---

## Task 11: App.jsx — wire routes + providers

**Files:**
- Create: `admin/src/App.jsx`

- [ ] **Create `admin/src/App.jsx`:**
```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RestaurantProvider } from './context/RestaurantContext';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import RestaurantForm from './pages/RestaurantForm/RestaurantForm';
import './styles/global.css';

function RequireAuth({ children }) {
  const { role } = useAuth();
  return role ? children : <Navigate to="/" replace />;
}

function OwnerRedirect() {
  const { role } = useAuth();
  if (role === 'owner') return <Navigate to="/restaurant/1" replace />;
  return <Dashboard />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<RequireAuth><OwnerRedirect /></RequireAuth>} />
      <Route path="/restaurant/:id" element={<RequireAuth><RestaurantForm /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RestaurantProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </RestaurantProvider>
    </AuthProvider>
  );
}
```

- [ ] **Commit:**
```bash
git add admin/src/App.jsx
git commit -m "feat: admin App router with auth guard and owner redirect"
```

---

## Task 12: Smoke test + final verification

- [ ] **Start admin dev server:**
```bash
cd admin && npm run dev
```
Expected: server running at http://localhost:5174

- [ ] **Test Admin flow:**
  1. Open http://localhost:5174 → Login page appears
  2. Click "Sign in as Admin" → Dashboard shows all 8 restaurants
  3. Click "Add Restaurant" → form opens, fill in details + menu items + tags → Save → appears in table
  4. Click "Edit" on a restaurant → form pre-filled → change description → Save → updated in table
  5. Click "Delete" → confirm → removed from table

- [ ] **Test Restaurant Owner flow:**
  1. Sign out → back to Login
  2. Click "Sign in as Restaurant Owner" → redirected directly to Restaurant #1 edit form
  3. Edit and save → no access to other restaurants

- [ ] **Test customer app picks up changes:**
  1. Open http://localhost:5173 → customer app
  2. Changes made in admin should appear (reads same localStorage key)

- [ ] **Commit:**
```bash
git add .
git commit -m "feat: complete admin portal with mock auth, restaurant CRUD, and menu management"
```
