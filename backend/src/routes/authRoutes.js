import { Router } from "express";

import {
  register,
  login,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword
} from "../controllers/authController.js";

import {
  authenticateToken
} from "../middleware/authMiddleware.js";

import rateLimit from "express-rate-limit";

const router = Router();

// Rate Limiter for Public Auth Endpoints (configurable via AUTH_RATE_LIMIT_MAX)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many authentication requests. Please try again later."
    }
  }
});

// --------------------------------------------------
// Public Authentication Routes
// --------------------------------------------------

/**
 * POST /register
 *
 * Creates a new user account.
 */
router.post(
  "/register",
  authLimiter,
  register
);

/**
 * POST /login
 *
 * Authenticates an existing user
 * and returns a JWT.
 */
router.post(
  "/login",
  authLimiter,
  login
);

// --------------------------------------------------
// Password Reset Routes
// --------------------------------------------------

/**
 * POST /forgot-password
 *
 * Sends a 6-digit OTP to the user's
 * registered email address.
 */
router.post(
  "/forgot-password",
  authLimiter,
  forgotPassword
);

/**
 * POST /verify-otp
 *
 * Verifies the OTP sent to the user's email.
 */
router.post(
  "/verify-otp",
  authLimiter,
  verifyOtp
);

/**
 * POST /reset-password
 *
 * Resets the user's password after
 * successful OTP verification.
 */
router.post(
  "/reset-password",
  authLimiter,
  resetPassword
);

// --------------------------------------------------
// Protected Routes
// --------------------------------------------------

/**
 * POST /logout
 *
 * Requires a valid JWT.
 *
 * Expected header:
 * Authorization: Bearer <token>
 */
router.post(
  "/logout",
  authenticateToken,
  logout
);

export default router;