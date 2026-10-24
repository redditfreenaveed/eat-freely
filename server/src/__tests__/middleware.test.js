'use strict';
process.env.JWT_SECRET = 'test-secret';
const jwt = require('jsonwebtoken');
const requireAdmin = require('../middleware/requireAdmin');
const requireOwner = require('../middleware/requireOwner');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('requireAdmin', () => {
  it('returns 401 when no Authorization header', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();
    requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for invalid token', () => {
    const req = { headers: { authorization: 'Bearer bad.token.here' } };
    const res = mockRes();
    const next = jest.fn();
    requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next and sets req.admin for valid token', () => {
    const token = jwt.sign({ adminId: 1, role: 'admin', restaurantId: null }, 'test-secret');
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();
    requireAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.admin.adminId).toBe(1);
  });

  it('returns 401 for expired token', () => {
    const token = jwt.sign({ adminId: 1, role: 'admin', restaurantId: null }, 'test-secret', { expiresIn: -1 });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();
    requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('requireOwner', () => {
  it('calls next for admin role regardless of restaurant id', () => {
    const req = { admin: { role: 'admin', restaurantId: null }, params: { id: '5' } };
    const res = mockRes();
    const next = jest.fn();
    requireOwner(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('calls next for owner when restaurant id matches', () => {
    const req = { admin: { role: 'owner', restaurantId: 3 }, params: { id: '3' } };
    const res = mockRes();
    const next = jest.fn();
    requireOwner(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 403 for owner when restaurant id does not match', () => {
    const req = { admin: { role: 'owner', restaurantId: 3 }, params: { id: '7' } };
    const res = mockRes();
    const next = jest.fn();
    requireOwner(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
