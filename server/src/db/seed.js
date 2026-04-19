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
  if (!process.env.SEED_ADMIN_PASSWORD) throw new Error('SEED_ADMIN_PASSWORD env var is required');
  const client = await pool.connect();
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);
    console.log('Tables created');

    const existing = await client.query('SELECT COUNT(*) FROM restaurants');
    if (parseInt(existing.rows[0].count) > 0) {
      console.log('Restaurants already seeded — skipping');
    } else {
      try {
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
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
      console.log(`Seeded ${RESTAURANTS.length} restaurants`);
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
