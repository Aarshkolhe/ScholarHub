import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import pool from "../config/db.js";

/**
 * Remove sensitive information before sending
 * user data back to the frontend.
 */
function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

/**
 * Generate a JWT for an authenticated user.
 */
function generateToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      issuer: process.env.JWT_ISSUER || "scholarhub-api",
      audience:
        process.env.JWT_AUDIENCE || "scholarhub-frontend"
    }
  );
}

/**
 * Validate registration data.
 */
function validateRegistrationInput(
  name,
  email,
  password
) {
  if (!name || !email || !password) {
    return "Name, email and password are required.";
  }

  if (name.length < 2 || name.length > 120) {
    return "Name must be between 2 and 120 characters.";
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return "Please provide a valid email address.";
  }

  if (password.length < 8) {
    return "Password must contain at least 8 characters.";
  }

  if (password.length > 128) {
    return "Password must not exceed 128 characters.";
  }

  return null;
}

/**
 * POST /register
 *
 * Creates a new Student account.
 */
export async function register(req, res) {
  try {
    const name = String(
      req.body?.name || ""
    ).trim();

    const email = String(
      req.body?.email || ""
    )
      .trim()
      .toLowerCase();

    const password = String(
      req.body?.password || ""
    );

    // Validate incoming data before touching the database.
    const validationError =
      validateRegistrationInput(
        name,
        email,
        password
      );

    if (validationError) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: validationError
        }
      });
    }

    /**
     * Check whether an account already exists.
     *
     * $1 is a parameterized PostgreSQL value,
     * preventing SQL injection.
     */
    const existingUser = await pool.query(
      `
        SELECT id
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
      `,
      [email]
    );

    if (existingUser.rowCount > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: "EMAIL_EXISTS",
          message:
            "An account with this email already exists."
        }
      });
    }

    /**
     * Hash the password before storing it.
     *
     * 12 bcrypt rounds provides strong password
     * protection for normal authentication traffic.
     */
    const saltRounds = Number(
      process.env.BCRYPT_ROUNDS || 12
    );

    const passwordHash =
      await bcrypt.hash(
        password,
        saltRounds
      );

    let result;

    try {
      /**
       * Create the user.
       *
       * New registrations are Students by default.
       * Admin accounts should be created through a
       * controlled administrative process.
       */
      result = await pool.query(
        `
          INSERT INTO users (
            name,
            email,
            password_hash,
            role
          )
          VALUES ($1, $2, $3, $4)
          RETURNING
            id,
            name,
            email,
            role
        `,
        [
          name,
          email,
          passwordHash,
          "Student"
        ]
      );
    } catch (error) {
      /**
       * The database unique constraint is the final
       * protection against simultaneous registrations
       * using the same email.
       */
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          error: {
            code: "EMAIL_EXISTS",
            message:
              "An account with this email already exists."
          }
        });
      }

      throw error;
    }

    const user = result.rows[0];

    const safeUser =
      sanitizeUser(user);

    const token =
      generateToken(safeUser);

    /**
     * Frontend contract:
     *
     * {
     *   user: {
     *     id,
     *     name,
     *     email,
     *     role
     *   },
     *   token
     * }
     */
    return res.status(201).json({
      user: safeUser,
      token
    });
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: {
        code: "REGISTRATION_FAILED",
        message:
          "Unable to create account."
      }
    });
  }
}

/**
 * POST /login
 *
 * Authenticates an existing user.
 */
export async function login(req, res) {
  try {
    const email = String(
      req.body?.email || ""
    )
      .trim()
      .toLowerCase();

    const password = String(
      req.body?.password || ""
    );

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message:
            "Email and password are required."
        }
      });
    }

    /**
     * Fetch the account using a parameterized query.
     *
     * password_hash is needed internally for bcrypt
     * verification but is never returned to the client.
     */
    const result = await pool.query(
      `
        SELECT
          id,
          name,
          email,
          password_hash,
          role
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
      `,
      [email]
    );

    const user = result.rows[0];

    /**
     * Use the same error message for both an unknown
     * email and incorrect password. This prevents
     * account enumeration.
     */
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message:
            "Invalid email or password."
        }
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password_hash
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message:
            "Invalid email or password."
        }
      });
    }

    const safeUser =
      sanitizeUser(user);

    const token =
      generateToken(safeUser);

    return res.status(200).json({
      user: safeUser,
      token
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: {
        code: "LOGIN_FAILED",
        message:
          "Unable to process login."
      }
    });
  }
}

/**
 * POST /logout
 *
 * JWTs are stateless, so the current implementation
 * cannot revoke an already-issued token on the server.
 *
 * The frontend should remove its stored token.
 *
 * Server-side token revocation can be added later using
 * a session table or Redis.
 */
export async function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully."
  });
}