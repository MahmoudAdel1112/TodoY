const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const todoRouter = require('./routes/todoRoute');
const userRouter = require('./routes/user.route');
const globalErrorHandler = require('./middleware/errorHandler');
const AppError = require('./classes/AppError');
const validateEnv = require('./utils/envValidator');

// Load environment variables
dotenv.config();

// Validate required environment variables
validateEnv();

const app = express();

// MongoDB connection with improved error handling
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    // Exit process if database connection fails
    process.exit(1);
  });

// Trust proxy (important for rate limiting behind reverse proxies)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
// In production, CORS_ORIGIN should be set to your frontend URL (comma-separated for multiple)
// In development, defaults to allowing all origins
const corsOrigin = process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? undefined : '*');

app.use(cors({
  origin: corsOrigin ? (corsOrigin.includes(',') ? corsOrigin.split(',').map(o => o.trim()) : corsOrigin) : '*',
  credentials: true,
}));

// Body parser with size limits
app.use(express.json({ limit: '10kb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Limit URL-encoded payload size

// Logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiter to all routes
app.use('/api/v1', generalLimiter);

// Routes
app.use('/api/v1/todos', todoRouter);
app.use('/api/v1/users', userRouter);

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

// Start server
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}...`);
});

module.exports = app;
