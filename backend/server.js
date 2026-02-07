const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const podRoutes = require('./routes/pod');
const isbnRoutes = require('./routes/isbn');
const royaltyRoutes = require('./routes/royalty');
const distributionRoutes = require('./routes/distribution');
const coverRoutes = require('./routes/covers');
const marketingRoutes = require('./routes/marketing');
const recommendationRoutes = require('./routes/recommendations');
const reviewRoutes = require('./routes/reviews');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/pod', podRoutes);
app.use('/api/isbn', isbnRoutes);
app.use('/api/royalty', royaltyRoutes);
app.use('/api/distribution', distributionRoutes);
app.use('/api/covers', coverRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Book Publishing Platform API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
