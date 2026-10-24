'use strict';

module.exports = (req, res, next) => {
  if (!req.admin) return res.status(401).json({ error: 'Unauthorized' });
  if (req.admin.role === 'admin') return next();
  const paramId = Number(req.params.id);
  if (!Number.isInteger(paramId)) return res.status(400).json({ error: 'Invalid resource id' });
  if (req.admin.restaurantId !== paramId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
