<<<<<<< HEAD
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
=======
import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs:               15 * 60 * 1000,
  max:                    10,
  skipSuccessfulRequests: true,
  standardHeaders:        true,
  legacyHeaders:          false,
  message: { success: false, message: "Too many attempts — try again in 15 minutes." },
});

export const apiLimiter = rateLimit({
  windowMs:        60 * 1000,
  max:             120,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: "Rate limit exceeded." },
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
});
