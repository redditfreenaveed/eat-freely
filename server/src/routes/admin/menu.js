'use strict';
const express = require('express');
const { query } = require('../../db/client');

const router = express.Router({ mergeParams: true });

// Sections
router.post('/sections', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Section name required' });
  try {
    const result = await query(
      'INSERT INTO menu_sections (restaurant_id, name, sort_order) VALUES ($1, $2, 0) RETURNING *',
      [req.params.id, name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[admin/menu POST sections]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/sections/:sectionId', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await query(
      'UPDATE menu_sections SET name = COALESCE($1, name) WHERE id = $2 RETURNING *',
      [name, req.params.sectionId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[admin/menu PATCH section]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/sections/:sectionId', async (req, res) => {
  try {
    const result = await query('DELETE FROM menu_sections WHERE id = $1 RETURNING id', [req.params.sectionId]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    console.error('[admin/menu DELETE section]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Items
router.post('/sections/:sectionId/items', async (req, res) => {
  const { name, description, price, tags } = req.body;
  if (!name) return res.status(400).json({ error: 'Item name required' });
  try {
    const result = await query(
      'INSERT INTO menu_items (section_id, name, description, price, tags, sort_order) VALUES ($1,$2,$3,$4,$5,0) RETURNING *',
      [req.params.sectionId, name, description || null, price || null, tags || []]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[admin/menu POST item]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/items/:itemId', async (req, res) => {
  const { name, description, price, tags } = req.body;
  try {
    const result = await query(
      `UPDATE menu_items SET
        name        = COALESCE($1, name),
        description = COALESCE($2, description),
        price       = COALESCE($3, price),
        tags        = COALESCE($4, tags)
       WHERE id = $5 RETURNING *`,
      [name, description, price, tags, req.params.itemId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[admin/menu PATCH item]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/items/:itemId', async (req, res) => {
  try {
    const result = await query('DELETE FROM menu_items WHERE id = $1 RETURNING id', [req.params.itemId]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    console.error('[admin/menu DELETE item]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
