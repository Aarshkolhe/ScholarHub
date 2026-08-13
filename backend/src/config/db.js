import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "scholarhub",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  max: Number(process.env.DB_POOL_MAX || 20),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

// --------------------------------------------------
// Test Database Connection
// --------------------------------------------------

export async function testDatabaseConnection() {
  const client = await pool.connect();

  try {
    await client.query("SELECT 1");
    console.log("PostgreSQL connected successfully.");
  } finally {
    client.release();
  }
}

// --------------------------------------------------
// Initialize Database
// --------------------------------------------------

export async function initializeDatabase() {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    -- ------------------------------------------------
    -- Users
    -- ------------------------------------------------

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(120) NOT NULL,
      email VARCHAR(320) NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'Student'
        CHECK (role IN ('Student', 'Admin')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx
      ON users (LOWER(email));

    -- ------------------------------------------------
    -- Password Reset OTPs
    -- ------------------------------------------------

    CREATE TABLE IF NOT EXISTS password_reset_otps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

      otp_hash TEXT NOT NULL,

      expires_at TIMESTAMPTZ NOT NULL,

      used_at TIMESTAMPTZ,

      attempts INTEGER NOT NULL DEFAULT 0,

      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Helps us quickly find active OTP records.
    CREATE INDEX IF NOT EXISTS password_reset_otps_user_idx
      ON password_reset_otps (user_id);

    CREATE INDEX IF NOT EXISTS password_reset_otps_active_idx
      ON password_reset_otps (user_id, expires_at)
      WHERE used_at IS NULL;
  `);

  console.log("PostgreSQL users table is ready.");
  console.log("PostgreSQL password reset OTP table is ready.");
}

// --------------------------------------------------
// Close Database
// --------------------------------------------------

export async function closeDatabase() {
  await pool.end();
  console.log("PostgreSQL connection pool closed.");
}

export default pool;