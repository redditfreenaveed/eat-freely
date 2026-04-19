'use strict';

module.exports = (req, res, next) => {
  if (req.admin.role === 'admin') return next();
  if (req.admin.restaurantId !== parseInt(req.params.id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
