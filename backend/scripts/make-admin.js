import pool from "../src/config/db.js";

async function makeAdmin() {
  try {
    const res = await pool.query(
      "UPDATE users SET role = 'admin' WHERE email = 'aarshkolhe01@gmail.com' RETURNING id, name, email, role, status"
    );
    console.log("✅ USER SUCCESSFULLY PROMOTED TO ADMIN:");
    console.table(res.rows);
  } catch (err) {
    console.error("Error promoting user:", err);
  } finally {
    await pool.end();
  }
}

makeAdmin();
