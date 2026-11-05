import rateLimit from 'express-rate-limit';

// Global API rate limit: 3000 requests per 15 minutes (generous for active WhatsApp chat polling)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this client. Please slow down.'
  }
});

// Authentication rate limit: 100 attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again after a few minutes.'
  }
});
