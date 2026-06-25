import rateLimit from 'express-rate-limit';

/* ── Auth endpoints — strict ─────────────────────────────────── */
export const authLimiter = rateLimit({
  windowMs:  15 * 60 * 1000,   // 15 minutes
  max:       10,
  message:   { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders:   false,
  skipSuccessfulRequests: true,
});

/* ── General API — relaxed ───────────────────────────────────── */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,          // 1 minute
  max:      100,
  message:  { success: false, message: 'Rate limit exceeded. Slow down.' },
  standardHeaders: true,
  legacyHeaders:   false,
});
