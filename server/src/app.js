'use strict';
const express = require('express');
const cors = require('cors');
const restaurantRoutes = require('./routes/restaurants');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/restaurants', restaurantRoutes);

module.exports = app;
