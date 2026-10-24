'use strict';
process.env.JWT_SECRET = 'test-secret';

jest.mock('../db/client', () => ({ pool: {}, query: jest.fn() }));
const { query } = require('../db/client');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../app');

const adminToken = jwt.sign({ adminId: 1, role: 'admin', restaurantId: null }, 'test-secret');
const ownerToken = jwt.sign({ adminId: 2, role: 'owner', restaurantId: 3 }, 'test-secret');
const auth = (token) => ({ Authorization: `Bearer ${token}` });

beforeEach(() => query.mockReset());

describe('POST /api/admin/restaurants/:id/menu/sections', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/admin/restaurants/1/menu/sections');
    expect(res.status).toBe(401);
  });

  it('returns 403 when owner tries to edit another restaurant', async () => {
    const res = await request(app)
      .post('/api/admin/restaurants/99/menu/sections')
      .set(auth(ownerToken))
      .send({ name: 'Starters' });
    expect(res.status).toBe(403);
  });

  it('creates a section and returns 201', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 10, restaurant_id: 1, name: 'Starters', sort_order: 0 }] });
    const res = await request(app)
      .post('/api/admin/restaurants/1/menu/sections')
      .set(auth(adminToken))
      .send({ name: 'Starters' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Starters');
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/admin/restaurants/1/menu/sections')
      .set(auth(adminToken))
      .send({});
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/admin/restaurants/:id/menu/sections/:sectionId', () => {
  it('renames a section and returns 200', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 10, restaurant_id: 1, name: 'Appetisers', sort_order: 0 }] });
    const res = await request(app)
      .patch('/api/admin/restaurants/1/menu/sections/10')
      .set(auth(adminToken))
      .send({ name: 'Appetisers' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Appetisers');
  });

  it('returns 404 when section not found', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .patch('/api/admin/restaurants/1/menu/sections/999')
      .set(auth(adminToken))
      .send({ name: 'New Name' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/admin/restaurants/:id/menu/sections/:sectionId', () => {
  it('deletes a section and returns 204', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 10 }] });
    const res = await request(app)
      .delete('/api/admin/restaurants/1/menu/sections/10')
      .set(auth(adminToken));
    expect(res.status).toBe(204);
  });

  it('returns 404 when section not found', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .delete('/api/admin/restaurants/1/menu/sections/999')
      .set(auth(adminToken));
    expect(res.status).toBe(404);
  });
});

describe('POST /api/admin/restaurants/:id/menu/sections/:sectionId/items', () => {
  it('creates an item and returns 201', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 50, section_id: 10, name: 'Soup', description: 'Hot', price: '$5', tags: ['vegan'], sort_order: 0 }] });
    const res = await request(app)
      .post('/api/admin/restaurants/1/menu/sections/10/items')
      .set(auth(adminToken))
      .send({ name: 'Soup', description: 'Hot', price: '$5', tags: ['vegan'] });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Soup');
  });
});

describe('PATCH /api/admin/restaurants/:id/menu/items/:itemId', () => {
  it('updates an item and returns 200', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 50, section_id: 10, name: 'Updated Soup', description: 'Hot', price: '$6', tags: ['vegan'], sort_order: 0 }] });
    const res = await request(app)
      .patch('/api/admin/restaurants/1/menu/items/50')
      .set(auth(adminToken))
      .send({ name: 'Updated Soup', price: '$6' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Soup');
  });
});

describe('DELETE /api/admin/restaurants/:id/menu/items/:itemId', () => {
  it('deletes an item and returns 204', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 50 }] });
    const res = await request(app)
      .delete('/api/admin/restaurants/1/menu/items/50')
      .set(auth(adminToken));
    expect(res.status).toBe(204);
  });
});
