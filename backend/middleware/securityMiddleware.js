/**
 * Lightweight Security & Rate Limiter Middlewares for Production
 */

const requestCounts = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 200; // Max 200 requests per 15 mins per IP

// Clean up stale IP records every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now - data.startTime > WINDOW_MS) {
      requestCounts.delete(ip);
    }
  }
}, 10 * 60 * 1000);

export const rateLimiter = (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown_ip';
  const now = Date.now();

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, startTime: now });
    return next();
  }

  const data = requestCounts.get(ip);

  if (now - data.startTime > WINDOW_MS) {
    data.count = 1;
    data.startTime = now;
    return next();
  }

  data.count += 1;

  if (data.count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again after 15 minutes.',
    });
  }

  next();
};

export const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};
