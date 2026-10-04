import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter to protect threat intelligence endpoints from abuse
 */
export const scanRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 scan requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many scans initiated from this IP address. Please wait 15 minutes before scanning again.'
  }
});

export const apiRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});
