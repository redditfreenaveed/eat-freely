'use strict';
process.env.JWT_SECRET = 'test-secret';

jest.mock('../db/client', () => ({ pool: {}, query: jest.fn() }));
const { query } = require('../db/client');
const bcrypt = require('bcrypt');
const request = require('supertest');
const app = require('../app');

beforeEach(() => query.mockReset());

describe('POST /api/admin/auth/login', () => {
  it('returns 400 when body is missing', async () => {
    const res = await request(app).post('/api/admin/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('returns 401 when email not found', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: 'unknown@x.com', password: 'pass' });
    expect(res.status).toBe(401);
  });

  it('returns 401 when password is wrong', async () => {
    const hash = await bcrypt.hash('correct', 10);
    query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'a@b.com', password_hash: hash, role: 'admin', restaurant_id: null }] });
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: 'a@b.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('returns 200 with token when credentials are valid', async () => {
    const hash = await bcrypt.hash('correct', 10);
    query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'a@b.com', password_hash: hash, role: 'admin', restaurant_id: null }] });
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: 'a@b.com', password: 'correct' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.role).toBe('admin');
  });
});
