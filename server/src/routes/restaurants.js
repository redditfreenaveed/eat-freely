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
      const tags = req.query.tags.split(',').map((t) => t.trim()).filter(Boolean);
      if (tags.length === 0) {
        result = await query('SELECT * FROM restaurants ORDER BY id', []);
      } else {
        result = await query('SELECT * FROM restaurants WHERE tags && $1 ORDER BY id', [tags]);
      }
    } else {
      result = await query('SELECT * FROM restaurants ORDER BY id', []);
    }
    res.json(result.rows.map(toClient));
  } catch (err) {
    console.error('[restaurants]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    const rResult = await query('SELECT * FROM restaurants WHERE id = $1', [id]);
    const row = rResult.rows[0];
    if (!row) return res.status(404).json({ error: 'Not found' });

    const menuResult = await query(
      `SELECT ms.id AS section_id, ms.name AS section_name, ms.sort_order AS s_order,
              mi.id AS item_id, mi.name AS item_name, mi.description, mi.price, mi.tags, mi.sort_order AS i_order
       FROM menu_sections ms
       LEFT JOIN menu_items mi ON mi.section_id = ms.id
       WHERE ms.restaurant_id = $1
       ORDER BY ms.sort_order, mi.sort_order`,
      [id]
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
    console.error('[restaurants]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
