const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');

dotenv.config();
// Connect to database
const connectDB = require('./config/db');
connectDB();

const app = express();
// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/brand', require('./routes/brand'));
app.use("/admin", require("./routes/adminAuth"));


// Cookie parser
app.use(cookieParser());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Sanitize data
//app.use(mongoSanitize());

// Set security headers
app.use(helmet());
// Prevent XSS attacks
app.use(xss());
// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);
// Authentication routes ONLY
app.use('/auth', require('./routes/auth'));
app.use('/influencer', require('./routes/influencer'));
// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication server is running!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler - Changed from '/*' to middleware without path
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Authentication server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
