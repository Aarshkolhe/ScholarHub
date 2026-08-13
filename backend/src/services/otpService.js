import crypto from "crypto";
import pool from "../config/db.js";
import { sendEmail } from "./emailService.js";

// OTP configuration
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

// --------------------------------------------------
// Generate a secure 6-digit OTP
// --------------------------------------------------

function generateOtp() {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH;

  return crypto.randomInt(min, max).toString();
}

// --------------------------------------------------
// Hash OTP before storing it
// --------------------------------------------------

function hashOtp(otp) {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
}

// --------------------------------------------------
// Request Password Reset OTP
// --------------------------------------------------

export async function requestPasswordResetOtp(email) {
  const normalizedEmail = email.trim().toLowerCase();

  // Find the user
  const userResult = await pool.query(
    `
    SELECT id, name, email
    FROM users
    WHERE LOWER(email) = $1
    LIMIT 1
    `,
    [normalizedEmail]
  );

  // Don't reveal whether an email exists.
  if (userResult.rows.length === 0) {
    return {
      success: true,
      message: "If an account exists with this email, an OTP has been sent.",
    };
  }

  const user = userResult.rows[0];

  // Generate OTP
  const otp = generateOtp();

  // Hash OTP before storing
  const otpHash = hashOtp(otp);

  // OTP expires after 10 minutes
  const expiresAt = new Date(
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
  );

  // Invalidate any previous unused OTPs
  await pool.query(
    `
    UPDATE password_reset_otps
    SET used_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
      AND used_at IS NULL
    `,
    [user.id]
  );

  // Store the new OTP hash
  await pool.query(
    `
    INSERT INTO password_reset_otps (
      user_id,
      otp_hash,
      expires_at
    )
    VALUES ($1, $2, $3)
    `,
    [user.id, otpHash, expiresAt]
  );

  // Send OTP to registered email
  await sendEmail({
    to: user.email,
    subject: "ScholarHub Password Reset OTP",
    text: `Your ScholarHub password reset OTP is ${otp}. This OTP will expire in ${OTP_EXPIRY_MINUTES} minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>ScholarHub Password Reset</h2>

        <p>Hello ${user.name || "Student"},</p>

        <p>
          We received a request to reset your ScholarHub password.
        </p>

        <p>Your OTP is:</p>

        <div
          style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            padding: 15px;
            background: #f1f5f9;
            text-align: center;
            border-radius: 10px;
          "
        >
          ${otp}
        </div>

        <p>
          This OTP will expire in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.
        </p>

        <p>
          If you did not request a password reset, you can safely ignore this email.
        </p>

        <p>
          — ScholarHub Team
        </p>
      </div>
    `,
  });

  return {
    success: true,
    message: "If an account exists with this email, an OTP has been sent.",
  };
}

// --------------------------------------------------
// Verify OTP
// --------------------------------------------------

export async function verifyPasswordResetOtp(email, otp) {
  const normalizedEmail = email.trim().toLowerCase();

  const userResult = await pool.query(
    `
    SELECT id
    FROM users
    WHERE LOWER(email) = $1
    LIMIT 1
    `,
    [normalizedEmail]
  );

  if (userResult.rows.length === 0) {
    return {
      success: false,
      message: "Invalid or expired OTP.",
    };
  }

  const userId = userResult.rows[0].id;

  // Get latest unused OTP
  const otpResult = await pool.query(
    `
    SELECT id, otp_hash, expires_at, attempts
    FROM password_reset_otps
    WHERE user_id = $1
      AND used_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [userId]
  );

  if (otpResult.rows.length === 0) {
    return {
      success: false,
      message: "Invalid or expired OTP.",
    };
  }

  const resetOtp = otpResult.rows[0];

  // Check expiry
  if (new Date(resetOtp.expires_at) < new Date()) {
    return {
      success: false,
      message: "Invalid or expired OTP.",
    };
  }

  // Limit incorrect attempts
  if (resetOtp.attempts >= 5) {
    return {
      success: false,
      message: "Too many incorrect attempts. Please request a new OTP.",
    };
  }

  const submittedOtpHash = hashOtp(otp);

  const hashBufferA = Buffer.from(submittedOtpHash, "hex");
  const hashBufferB = Buffer.from(resetOtp.otp_hash, "hex");

  const isHashEqual =
    hashBufferA.length === hashBufferB.length &&
    crypto.timingSafeEqual(hashBufferA, hashBufferB);

  // Check OTP
  if (!isHashEqual) {
    await pool.query(
      `
      UPDATE password_reset_otps
      SET attempts = attempts + 1
      WHERE id = $1
      `,
      [resetOtp.id]
    );

    return {
      success: false,
      message: "Invalid or expired OTP.",
    };
  }

  return {
    success: true,
    userId,
    otpId: resetOtp.id,
  };
}

// --------------------------------------------------
// Mark OTP as used
// --------------------------------------------------

export async function markOtpAsUsed(otpId) {
  await pool.query(
    `
    UPDATE password_reset_otps
    SET used_at = CURRENT_TIMESTAMP
    WHERE id = $1
    `,
    [otpId]
  );
}