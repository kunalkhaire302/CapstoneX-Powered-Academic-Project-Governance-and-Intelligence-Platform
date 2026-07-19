const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for auth routes (login, register, forgot-password).
 * 5 requests per 15 minutes per IP for brute-force protection.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased for dev testing
  message: { error: 'Too many auth requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
});

/**
 * General API rate limiter.
 * 500 requests per 15 minutes per IP.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
});

module.exports = { authLimiter, generalLimiter };
