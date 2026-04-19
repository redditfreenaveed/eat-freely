import { createContext, useContext, useState } from 'react';

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
