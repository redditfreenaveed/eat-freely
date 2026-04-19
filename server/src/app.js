'use strict';
const express = require('express');
const cors = require('cors');
const restaurantRoutes = require('./routes/restaurants');
const adminAuthRoutes = require('./routes/admin/auth');
const adminRestaurantRoutes = require('./routes/admin/restaurants');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/restaurants', adminRestaurantRoutes);

module.exports = app;
