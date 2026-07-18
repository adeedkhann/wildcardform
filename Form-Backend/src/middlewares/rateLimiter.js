import rateLimit from "express-rate-limit";

export const registerLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: {
      status: 429,
      error: 'Too many registration attempts. Try again after 5 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });