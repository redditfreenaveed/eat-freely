'use strict';
const request = require('supertest');

jest.mock('../db/client', () => ({ pool: {}, query: jest.fn() }));

const app = require('../app');

test('GET /health returns 200 with ok:true', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ ok: true });
});
