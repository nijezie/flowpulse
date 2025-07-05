const rateLimit = require("express-rate-limit")

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Stricter rate limiting for betting endpoints
const bettingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 betting requests per minute
  message: {
    error: "Too many betting requests, please slow down.",
    retryAfter: "1 minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Alert creation rate limiting
const alertLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 alert operations per 5 minutes
  message: {
    error: "Too many alert operations, please wait before trying again.",
    retryAfter: "5 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = {
  apiLimiter,
  bettingLimiter,
  alertLimiter,
}
