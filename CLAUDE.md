# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint over src/ (js, jsx)
```

No test framework is configured yet.

## Architecture

React 18 + Vite SPA. State is managed via React Context + hooks — no external state library.

**Data flow:**
1. `DietaryContext` (`src/context/DietaryContext.js`) holds the user's selected dietary profile ID as global state. It wraps the entire app in `App.jsx`.
2. Pages/components read the active profile via `useDietary()` hook.
3. `useDietaryFilter` hook (`src/hooks/useDietaryFilter.js`) is the main filtering entry point — it combines dietary profile + text search query and returns filtered restaurants via `filterRestaurants()` from `tagCompatibility.js`.

**Dietary profile logic:**
- `src/utils/dietaryProfiles.js` — defines each profile's `compatibleTags` and `excludedIngredients`. This is the source of truth for which food tags a profile allows.
- `src/utils/tagCompatibility.js` — pure functions (`isRestaurantCompatible`, `getMatchingTags`, `filterRestaurants`) that apply profile logic against restaurant data. Compatibility is tag-based: a restaurant matches if it has ≥1 tag in the profile's `compatibleTags` list.

**Restaurant data:**
- `src/services/restaurantService.js` — currently returns mock data. `getRestaurants()` and `getRestaurantById()` are the integration points to swap in a real API (Google Places or `VITE_API_BASE_URL`).

**Restaurant data shape:**
```js
{ id, name, cuisine, location, rating, tags: string[], image, priceRange, distance, highlights: string[], description }
```

**Routing** (React Router v6):
- `/` → `Home` (dietary selector + search results — currently a stub)
- `/restaurant/:id` → `RestaurantDetail` (currently a stub)
- `*` → `NotFound`

**Styling:** Global CSS only (`src/styles/global.css`). CSS Modules are planned but not yet in use.

## Environment variables

All prefixed with `VITE_` (exposed to the browser via `import.meta.env`):
- `VITE_GOOGLE_PLACES_API_KEY` — for Google Places API
- `VITE_MAPBOX_TOKEN` — optional, for map view
- `VITE_API_BASE_URL` — backend base URL (default `http://localhost:3000`)

Copy `.env.example` to `.env` to get started.

## Current state

Most UI is scaffolded but not wired up. The core filtering logic (`dietaryProfiles`, `tagCompatibility`, `useDietaryFilter`, `DietaryContext`) is complete. Page components (`Home`, `RestaurantDetail`) and several UI components (`RestaurantCard`, `SearchBar`, `DietaryProfileSelector`, `TagBadge`, `Header`) exist but need to be composed together in the pages.
