import pool from "../config/db.js";

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function isValidUUID(id) {
  return typeof id === "string" && UUID_REGEX.test(id);
}

// 1. Get All Scholarships from PostgreSQL (Phase 5 & 6)
export async function getScholarships(req, res) {
  try {
    const result = await pool.query(
      `SELECT
        s.id, s.name, s.deadline, s.days_left AS "daysLeft", s.amount,
        s.amount_formatted AS "amountFormatted", s.match_score AS "match",
        s.category, s.degree, s.stream, s.provider, s.portal_url AS "portalUrl",
        s.is_govt AS "isGovt", s.min_score AS "minScore",
        s.description, s.requirements, s.portal_id AS "portalId",
        p.id AS "p_id", p.name AS "p_name", p.description AS "p_description",
        p.url AS "p_url", p.logo_url AS "p_logo_url", p.is_active AS "p_is_active"
       FROM scholarships s
       LEFT JOIN scholarship_portals p ON p.id = s.portal_id
       ORDER BY s.is_govt DESC, s.match_score DESC`
    );

    const formattedScholarships = result.rows.map((row) => {
      const portal = row.p_id
        ? {
            id: row.p_id,
            name: row.p_name,
            description: row.p_description,
            url: row.p_url,
            logoUrl: row.p_logo_url,
            isActive: row.p_is_active,
          }
        : null;

      // Clean up raw join helper attributes
      delete row.p_id;
      delete row.p_name;
      delete row.p_description;
      delete row.p_url;
      delete row.p_logo_url;
      delete row.p_is_active;

      return {
        ...row,
        portal,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedScholarships.length,
      scholarships: formattedScholarships,
    });
  } catch (error) {
    console.error("Error fetching scholarships from DB:", error);
    return res.status(500).json({ success: false, message: "Database query error" });
  }
}

// 2. Submit Scholarship Application to PostgreSQL
export async function applyScholarship(req, res) {
  const targetUserId = req.user?.id || req.body?.userId;

  if (!targetUserId) {
    return res.status(401).json({
      success: false,
      error: { code: "AUTH_REQUIRED", message: "Authentication is required to apply." }
    });
  }

  if (!isValidUUID(targetUserId)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid user ID format." }
    });
  }

  const { scholarshipId, applicantName, courseName, course, gpaScore, statement } = req.body;

  if (!scholarshipId) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "scholarshipId is required" }
    });
  }

  try {
    const finalCourse = courseName || course || null;
    const finalApplicantName = applicantName || req.user?.name || "Student";

    const result = await pool.query(
      `INSERT INTO user_scholarship_applications (
        user_id, scholarship_id, applicant_name, course_name, gpa_score, statement
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, created_at`,
      [targetUserId, scholarshipId, finalApplicantName, finalCourse, gpaScore || null, statement || null]
    );

    return res.status(200).json({
      success: true,
      message: "Application successfully submitted and saved to PostgreSQL!",
      applicationId: result.rows[0].id,
    });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_REFERENCE", message: "Invalid scholarship or user reference." }
      });
    }
    console.error("Error saving application to DB:", error);
    return res.status(500).json({ success: false, message: "Failed to save application to DB" });
  }
}

// 3. Save / Bookmark Scholarship in PostgreSQL
export async function bookmarkScholarship(req, res) {
  const targetUserId = req.user?.id || req.body?.userId;

  if (!targetUserId) {
    return res.status(401).json({
      success: false,
      error: { code: "AUTH_REQUIRED", message: "Authentication is required to bookmark." }
    });
  }

  if (!isValidUUID(targetUserId)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid user ID format." }
    });
  }

  const { scholarshipId } = req.body;

  if (!scholarshipId) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "scholarshipId is required" }
    });
  }

  try {
    await pool.query(
      `INSERT INTO user_saved_scholarships (user_id, scholarship_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, scholarship_id) DO NOTHING`,
      [targetUserId, scholarshipId]
    );

    return res.status(200).json({
      success: true,
      message: "Scholarship bookmarked in PostgreSQL!",
    });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_REFERENCE", message: "Invalid scholarship or user reference." }
      });
    }
    console.error("Error bookmarking scholarship:", error);
    return res.status(500).json({ success: false, message: "Failed to bookmark scholarship" });
  }
}

// 4. Remove / Unbookmark Scholarship in PostgreSQL
export async function unbookmarkScholarship(req, res) {
  const targetUserId = req.user?.id || req.body?.userId || req.query?.userId;

  if (!targetUserId) {
    return res.status(401).json({
      success: false,
      error: { code: "AUTH_REQUIRED", message: "Authentication is required." }
    });
  }

  if (!isValidUUID(targetUserId)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid user ID format." }
    });
  }

  const scholarshipId = req.body?.scholarshipId || req.query?.scholarshipId;

  if (!scholarshipId) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "scholarshipId is required" }
    });
  }

  try {
    await pool.query(
      `DELETE FROM user_saved_scholarships
       WHERE user_id = $1 AND scholarship_id = $2`,
      [targetUserId, scholarshipId]
    );

    return res.status(200).json({
      success: true,
      message: "Scholarship bookmark removed from PostgreSQL!",
    });
  } catch (error) {
    console.error("Error unbookmarking scholarship:", error);
    return res.status(500).json({ success: false, message: "Failed to remove bookmark" });
  }
}

// 5. Get Saved Scholarship IDs for Authenticated User
export async function getSavedScholarships(req, res) {
  const targetUserId = req.user?.id || req.query?.userId;

  if (!targetUserId) {
    return res.status(401).json({
      success: false,
      error: { code: "AUTH_REQUIRED", message: "Authentication is required." }
    });
  }

  if (!isValidUUID(targetUserId)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid user ID format." }
    });
  }

  try {
    const result = await pool.query(
      `SELECT scholarship_id FROM user_saved_scholarships WHERE user_id = $1 ORDER BY created_at DESC`,
      [targetUserId]
    );

    return res.status(200).json({
      success: true,
      savedIds: result.rows.map((r) => r.scholarship_id),
    });
  } catch (error) {
    console.error("Error fetching saved scholarships:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch saved scholarships" });
  }
}

// 6. Get Submitted Applications for Authenticated User
export async function getUserApplications(req, res) {
  const targetUserId = req.user?.id || req.query?.userId;

  if (!targetUserId) {
    return res.status(401).json({
      success: false,
      error: { code: "AUTH_REQUIRED", message: "Authentication is required." }
    });
  }

  if (!isValidUUID(targetUserId)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid user ID format." }
    });
  }

  try {
    const result = await pool.query(
      `SELECT
        id,
        scholarship_id AS "scholarshipId",
        applicant_name AS "applicantName",
        course_name AS "courseName",
        gpa_score AS "gpaScore",
        statement,
        status,
        created_at AS "createdAt"
       FROM user_scholarship_applications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [targetUserId]
    );

    return res.status(200).json({
      success: true,
      applications: result.rows,
      appliedIds: result.rows.map((r) => r.scholarshipId),
    });
  } catch (error) {
    console.error("Error fetching user applications:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch applications" });
  }
}
