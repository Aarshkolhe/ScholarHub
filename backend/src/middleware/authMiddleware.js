import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { getUserRole } from "../utils/roleUtils.js";

/**
 * JWT authentication middleware.
 *
 * Expected request header:
 * Authorization: Bearer <token>
 *
 * Checks user status in DB on every authenticated request so blocked users lose access immediately.
 */
export async function authenticateToken(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: {
          code: "AUTH_REQUIRED",
          message: "Authentication token is required."
        }
      });
    }

    const token = authorization.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: "AUTH_REQUIRED",
          message: "Authentication token is required."
        }
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        issuer: process.env.JWT_ISSUER || "scholarhub-api",
        audience: process.env.JWT_AUDIENCE || "scholarhub-frontend"
      }
    );

    // Fetch user from DB to check status & role in real-time
    const userResult = await pool.query(
      `
        SELECT id, name, email, role, status
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [decoded.sub]
    );

    if (userResult.rowCount === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User account no longer exists."
        }
      });
    }

    const dbUser = userResult.rows[0];

    // Enforce immediate access removal for blocked users (Rule 5)
    if (dbUser.status === "blocked") {
      return res.status(403).json({
        success: false,
        error: {
          code: "ACCOUNT_BLOCKED",
          message: "Your account is blocked."
        }
      });
    }

    const effectiveRole = getUserRole(dbUser);

    req.user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: effectiveRole,
      status: dbUser.status
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: {
          code: "TOKEN_EXPIRED",
          message: "Authentication token has expired."
        }
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid authentication token."
        }
      });
    }

    console.error("JWT authentication error:", error);

    return res.status(401).json({
      success: false,
      error: {
        code: "AUTHENTICATION_FAILED",
        message: "Authentication failed."
      }
    });
  }
}

/**
 * Server-side Role authorization middleware generator.
 * Example: requireRole("admin", "super_admin")
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "AUTH_REQUIRED",
          message: "Authentication token is required."
        }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Access denied: insufficient permissions."
        }
      });
    }

    next();
  };
}

/**
 * Backwards-compatible Admin middleware
 */
export const requireAdmin = requireRole("admin", "super_admin");
