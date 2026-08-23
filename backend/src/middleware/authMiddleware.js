import jwt from "jsonwebtoken";

/**
 * JWT authentication middleware.
 *
 * Expected request header:
 * Authorization: Bearer <token>
 *
 * On successful verification, the authenticated user's
 * information is attached to req.user.
 */
export function authenticateToken(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    // Reject requests without a Bearer token.
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

    /*
     * jwt.verify() validates:
     * - Token signature
     * - Token expiration
     * - Issuer
     * - Audience
     */
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        issuer: process.env.JWT_ISSUER || "scholarhub-api",
        audience:
          process.env.JWT_AUDIENCE || "scholarhub-frontend"
      }
    );

    /*
     * Only expose the fields required by the application.
     * Do not attach the entire JWT payload unnecessarily.
     */
    req.user = {
      id: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role
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
 * Server-side Admin authorization middleware.
 * Must run AFTER authenticateToken.
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: "AUTH_REQUIRED",
        message: "Authentication token is required."
      }
    });
  }

  if (req.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Admin privilege is required to access this resource."
      }
    });
  }

  next();
}
