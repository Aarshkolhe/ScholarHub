import pool from "../config/db.js";

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function isValidUUID(id) {
  return typeof id === "string" && UUID_REGEX.test(id);
}

// 1. Get Admin System Stats
export async function getAdminStats(req, res) {
  try {
    const userCountRes = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'Student'`);
    const scholarshipCountRes = await pool.query(`SELECT COUNT(*) FROM scholarships`);
    const pendingAppCountRes = await pool.query(`SELECT COUNT(*) FROM user_scholarship_applications WHERE status = 'Pending'`);
    const totalAppCountRes = await pool.query(`SELECT COUNT(*) FROM user_scholarship_applications`);

    return res.status(200).json({
      success: true,
      stats: {
        totalApplicants: parseInt(userCountRes.rows[0].count, 10),
        activeScholarships: parseInt(scholarshipCountRes.rows[0].count, 10),
        pendingApprovals: parseInt(pendingAppCountRes.rows[0].count, 10),
        totalApplications: parseInt(totalAppCountRes.rows[0].count, 10),
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch admin stats" });
  }
}

// 2. Get User List (Admin Only)
export async function getAdminUsers(req, res) {
  try {
    const q = (req.query.q || "").trim().toLowerCase();
    let queryText = `SELECT id, name, email, role, created_at AS "createdAt" FROM users`;
    let queryParams = [];

    if (q) {
      queryText += ` WHERE LOWER(name) LIKE $1 OR LOWER(email) LIKE $1`;
      queryParams.push(`%${q}%`);
    }

    queryText += ` ORDER BY created_at DESC LIMIT 100`;

    const result = await pool.query(queryText, queryParams);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      users: result.rows,
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
}

// 3. Update User Role (Admin Only)
export async function updateUserRole(req, res) {
  const targetUserId = req.body?.userId || req.params?.id;
  const role = req.body?.role;

  if (!targetUserId || !isValidUUID(targetUserId)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Valid user ID is required" }
    });
  }

  const ALLOWED_ROLES = ["Student", "Admin"];
  if (!role || typeof role !== "string" || !ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Role must be 'Student' or 'Admin'." }
    });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, email, role`,
      [role, targetUserId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: { code: "USER_NOT_FOUND", message: "User not found" }
      });
    }

    return res.status(200).json({
      success: true,
      message: `User role updated to '${role}'`,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return res.status(500).json({ success: false, message: "Failed to update user role" });
  }
}

// 4. Get Applications List (Admin Only)
export async function getAdminApplications(req, res) {
  try {
    const result = await pool.query(
      `SELECT
        a.id,
        a.user_id AS "userId",
        a.scholarship_id AS "scholarshipId",
        a.applicant_name AS "applicantName",
        a.course_name AS "courseName",
        a.gpa_score AS "gpaScore",
        a.statement,
        a.status,
        a.created_at AS "createdAt",
        u.email AS "applicantEmail",
        s.name AS "scholarshipName"
       FROM user_scholarship_applications a
       JOIN users u ON a.user_id = u.id
       JOIN scholarships s ON a.scholarship_id = s.id
       ORDER BY a.created_at DESC`
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      applications: result.rows,
    });
  } catch (error) {
    console.error("Error fetching admin applications:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch applications" });
  }
}

// 5. Update Application Status (Admin Only)
export async function updateApplicationStatus(req, res) {
  const applicationId = req.params?.id || req.body?.applicationId;
  const status = req.body?.status;

  if (!applicationId || !isValidUUID(applicationId)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Valid application ID is required" }
    });
  }

  const ALLOWED_STATUSES = ["Pending", "Approved", "Rejected", "Submitted"];
  if (!status || typeof status !== "string" || !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Status must be 'Pending', 'Approved', or 'Rejected'." }
    });
  }

  try {
    const result = await pool.query(
      `UPDATE user_scholarship_applications SET status = $1 WHERE id = $2 RETURNING id, status`,
      [status, applicationId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Application not found" }
      });
    }

    return res.status(200).json({
      success: true,
      message: `Application status updated to '${status}'`,
      application: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return res.status(500).json({ success: false, message: "Failed to update application status" });
  }
}

// 6. Create Scholarship (Admin Only)
export async function createScholarship(req, res) {
  const { id, name, deadline, daysLeft, amount, amountFormatted, category, degree, stream, provider, portalUrl, isGovt, minScore, description, requirements } = req.body;

  if (!name || !provider || !amount || !deadline || !category || !degree) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "name, provider, amount, deadline, category, and degree are required" }
    });
  }

  const scholarshipId = id || `custom-${Date.now()}`;
  const parsedAmount = parseFloat(String(amount).replace(/,/g, ""));
  if (isNaN(parsedAmount) || parsedAmount < 0) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Amount must be a non-negative number" }
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO scholarships (
        id, name, deadline, days_left, amount, amount_formatted, match_score, category, degree, stream, provider, portal_url, is_govt, min_score, description, requirements
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        scholarshipId,
        name.trim(),
        deadline.trim(),
        daysLeft ? parseInt(daysLeft, 10) : 30,
        parsedAmount,
        amountFormatted || `₹${parsedAmount.toLocaleString("en-IN")}`,
        90,
        category.trim(),
        degree.trim(),
        stream || "General",
        provider.trim(),
        portalUrl || null,
        Boolean(isGovt),
        minScore ? parseInt(minScore, 10) : 60,
        description ? description.trim() : "Scholarship Opportunity",
        requirements ? requirements.trim() : "Standard Eligibility Criteria",
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Scholarship created successfully in PostgreSQL!",
      scholarship: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        error: { code: "DUPLICATE_ID", message: "A scholarship with this ID already exists." }
      });
    }
    console.error("Error creating scholarship:", error);
    return res.status(500).json({ success: false, message: "Failed to create scholarship" });
  }
}

// 7. Update Scholarship (Admin Only)
export async function updateScholarship(req, res) {
  const scholarshipId = req.params?.id || req.body?.id;
  if (!scholarshipId) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Scholarship ID is required" }
    });
  }

  const { name, deadline, daysLeft, amount, amountFormatted, category, degree, stream, provider, portalUrl, isGovt, minScore, description, requirements } = req.body;

  try {
    const existingRes = await pool.query(`SELECT * FROM scholarships WHERE id = $1`, [scholarshipId]);
    if (existingRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Scholarship not found" }
      });
    }

    const existing = existingRes.rows[0];
    const newName = name !== undefined ? name.trim() : existing.name;
    const newDeadline = deadline !== undefined ? deadline.trim() : existing.deadline;
    const newAmount = amount !== undefined ? parseFloat(String(amount).replace(/,/g, "")) : existing.amount;
    const newProvider = provider !== undefined ? provider.trim() : existing.provider;
    const newCategory = category !== undefined ? category.trim() : existing.category;
    const newDegree = degree !== undefined ? degree.trim() : existing.degree;

    const result = await pool.query(
      `UPDATE scholarships SET
        name = $1, deadline = $2, days_left = $3, amount = $4, amount_formatted = $5,
        category = $6, degree = $7, stream = $8, provider = $9, portal_url = $10,
        is_govt = $11, min_score = $12, description = $13, requirements = $14
       WHERE id = $15
       RETURNING *`,
      [
        newName,
        newDeadline,
        daysLeft !== undefined ? parseInt(daysLeft, 10) : existing.days_left,
        newAmount,
        amountFormatted || `₹${newAmount.toLocaleString("en-IN")}`,
        newCategory,
        newDegree,
        stream !== undefined ? stream : existing.stream,
        newProvider,
        portalUrl !== undefined ? portalUrl : existing.portal_url,
        isGovt !== undefined ? Boolean(isGovt) : existing.is_govt,
        minScore !== undefined ? parseInt(minScore, 10) : existing.min_score,
        description !== undefined ? description : existing.description,
        requirements !== undefined ? requirements : existing.requirements,
        scholarshipId,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Scholarship updated successfully in PostgreSQL!",
      scholarship: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating scholarship:", error);
    return res.status(500).json({ success: false, message: "Failed to update scholarship" });
  }
}

// 8. Delete Scholarship (Admin Only)
export async function deleteScholarship(req, res) {
  const scholarshipId = req.params?.id || req.query?.id || req.body?.id;
  if (!scholarshipId) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Scholarship ID is required" }
    });
  }

  try {
    const result = await pool.query(`DELETE FROM scholarships WHERE id = $1 RETURNING id`, [scholarshipId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Scholarship not found" }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Scholarship deleted successfully from PostgreSQL!",
      deletedId: scholarshipId,
    });
  } catch (error) {
    console.error("Error deleting scholarship:", error);
    return res.status(500).json({ success: false, message: "Failed to delete scholarship" });
  }
}

// 9. Get Admin Scholarship Portals
export async function getAdminPortals(req, res) {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.url,
        p.logo_url AS "logoUrl",
        p.is_active AS "isActive",
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
        COUNT(s.id)::int AS "scholarshipsCount"
      FROM scholarship_portals p
      LEFT JOIN scholarships s ON s.portal_id = p.id
      GROUP BY p.id
      ORDER BY p.name ASC
    `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      portals: result.rows,
    });
  } catch (error) {
    console.error("Error fetching scholarship portals:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch portals" });
  }
}

// 10. Create Scholarship Portal (Admin Only)
export async function createAdminPortal(req, res) {
  const { name, description, url, logoUrl, isActive } = req.body || {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Portal name is required." }
    });
  }

  if (!url || typeof url !== "string" || !url.trim().startsWith("http")) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "A valid URL (http:// or https://) is required." }
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO scholarship_portals (name, description, url, logo_url, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, url, logo_url AS "logoUrl", is_active AS "isActive", created_at AS "createdAt"`,
      [name.trim(), description || "", url.trim(), logoUrl || "", isActive !== false]
    );

    return res.status(201).json({
      success: true,
      message: "Scholarship portal created successfully!",
      portal: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") { // Unique violation
      return res.status(409).json({
        success: false,
        error: { code: "DUPLICATE_ERROR", message: "A portal with this name already exists." }
      });
    }
    console.error("Error creating portal:", error);
    return res.status(500).json({ success: false, message: "Failed to create portal" });
  }
}

// 11. Update Scholarship Portal (Admin Only)
export async function updateAdminPortal(req, res) {
  const portalId = req.params?.id;
  const { name, description, url, logoUrl, isActive } = req.body || {};

  if (!portalId || !isValidUUID(portalId)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Valid portal UUID is required." }
    });
  }

  if (url && (typeof url !== "string" || !url.trim().startsWith("http"))) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Valid portal URL must start with http:// or https://" }
    });
  }

  try {
    const result = await pool.query(
      `UPDATE scholarship_portals
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           url = COALESCE($3, url),
           logo_url = COALESCE($4, logo_url),
           is_active = COALESCE($5, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, name, description, url, logo_url AS "logoUrl", is_active AS "isActive", updated_at AS "updatedAt"`,
      [name ? name.trim() : null, description, url ? url.trim() : null, logoUrl, isActive, portalId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Scholarship portal not found." }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Scholarship portal updated successfully!",
      portal: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating portal:", error);
    return res.status(500).json({ success: false, message: "Failed to update portal" });
  }
}

// 12. Toggle Scholarship Portal Active Status (Admin Only)
export async function toggleAdminPortalStatus(req, res) {
  const portalId = req.params?.id;
  const { isActive } = req.body || {};

  if (!portalId || !isValidUUID(portalId)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Valid portal UUID is required." }
    });
  }

  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "isActive boolean value is required." }
    });
  }

  try {
    const result = await pool.query(
      `UPDATE scholarship_portals
       SET is_active = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, is_active AS "isActive"`,
      [isActive, portalId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Scholarship portal not found." }
      });
    }

    return res.status(200).json({
      success: true,
      message: `Portal status updated to ${isActive ? "Active" : "Disabled"}.`,
      portal: result.rows[0],
    });
  } catch (error) {
    console.error("Error toggling portal status:", error);
    return res.status(500).json({ success: false, message: "Failed to update portal status" });
  }
}

// 13. Delete Scholarship Portal (Admin Only - Phase 4 Safe Delete Rule)
export async function deleteAdminPortal(req, res) {
  const portalId = req.params?.id;

  if (!portalId || !isValidUUID(portalId)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Valid portal UUID is required." }
    });
  }

  try {
    // Check if scholarships currently reference this portal
    const checkRes = await pool.query(`SELECT COUNT(*) FROM scholarships WHERE portal_id = $1`, [portalId]);
    const linkedCount = parseInt(checkRes.rows[0].count, 10);

    if (linkedCount > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: "PORTAL_IN_USE",
          message: `Cannot delete portal because ${linkedCount} scholarship(s) are currently linked to it. Consider disabling the portal instead.`
        }
      });
    }

    const delRes = await pool.query(`DELETE FROM scholarship_portals WHERE id = $1 RETURNING id`, [portalId]);

    if (delRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Scholarship portal not found." }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Scholarship portal deleted successfully!",
      deletedId: portalId,
    });
  } catch (error) {
    console.error("Error deleting portal:", error);
    return res.status(500).json({ success: false, message: "Failed to delete portal" });
  }
}
