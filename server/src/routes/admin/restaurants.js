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
    let result;
    if (req.admin.role === 'admin') {
      result = await query('SELECT * FROM restaurants ORDER BY id', []);
    } else {
      if (req.admin.restaurantId == null) {
        return res.status(403).json({ error: 'Owner account has no restaurant assigned' });
      }
      result = await query('SELECT * FROM restaurants WHERE id = $1', [req.admin.restaurantId]);
    }
    res.json(result.rows.map(toClient));
  } catch (err) {
    console.error('[admin/restaurants GET]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  if (req.admin.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { name, cuisine, location, rating, priceRange, distance, description, highlights, tags, image } = req.body;
  if (!name) return res.status(400).json({ error: 'Restaurant name is required' });
  try {
    const result = await query(
      `INSERT INTO restaurants (name, cuisine, location, rating, price_range, distance, description, highlights, tags, image)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, cuisine, location, rating || null, priceRange || null, distance || null, description || null, highlights || [], tags || [], image || null]
    );
    if (!result.rows[0]) return res.status(500).json({ error: 'Insert failed' });
    res.status(201).json(toClient(result.rows[0]));
  } catch (err) {
    console.error('[admin/restaurants POST]', err);
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
    console.error('[admin/restaurants PATCH]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  if (req.admin.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid id' });
  try {
    const result = await query('DELETE FROM restaurants WHERE id = $1 RETURNING id', [id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    console.error('[admin/restaurants DELETE]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.use('/:id/menu', requireOwner, menuRouter);

module.exports = router;
