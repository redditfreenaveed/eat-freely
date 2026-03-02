/**
 * restaurantService.js
 * Handles fetching restaurant data.
 * Currently uses mock data; swap getRestaurants() for a real API call when ready.
 */

const MOCK_RESTAURANTS = [
  {
    id: 1,
    name: 'Zam Zam Palace',
    cuisine: 'Middle Eastern',
    location: 'Downtown',
    rating: 4.8,
    tags: ['halal', 'vegetarian'],
    image: '🕌',
    priceRange: '$$',
    distance: '0.3 mi',
    highlights: ['Halal Certified', 'Family Friendly'],
    description: 'Authentic Middle Eastern flavors with a fully halal kitchen.',
  },
  {
    id: 2,
    name: 'The Green Temple',
    cuisine: 'Indian Vegetarian',
    location: 'Midtown',
    rating: 4.6,
    tags: ['vegetarian', 'vegan', 'sattvic', 'gluten-free'],
    image: '🌿',
    priceRange: '$',
    distance: '0.7 mi',
    highlights: ['100% Veg', 'No Onion/Garlic available'],
    description: 'Pure vegetarian Indian cuisine with Sattvic options.',
  },
  {
    id: 3,
    name: 'Sakura Garden',
    cuisine: 'Japanese',
    location: 'East Side',
    rating: 4.5,
    tags: ['vegetarian', 'pescatarian', 'gluten-free'],
    image: '🌸',
    priceRange: '$$$',
    distance: '1.2 mi',
    highlights: ['Vegetarian Sushi', 'GF Soy Sauce'],
    description: 'Modern Japanese with extensive vegetarian and pescatarian menus.',
  },
  {
    id: 4,
    name: 'Mediterranean Bites',
    cuisine: 'Mediterranean',
    location: 'West End',
    rating: 4.7,
    tags: ['halal', 'vegetarian', 'vegan', 'pescatarian'],
    image: '🫒',
    priceRange: '$$',
    distance: '0.9 mi',
    highlights: ['Halal Meat', 'Vegan Mezze Platter'],
    description: 'Fresh Mediterranean fare, halal meats and plant-based options.',
  },
  {
    id: 5,
    name: "Klein's Deli",
    cuisine: 'Jewish Deli',
    location: 'Uptown',
    rating: 4.4,
    tags: ['kosher', 'vegetarian'],
    image: '🥯',
    priceRange: '$$',
    distance: '1.5 mi',
    highlights: ['Kosher Certified', 'Classic NYC Deli'],
    description: 'Authentic kosher deli with vegetarian options.',
  },
  {
    id: 6,
    name: 'Verde Cucina',
    cuisine: 'Italian Vegan',
    location: 'Arts District',
    rating: 4.9,
    tags: ['vegan', 'vegetarian', 'gluten-free'],
    image: '🍝',
    priceRange: '$$$',
    distance: '2.1 mi',
    highlights: ['Fully Vegan', 'GF Pasta Available'],
    description: 'Upscale Italian dining reimagined with plant-based ingredients.',
  },
  {
    id: 7,
    name: 'Punjabi Dhaba',
    cuisine: 'North Indian',
    location: 'Little India',
    rating: 4.3,
    tags: ['halal', 'vegetarian'],
    image: '🍛',
    priceRange: '$',
    distance: '1.8 mi',
    highlights: ['Halal Certified', 'Authentic Recipes'],
    description: 'Hearty North Indian curries and breads in a lively setting.',
  },
  {
    id: 8,
    name: 'The Harvest Table',
    cuisine: 'American',
    location: 'Suburbs',
    rating: 4.2,
    tags: ['vegetarian', 'vegan', 'gluten-free'],
    image: '🥬',
    priceRange: '$$',
    distance: '3.4 mi',
    highlights: ['Farm-to-Table', 'Allergen Menu Available'],
    description: 'Seasonal American cuisine with robust plant-based offerings.',
  },
];

/**
 * Fetch all restaurants.
 * Replace with a real API call, e.g.:
 *   const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/restaurants`);
 *   return res.json();
 */
export const getRestaurants = async () => {
  return MOCK_RESTAURANTS;
};

/**
 * Fetch a single restaurant by ID.
 */
export const getRestaurantById = async (id) => {
  return MOCK_RESTAURANTS.find((r) => r.id === Number(id)) || null;
};
