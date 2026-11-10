import rateLimit from 'express-rate-limit';

// Global API rate limit: 15,000 requests per 15 minutes (easily supports 50-100+ simultaneous users)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Server is currently handling high volume traffic. Please wait a moment.'
  }
});

// Authentication rate limit: 200 attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again after a few minutes.'
  }
});
