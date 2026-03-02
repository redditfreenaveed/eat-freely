# 🍽️ Eat Freely

> **Dietary-aware restaurant discovery** — find places to eat that respect your lifestyle, faith, and health needs.

![Version](https://img.shields.io/badge/version-0.1.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)

---

## 🌍 What is Eat Freely?

Eat Freely helps people with dietary restrictions — whether rooted in **religion, ethics, or health** — discover restaurants where they can eat comfortably.

A Muslim user, for example, doesn't just see Halal-certified restaurants. They also see vegetarian and pescatarian restaurants where they can safely eat, even if those places aren't explicitly Halal. The app is smart about what's compatible, not just what's labelled.

---

## ✨ Features

- 🔍 **Intelligent dietary matching** — profiles understand compatibility, not just labels
- ☪️ **Multi-faith & lifestyle support** — Muslim/Halal, Hindu/Vegetarian, Kosher, Vegan, Gluten-Free, and more
- 🗺️ **Location-aware search** — find restaurants near you
- 🏷️ **Tag-based filtering** — filter by halal, vegetarian, vegan, pescatarian, gluten-free, kosher, sattvic, etc.
- ⭐ **Ratings & highlights** — surface the most relevant details at a glance
- 📱 **Responsive** — works on mobile and desktop

---

## 🗂️ Project Structure

```
eat-freely/
├── public/                     # Static assets (favicon, index.html)
├── src/
│   ├── assets/                 # Images, icons, fonts
│   ├── components/             # Reusable UI components
│   │   ├── RestaurantCard/
│   │   ├── DietaryProfileSelector/
│   │   ├── SearchBar/
│   │   ├── TagBadge/
│   │   └── Header/
│   ├── pages/                  # Top-level page components
│   │   ├── Home/
│   │   ├── RestaurantDetail/
│   │   └── NotFound/
│   ├── hooks/                  # Custom React hooks
│   │   ├── useRestaurantSearch.js
│   │   ├── useGeolocation.js
│   │   └── useDietaryFilter.js
│   ├── context/                # React context / global state
│   │   ├── DietaryContext.js
│   │   └── LocationContext.js
│   ├── services/               # API calls & external integrations
│   │   ├── restaurantService.js
│   │   └── geocodingService.js
│   ├── utils/                  # Helper functions
│   │   ├── dietaryProfiles.js
│   │   ├── tagCompatibility.js
│   │   └── formatters.js
│   ├── styles/                 # Global styles and themes
│   │   ├── global.css
│   │   └── theme.js
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

---

## 🧠 Dietary Profile Logic

Each dietary profile defines:
- **Compatible tags** — what food types are safe to eat
- **Excluded ingredients** — what must be avoided

| Profile | Compatible With | Excludes |
|---|---|---|
| Muslim / Halal | halal, vegetarian, vegan, pescatarian | pork, alcohol |
| Hindu / Vegetarian | vegetarian, vegan, sattvic | beef |
| Kosher | kosher, vegetarian, vegan | pork, shellfish |
| Vegan | vegan | meat, dairy, eggs |
| Gluten-Free | gluten-free | wheat, gluten |
| Vegetarian | vegetarian, vegan | meat, fish |

This logic lives in `src/utils/dietaryProfiles.js` and `src/utils/tagCompatibility.js`, making it easy to extend.

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/eat-freely.git
cd eat-freely

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🔧 Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_GOOGLE_PLACES_API_KEY=your_key_here
VITE_MAPBOX_TOKEN=your_token_here          # optional, for map view
VITE_API_BASE_URL=http://localhost:3000    # if using a backend
```

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 |
| Build tool | Vite |
| Styling | CSS Modules + custom theme |
| State management | React Context + hooks |
| Maps (planned) | Google Maps / Mapbox |
| Restaurant data | Google Places API |
| Routing | React Router v6 |

---

## 🛣️ Roadmap

- [x] Dietary profile selector UI
- [x] Smart tag-compatibility matching
- [x] Restaurant search and filtering
- [ ] Real restaurant data via Google Places API
- [ ] GPS-based location detection
- [ ] Map view
- [ ] User reviews and dietary confirmations
- [ ] Save favourite restaurants
- [ ] Mobile app (React Native)
- [ ] Multi-language support

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

---

## 📄 License

MIT © [Your Name]
