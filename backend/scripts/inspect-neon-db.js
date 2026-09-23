import pool from "../src/config/db.js";

async function inspectNeon() {
  try {
    const tablesRes = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log("\n✅ LIVE TABLES IN YOUR NEON DATABASE:");
    console.log(tablesRes.rows.map((r) => `  - ${r.table_name}`).join("\n"));

    const scholarshipsRes = await pool.query(
      "SELECT id, name, amount_formatted, category FROM scholarships LIMIT 5"
    );
    console.log("\n🎓 SAMPLE SCHOLARSHIP RECORDS STORED IN NEON:");
    console.table(scholarshipsRes.rows);
  } catch (err) {
    console.error("Error inspecting Neon DB:", err);
  } finally {
    await pool.end();
  }
}

inspectNeon();
