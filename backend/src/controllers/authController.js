import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import pool from "../config/db.js";

import {
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  markOtpAsUsed
} from "../services/otpService.js";

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
      audience: process.env.JWT_AUDIENCE || "scholarhub-frontend"
    }
  );
}

/**
 * Validate registration data.
 */
function validateRegistrationInput(email, password) {
  if (!email || !password) {
    return "Email and password are required.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
 */
export async function register(req, res) {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    const password = String(req.body?.password || "");

    const validationError = validateRegistrationInput(
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
          message: "An account with this email already exists."
        }
      });
    }

    const saltRounds = Number(
      process.env.BCRYPT_ROUNDS || 12
    );

    const passwordHash = await bcrypt.hash(
      password,
      saltRounds
    );

    const name = String(req.body?.name || email.split("@")[0]).trim();

    let result;

    try {
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
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          error: {
            code: "EMAIL_EXISTS",
            message: "An account with this email already exists."
          }
        });
      }

      throw error;
    }

    const user = result.rows[0];

    const safeUser = sanitizeUser(user);
    const token = generateToken(safeUser);

    return res.status(201).json({
      user: safeUser,
      token
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      error: {
        code: "REGISTRATION_FAILED",
        message: "Unable to create account."
      }
    });
  }
}

/**
 * POST /login
 */
export async function login(req, res) {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Email and password are required."
        }
      });
    }

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

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password."
        }
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password."
        }
      });
    }

    const safeUser = sanitizeUser(user);
    const token = generateToken(safeUser);

    return res.status(200).json({
      user: safeUser,
      token
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      error: {
        code: "LOGIN_FAILED",
        message: "Unable to process login."
      }
    });
  }
}

/**
 * POST /logout
 */
export async function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully."
  });
}

/**
 * POST /forgot-password
 *
 * Sends a password-reset OTP to the registered email.
 */
export async function forgotPassword(req, res) {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Email is required."
        }
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please provide a valid email address."
        }
      });
    }

    const result = await requestPasswordResetOtp(email);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      error: {
        code: "FORGOT_PASSWORD_FAILED",
        message: "Unable to process password reset request."
      }
    });
  }
}

/**
 * POST /verify-otp
 *
 * Verifies the OTP sent to the user's email.
 */
export async function verifyOtp(req, res) {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    const otp = String(req.body?.otp || "").trim();

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Email and OTP are required."
        }
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_OTP",
          message: "OTP must contain 6 digits."
        }
      });
    }

    const result = await verifyPasswordResetOtp(
      email,
      otp
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_OTP",
          message: result.message
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      resetToken: result.otpId
    });
  } catch (error) {
    console.error("OTP verification error:", error);

    return res.status(500).json({
      success: false,
      error: {
        code: "OTP_VERIFICATION_FAILED",
        message: "Unable to verify OTP."
      }
    });
  }
}

/**
 * POST /reset-password
 *
 * Creates a new password after OTP verification.
 */
export async function resetPassword(req, res) {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    const otp = String(req.body?.otp || "").trim();

    const newPassword = String(
      req.body?.newPassword || ""
    );

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Email, OTP and new password are required."
        }
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_OTP",
          message: "OTP must contain 6 digits."
        }
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: {
          code: "WEAK_PASSWORD",
          message: "Password must contain at least 8 characters."
        }
      });
    }

    if (newPassword.length > 128) {
      return res.status(400).json({
        success: false,
        error: {
          code: "WEAK_PASSWORD",
          message: "Password must not exceed 128 characters."
        }
      });
    }

    // Verify OTP again before changing the password.
    const otpResult = await verifyPasswordResetOtp(
      email,
      otp
    );

    if (!otpResult.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_OTP",
          message: otpResult.message
        }
      });
    }

    const saltRounds = Number(
      process.env.BCRYPT_ROUNDS || 12
    );

    const passwordHash = await bcrypt.hash(
      newPassword,
      saltRounds
    );

    const updateResult = await pool.query(
      `
        UPDATE users
        SET
          password_hash = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING
          id,
          name,
          email,
          role
      `,
      [
        passwordHash,
        otpResult.userId
      ]
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User account could not be found."
        }
      });
    }

    // Prevent the OTP from being reused.
    await markOtpAsUsed(otpResult.otpId);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully."
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      error: {
        code: "PASSWORD_RESET_FAILED",
        message: "Unable to reset password."
      }
    });
  }
}