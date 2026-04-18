# Eat Freely — UI Wiring Design

**Date:** 2026-04-18  
**Phase:** MVP — single-profile UI, wired up and functional

---

## Goal

Wire up the existing scaffold into a working app. The filtering logic, dietary profiles, and mock data are complete. This phase delivers a functional UI: profile selection, search, restaurant list, and a detail drawer.

Group support (multiple simultaneous profiles) is explicitly out of scope for this phase.

---

## Visual Direction

- **Style:** Minimal & Neutral — white backgrounds, slate text, `#0f172a` (near-black) as the primary accent
- **Tone:** Utility-first, information-dense, not decorative
- **Typography:** System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`)
- **Border radius:** 8–12px on cards, 20px on chips, 4–6px on badges
- **CSS approach:** Global CSS in `src/styles/global.css` (CSS Modules deferred)

---

## Architecture

```
Home.jsx
├── useDietaryFilter(restaurants)   ← existing hook, owns all filter state
├── Header                          ← top bar with app name + SearchBar
├── DietaryProfileSelector          ← horizontal scrollable dietary profile chips
├── .map(RestaurantCard)            ← filtered results rendered inline
└── DetailDrawer                    ← slide-up sheet controlled by selectedRestaurant state
```

State lives entirely in `Home.jsx` via `useDietaryFilter`. No changes to `DietaryContext` in this phase — it stays wired up but unused until the group feature is built.

Data flows one way:
1. User selects a profile → `toggleProfile(id)` → filtered list recomputes
2. User types in search → `setSearchQuery(q)` → filtered list recomputes
3. User taps a card → `setSelectedRestaurant(restaurant)` → drawer opens

---

## Components

### Header
**File:** `src/components/Header/Header.jsx`  
**Props:** `{ searchQuery, onSearchChange }`  
Dark (`#0f172a`) top bar. App name left, `SearchBar` inline right.

### SearchBar
**File:** `src/components/SearchBar/SearchBar.jsx`  
**Props:** `{ value, onChange }`  
Controlled input. Passes value up via `onChange`. No internal state.

### ProfileStrip
Rendered directly inside `DietaryProfileSelector` — no separate file. The component renders a horizontally scrollable row of chips.

### DietaryProfileSelector
**File:** `src/components/DietaryProfileSelector/DietaryProfileSelector.jsx`  
**Props:** `{ profiles, selectedId, onToggle }`  
Renders one chip per profile. Active chip: `background #0f172a, color white`. Inactive chip: white with slate border.

### RestaurantCard
**File:** `src/components/RestaurantCard/RestaurantCard.jsx`  
**Props:** `{ restaurant, activeProfile, onClick }`  
Layout: emoji icon (44×44px), name + meta row, tag badges below.  
- Tags matching the active profile: filled dark badge with `✓`
- Other tags: ghost badge (light gray background)

### TagBadge
**File:** `src/components/TagBadge/TagBadge.jsx`  
**Props:** `{ tag, matched }`  
Renders a single tag. `matched=true` → filled dark style. `matched=false` → ghost style.

### DetailDrawer
**File:** `src/components/DetailDrawer/DetailDrawer.jsx` *(new file)*  
**Props:** `{ restaurant, activeProfile, onClose }`  
- Fixed overlay, renders only when `restaurant` is non-null
- Dimmed backdrop (`rgba(0,0,0,0.4)`) — clicking it closes the drawer
- White sheet sliding up from bottom, `border-radius: 16px 16px 0 0`
- Drag handle (decorative only — no gesture handling in this phase)
- Content: emoji, name, meta, matched tag badges, description, highlights

---

## Home.jsx Composition

```jsx
export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const { filtered, activeProfile, selectedProfileId, searchQuery,
          setSearchQuery, toggleProfile } = useDietaryFilter(restaurants);

  useEffect(() => {
    getRestaurants().then(setRestaurants);
  }, []);

  return (
    <>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <DietaryProfileSelector
        profiles={getAllProfiles()}
        selectedId={selectedProfileId}
        onToggle={toggleProfile}
      />
      <main>
        {/* result count + clear */}
        <RestaurantList
          restaurants={filtered}
          activeProfile={activeProfile}
          onSelect={setSelectedRestaurant}
        />
      </main>
      <DetailDrawer
        restaurant={selectedRestaurant}
        activeProfile={activeProfile}
        onClose={() => setSelectedRestaurant(null)}
      />
    </>
  );
}
```

---

## Results Bar

Between the profile strip and the restaurant list: a one-line bar showing result count and active filter label (e.g., "3 restaurants · Halal"). Includes a "Clear" button that calls `clearFilters()`. Hidden when no filter is active.

---

## Empty State

When `filtered` is empty: centered message — "No restaurants match your filter." with a "Clear filters" link.

---

## Routing

`/restaurant/:id` route stays in place but is not used in this phase. `RestaurantDetail.jsx` remains a stub.

---

## Out of Scope

- Group / multi-profile selection
- Real API integration (mock data stays)
- Map view
- CSS Modules
- Gesture-based drawer dismiss (swipe down)
- Sorting or secondary filters
