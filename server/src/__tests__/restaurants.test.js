'use strict';
const request = require('supertest');

jest.mock('../db/client', () => ({ pool: {}, query: jest.fn() }));
const { query } = require('../db/client');
const app = require('../app');

const MOCK_ROW = {
  id: 1, name: 'Test Place', cuisine: 'Italian', location: 'Downtown',
  rating: '4.5', price_range: '$$', distance: '0.5 mi',
  description: 'Good food', highlights: ['Award winning'], tags: ['vegan'], image: '🍕',
};

beforeEach(() => query.mockReset());

describe('GET /api/restaurants', () => {
  it('returns 200 with camelCase priceRange', async () => {
    query.mockResolvedValueOnce({ rows: [MOCK_ROW] });
    const res = await request(app).get('/api/restaurants');
    expect(res.status).toBe(200);
    expect(res.body[0].priceRange).toBe('$$');
    expect(res.body[0]).not.toHaveProperty('price_range');
  });

  it('passes tags array to query when ?tags param given', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    await request(app).get('/api/restaurants?tags=halal,vegan');
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('&&'),
      [['halal', 'vegan']]
    );
  });

  it('returns 200 with empty array when ?tags= is empty string', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/restaurants?tags=');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/restaurants/:id', () => {
  it('returns 200 with empty menu array when no sections', async () => {
    query.mockResolvedValueOnce({ rows: [MOCK_ROW] });
    query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/restaurants/1');
    expect(res.status).toBe(200);
    expect(res.body.menu).toEqual([]);
    expect(res.body.priceRange).toBe('$$');
  });

  it('assembles menu sections and items correctly', async () => {
    query.mockResolvedValueOnce({ rows: [MOCK_ROW] });
    query.mockResolvedValueOnce({ rows: [
      { section_id: 10, section_name: 'Starters', s_order: 0, item_id: 1, item_name: 'Soup', description: 'Hot', price: '$5', tags: ['vegan'], i_order: 0 },
      { section_id: 10, section_name: 'Starters', s_order: 0, item_id: 2, item_name: 'Salad', description: 'Fresh', price: '$7', tags: ['vegan'], i_order: 1 },
    ]});
    const res = await request(app).get('/api/restaurants/1');
    expect(res.status).toBe(200);
    expect(res.body.menu).toHaveLength(1);
    expect(res.body.menu[0].section).toBe('Starters');
    expect(res.body.menu[0].items).toHaveLength(2);
  });

  it('returns 404 when restaurant not found', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/restaurants/999');
    expect(res.status).toBe(404);
  });

  it('returns 400 for non-integer id', async () => {
    const res = await request(app).get('/api/restaurants/abc');
    expect(res.status).toBe(400);
  });
});
