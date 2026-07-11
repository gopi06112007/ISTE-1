const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const connectDB = require('./config/db');
const { configureCloudinary } = require('./config/cloudinary');
const sanitizeInput = require('./middleware/sanitize');
const { apiRateLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const blogRoutes = require('./routes/blogs');
const galleryRoutes = require('./routes/gallery');

const app = express();
const PORT = process.env.PORT || 5000;

// ──────────────────────────────────────────
// Core Middleware
// ──────────────────────────────────────────

// Security headers
app.use(helmet({ crossOriginResourcePolicy: false }));

// Serve static uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS — allow frontend origin with credentials (cookies)
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parse JSON and URL-encoded bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Parse cookies
app.use(cookieParser());

// Input sanitization (XSS prevention)
app.use(sanitizeInput);

// General API rate limiting
app.use('/api', apiRateLimiter);

// ──────────────────────────────────────────
// API Routes
// ──────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/gallery', galleryRoutes);

// ──────────────────────────────────────────
// Health check
// ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ISTE GMRIT API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ──────────────────────────────────────────
// 404 handler
// ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ──────────────────────────────────────────
// Global error handler
// ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error.',
      errors: messages,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `Duplicate value for ${field}. This value already exists.`,
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format.',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

// ──────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Configure Cloudinary
    configureCloudinary();

    // Start listening
    app.listen(PORT, () => {
      console.log(`\n🚀 ISTE GMRIT Server running on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV}`);
      console.log(`   Client URL:  ${process.env.CLIENT_URL}`);
      console.log(`   Health:      http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
