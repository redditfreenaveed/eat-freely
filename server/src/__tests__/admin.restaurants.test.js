'use strict';
process.env.JWT_SECRET = 'test-secret';

jest.mock('../db/client', () => ({ pool: {}, query: jest.fn() }));
const { query } = require('../db/client');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../app');

const adminToken = jwt.sign({ adminId: 1, role: 'admin', restaurantId: null }, 'test-secret');
const ownerToken = jwt.sign({ adminId: 2, role: 'owner', restaurantId: 3 }, 'test-secret');
const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

const MOCK_ROW = {
  id: 1, name: 'Test', cuisine: 'Italian', location: 'City',
  rating: '4.5', price_range: '$$', distance: '1 mi',
  description: 'Nice', highlights: [], tags: ['vegan'], image: '🍕',
};

beforeEach(() => query.mockReset());

describe('GET /api/admin/restaurants', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/admin/restaurants');
    expect(res.status).toBe(401);
  });

  it('returns all restaurants for admin', async () => {
    query.mockResolvedValueOnce({ rows: [MOCK_ROW] });
    const res = await request(app).get('/api/admin/restaurants').set(authHeader(adminToken));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('returns only own restaurant for owner', async () => {
    query.mockResolvedValueOnce({ rows: [{ ...MOCK_ROW, id: 3 }] });
    const res = await request(app).get('/api/admin/restaurants').set(authHeader(ownerToken));
    expect(res.status).toBe(200);
    expect(query).toHaveBeenCalledWith(expect.any(String), [3]);
  });
});

describe('POST /api/admin/restaurants', () => {
  it('returns 403 for owner role', async () => {
    const res = await request(app)
      .post('/api/admin/restaurants')
      .set(authHeader(ownerToken))
      .send({ name: 'New Place', cuisine: 'Thai', location: 'Uptown' });
    expect(res.status).toBe(403);
  });

  it('creates restaurant and returns 201 for admin', async () => {
    query.mockResolvedValueOnce({ rows: [MOCK_ROW] });
    const res = await request(app)
      .post('/api/admin/restaurants')
      .set(authHeader(adminToken))
      .send({ name: 'New Place', cuisine: 'Thai', location: 'Uptown', priceRange: '$$' });
    expect(res.status).toBe(201);
    expect(res.body.priceRange).toBe('$$');
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/admin/restaurants')
      .set(authHeader(adminToken))
      .send({ cuisine: 'Thai' });
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/admin/restaurants/:id', () => {
  it('returns 403 for owner trying to edit another restaurant', async () => {
    const res = await request(app)
      .patch('/api/admin/restaurants/99')
      .set(authHeader(ownerToken))
      .send({ name: 'Updated' });
    expect(res.status).toBe(403);
  });

  it('updates and returns 200 for owner editing their own restaurant', async () => {
    query.mockResolvedValueOnce({ rows: [{ ...MOCK_ROW, id: 3, name: 'Updated' }] });
    const res = await request(app)
      .patch('/api/admin/restaurants/3')
      .set(authHeader(ownerToken))
      .send({ name: 'Updated' });
    expect(res.status).toBe(200);
  });

  it('returns 404 when restaurant not found', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .patch('/api/admin/restaurants/999')
      .set(authHeader(adminToken))
      .send({ name: 'Updated' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/admin/restaurants/:id', () => {
  it('returns 403 for owner', async () => {
    const res = await request(app)
      .delete('/api/admin/restaurants/3')
      .set(authHeader(ownerToken));
    expect(res.status).toBe(403);
  });

  it('deletes and returns 204 for admin', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    const res = await request(app)
      .delete('/api/admin/restaurants/1')
      .set(authHeader(adminToken));
    expect(res.status).toBe(204);
  });

  it('returns 404 when restaurant not found', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .delete('/api/admin/restaurants/999')
      .set(authHeader(adminToken));
    expect(res.status).toBe(404);
  });
});
