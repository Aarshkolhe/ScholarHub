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

const router = Router();

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
  forgotPassword
);

/**
 * POST /verify-otp
 *
 * Verifies the OTP sent to the user's email.
 */
router.post(
  "/verify-otp",
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