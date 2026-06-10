const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('express-async-errors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const uploadsRoutes = require('./routes/uploads');
const ordersRoutes = require('./routes/orders');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 1. CORS — allow localhost in dev and the production Vercel domain
// Strip any accidental trailing slash from CORS_ORIGIN (browsers send Origin without one)
const rawCorsOrigin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.replace(/\/$/, '') : null;
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  rawCorsOrigin,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// 2. Body parser
app.use(express.json());

// 3. Static files
app.use('/uploads', express.static(uploadsDir));

// 4. Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/menu', uploadsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/settings', settingsRoutes);

// 5. Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred.';
  
  res.status(statusCode).json({
    error: true,
    message: message
  });
});

app.listen(PORT, () => {
  console.log(`Express server skeleton running on port ${PORT}`);
});

module.exports = app;
