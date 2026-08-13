import pool, { testDatabaseConnection, initializeDatabase } from "../config/db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { requestPasswordResetOtp, verifyPasswordResetOtp, markOtpAsUsed } from "../services/otpService.js";

async function runTests() {
  console.log("=== Starting ScholarHub Security & OTP Integration Tests ===");

  try {
    await testDatabaseConnection();
    await initializeDatabase();

    const testEmail = `test_user_${Date.now()}@example.com`;
    const originalPassword = "OriginalPassword123!";
    const newPassword = "NewSecurePassword456!";
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(originalPassword, saltRounds);

    console.log(`\n1. Creating test user (${testEmail})...`);
    const userRes = await pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email`,
      ["Test User", testEmail, passwordHash, "Student"]
    );
    const userId = userRes.rows[0].id;
    console.log(`✅ Test user created with ID: ${userId}`);

    // 2. Request OTP
    console.log("\n2. Requesting Password Reset OTP...");
    const forgotRes = await requestPasswordResetOtp(testEmail);
    console.log("Request OTP response:", forgotRes);

    // Fetch the OTP hash directly from DB to verify it was stored
    const otpDbRes = await pool.query(
      `SELECT id, otp_hash, attempts FROM password_reset_otps WHERE user_id = $1 AND used_at IS NULL ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (otpDbRes.rows.length === 0) {
      throw new Error("Failed to store OTP in database.");
    }
    const otpRecord = otpDbRes.rows[0];
    console.log(`✅ OTP stored in DB. Record ID: ${otpRecord.id}`);

    // 3. Test Invalid OTP
    console.log("\n3. Testing verification with invalid 6-digit OTP...");
    const invalidVerif = await verifyPasswordResetOtp(testEmail, "000000");
    console.log(`Result (should fail):`, invalidVerif);
    if (invalidVerif.success) {
      throw new Error("Invalid OTP should not pass verification!");
    }
    console.log("✅ Invalid OTP properly rejected.");

    // Check attempt counter
    const attemptsRes = await pool.query(
      `SELECT attempts FROM password_reset_otps WHERE id = $1`,
      [otpRecord.id]
    );
    console.log(`Attempts recorded in DB: ${attemptsRes.rows[0].attempts}`);
    if (attemptsRes.rows[0].attempts !== 1) {
      throw new Error("Attempts counter was not incremented!");
    }
    console.log("✅ Attempt counter correctly incremented.");

    // 4. Test Lockout after 5 failed attempts
    console.log("\n4. Simulating max failed attempts (reaching 5 attempts)...");
    await pool.query(`UPDATE password_reset_otps SET attempts = 5 WHERE id = $1`, [otpRecord.id]);
    const lockedVerif = await verifyPasswordResetOtp(testEmail, "123456");
    console.log("Result (should be locked out):", lockedVerif);
    if (lockedVerif.message !== "Too many incorrect attempts. Please request a new OTP.") {
      throw new Error("Account lockout after 5 attempts failed!");
    }
    console.log("✅ Max failed attempts lockout enforced.");

    // 5. Generate a new valid OTP for password reset
    console.log("\n5. Requesting a fresh OTP...");
    await requestPasswordResetOtp(testEmail);

    // Retrieve raw OTP from recent DB entry by matching the hash against 100,000..999,999
    const freshOtpRes = await pool.query(
      `SELECT id, otp_hash FROM password_reset_otps WHERE user_id = $1 AND used_at IS NULL ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    const freshOtpId = freshOtpRes.rows[0].id;
    const freshOtpHash = freshOtpRes.rows[0].otp_hash;

    // Find matching OTP value
    let validOtpValue = null;
    for (let i = 100000; i <= 999999; i++) {
      const h = crypto.createHash("sha256").update(i.toString()).digest("hex");
      if (h === freshOtpHash) {
        validOtpValue = i.toString();
        break;
      }
    }
    console.log(`Discovered valid test OTP: ${validOtpValue}`);

    // 6. Test Valid OTP verification
    console.log("\n6. Testing valid OTP verification...");
    const validVerif = await verifyPasswordResetOtp(testEmail, validOtpValue);
    console.log("Result:", validVerif);
    if (!validVerif.success) {
      throw new Error("Valid OTP verification failed!");
    }
    console.log("✅ Valid OTP verified successfully.");

    // 7. Reset Password
    console.log("\n7. Executing password reset...");
    const newHash = await bcrypt.hash(newPassword, saltRounds);
    await pool.query(
      `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [newHash, userId]
    );
    await markOtpAsUsed(freshOtpId);
    console.log("✅ Password reset & OTP marked as used.");

    // 8. Test OTP Replay Attack (attempting to verify used OTP again)
    console.log("\n8. Testing OTP replay attack (using already-used OTP)...");
    const replayVerif = await verifyPasswordResetOtp(testEmail, validOtpValue);
    console.log("Result (should fail):", replayVerif);
    if (replayVerif.success) {
      throw new Error("Used OTP should not be reusable!");
    }
    console.log("✅ OTP single-use protection verified.");

    // 9. Test Login with old vs new password
    console.log("\n9. Verifying password updates in user record...");
    const dbUserRes = await pool.query(`SELECT password_hash FROM users WHERE id = $1`, [userId]);
    const currentHash = dbUserRes.rows[0].password_hash;

    const oldMatch = await bcrypt.compare(originalPassword, currentHash);
    const newMatch = await bcrypt.compare(newPassword, currentHash);

    console.log(`Old password matches: ${oldMatch} (should be false)`);
    console.log(`New password matches: ${newMatch} (should be true)`);

    if (oldMatch || !newMatch) {
      throw new Error("Password update verification failed!");
    }
    console.log("✅ Password change successfully verified.");

    // Cleanup test user
    console.log("\n10. Cleaning up test data...");
    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
    console.log("✅ Test user cleaned up.");

    console.log("\n🎉 ALL OTP AND SECURITY TESTS PASSED SUCCESSFULLY! 🎉");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runTests();
