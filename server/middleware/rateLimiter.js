const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for login endpoint.
 * Max 5 failed attempts per IP within 15 minutes.
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Allow 10 requests per window (some may be successful)
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: true, // Only count failed requests (4xx/5xx)
});

/**
 * General API rate limiter.
 * Max 100 requests per minute per IP.
 */
const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginRateLimiter, apiRateLimiter };
