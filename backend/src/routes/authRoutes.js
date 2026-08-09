import { Router } from "express";

import {
  register,
  login,
  logout
} from "../controllers/authController.js";

import {
  authenticateToken
} from "../middleware/authMiddleware.js";

const router = Router();

/**
 * Public authentication routes.
 *
 * POST /register
 * Creates a new user account.
 */
router.post("/register", register);

/**
 * POST /login
 * Authenticates an existing user and returns a JWT.
 */
router.post("/login", login);

/**
 * POST /logout
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