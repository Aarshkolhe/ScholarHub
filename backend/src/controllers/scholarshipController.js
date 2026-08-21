import pool from "../config/db.js";

// 1. Get All Scholarships from PostgreSQL
export async function getScholarships(req, res) {
  try {
    const result = await pool.query(
      `SELECT
        id, name, deadline, days_left AS "daysLeft", amount,
        amount_formatted AS "amountFormatted", match_score AS "match",
        category, degree, stream, provider, portal_url AS "portalUrl",
        is_govt AS "isGovt", min_score AS "minScore",
        description, requirements
       FROM scholarships
       ORDER BY is_govt DESC, match_score DESC`
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      scholarships: result.rows,
    });
  } catch (error) {
    console.error("Error fetching scholarships from DB:", error);
    return res.status(500).json({ success: false, message: "Database query error" });
  }
}

// 2. Submit Scholarship Application to PostgreSQL
export async function applyScholarship(req, res) {
  const { userId, scholarshipId, applicantName, courseName, gpaScore, statement } = req.body;

  if (!userId || !scholarshipId) {
    return res.status(400).json({ success: false, message: "userId and scholarshipId are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO user_scholarship_applications (
        user_id, scholarship_id, applicant_name, course_name, gpa_score, statement
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, created_at`,
      [userId, scholarshipId, applicantName || "Student", courseName || null, gpaScore || null, statement || null]
    );

    return res.status(200).json({
      success: true,
      message: "Application successfully submitted and saved to PostgreSQL!",
      applicationId: result.rows[0].id,
    });
  } catch (error) {
    console.error("Error saving application to DB:", error);
    return res.status(500).json({ success: false, message: "Failed to save application to DB" });
  }
}

// 3. Save / Bookmark Scholarship in PostgreSQL
export async function bookmarkScholarship(req, res) {
  const { userId, scholarshipId } = req.body;

  if (!userId || !scholarshipId) {
    return res.status(400).json({ success: false, message: "userId and scholarshipId are required" });
  }

  try {
    await pool.query(
      `INSERT INTO user_saved_scholarships (user_id, scholarship_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, scholarship_id) DO NOTHING`,
      [userId, scholarshipId]
    );

    return res.status(200).json({
      success: true,
      message: "Scholarship bookmarked in PostgreSQL!",
    });
  } catch (error) {
    console.error("Error bookmarking scholarship:", error);
    return res.status(500).json({ success: false, message: "Failed to bookmark scholarship" });
  }
}
