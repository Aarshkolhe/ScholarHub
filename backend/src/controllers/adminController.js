import pool from "../config/db.js";
import { getUserRole } from "../utils/roleUtils.js";
import { logAudit } from "../utils/auditLogger.js";

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function isValidUUID(id) {
  return typeof id === "string" && UUID_REGEX.test(id);
}

// 1. Get Admin System Stats (Dashboard)
export async function getAdminStats(req, res) {
  try {
    const totalUsersRes = await pool.query(`SELECT COUNT(*) FROM users`);
    const blockedUsersRes = await pool.query(`SELECT COUNT(*) FROM users WHERE status = 'blocked'`);
    const notificationsCountRes = await pool.query(`SELECT COUNT(*) FROM notifications`);

    // Fetch all users to compute effective admin count (including SUPER_ADMIN_EMAILS)
    const allUsersRes = await pool.query(`SELECT id, email, role FROM users`);
    let adminsCount = 0;
    for (const u of allUsersRes.rows) {
      const effRole = getUserRole(u);
      if (effRole === "admin" || effRole === "super_admin") {
        adminsCount++;
      }
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers: parseInt(totalUsersRes.rows[0].count, 10),
        blockedUsers: parseInt(blockedUsersRes.rows[0].count, 10),
        adminsCount,
        notificationsSent: parseInt(notificationsCountRes.rows[0].count, 10),
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch admin stats" });
  }
}

// 2. Get User List (Admin Only with search & role/status filters)
export async function getAdminUsers(req, res) {
  try {
    const q = (req.query.q || "").trim().toLowerCase();
    const roleFilter = (req.query.role || "all").toLowerCase();
    const statusFilter = (req.query.status || "all").toLowerCase();

    let queryText = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        u.status, 
        u.blocked_at AS "blockedAt",
        u.block_reason AS "blockReason",
        u.created_at AS "createdAt",
        b.name AS "blockedByName"
      FROM users u
      LEFT JOIN users b ON u.blocked_by = b.id
    `;
    let queryParams = [];

    if (q) {
      queryText += ` WHERE (LOWER(u.name) LIKE $1 OR LOWER(u.email) LIKE $1)`;
      queryParams.push(`%${q}%`);
    }

    queryText += ` ORDER BY u.created_at DESC`;

    const result = await pool.query(queryText, queryParams);

    // Map each user to attach their computed effective role
    let users = result.rows.map((row) => ({
      ...row,
      role: getUserRole(row),
    }));

    if (roleFilter !== "all") {
      users = users.filter((u) => u.role === roleFilter);
    }

    if (statusFilter !== "all") {
      users = users.filter((u) => u.status === statusFilter);
    }

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
}

// 3. Get Single User Full Profile
export async function getUserProfile(req, res) {
  const userId = req.params?.id;

  if (!userId || !isValidUUID(userId)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Valid user ID is required" }
    });
  }

  try {
    const userRes = await pool.query(
      `SELECT id, name, email, role, status, blocked_by, blocked_at, block_reason, is_email_verified, created_at, updated_at 
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userObj = userRes.rows[0];
    userObj.role = getUserRole(userObj);

    if (userObj.blocked_by) {
      try {
        const blockerRes = await pool.query(`SELECT name, email FROM users WHERE id = $1`, [userObj.blocked_by]);
        if (blockerRes.rowCount > 0) {
          userObj.blocked_by_name = blockerRes.rows[0].name;
          userObj.blocked_by_email = blockerRes.rows[0].email;
        }
      } catch (err) {
        console.warn("Could not resolve blocker admin details:", err);
      }
    }

    const profileRes = await pool.query(
      `SELECT * FROM student_profiles WHERE user_id = $1`,
      [userId]
    );

    const docsRes = await pool.query(
      `SELECT id, doc_type, file_name, status, created_at FROM student_documents WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    let applicationsCount = 0;
    let savedCount = 0;
    try {
      const appsRes = await pool.query(
        `SELECT COUNT(*)::int AS count FROM user_scholarship_applications WHERE user_id = $1`,
        [userId]
      );
      applicationsCount = appsRes.rows[0]?.count || 0;
    } catch (_) {}

    try {
      const savedRes = await pool.query(
        `SELECT COUNT(*)::int AS count FROM user_saved_scholarships WHERE user_id = $1`,
        [userId]
      );
      savedCount = savedRes.rows[0]?.count || 0;
    } catch (_) {}

    return res.status(200).json({
      success: true,
      user: userObj,
      profile: profileRes.rows[0] || null,
      documents: docsRes.rows,
      stats: {
        applicationsCount,
        savedCount,
      }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch user profile" });
  }
}

// 4. Block User (Admins can block only regular users; Super Admins cannot be blocked)
export async function blockUser(req, res) {
  const targetUserId = req.params?.id;
  const reason = String(req.body?.reason || "").trim();

  if (!targetUserId || !isValidUUID(targetUserId)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Valid user ID is required" }
    });
  }

  try {
    const targetRes = await pool.query(`SELECT id, email, role, status FROM users WHERE id = $1`, [targetUserId]);
    if (targetRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const targetUser = targetRes.rows[0];
    const targetRole = getUserRole(targetUser);

    // Rule 4: Super Admin cannot be blocked
    if (targetRole === "super_admin") {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Super Admin accounts cannot be blocked." }
      });
    }

    // Rule 2: Admins can block only regular users, never other admins
    if (targetRole === "admin") {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Admins can block only regular users, never other admins." }
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET status = 'blocked', blocked_by = $1, blocked_at = CURRENT_TIMESTAMP, block_reason = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, name, email, status, block_reason`,
      [req.user.id, reason || null, targetUserId]
    );

    // Rule 6: Log block action in audit_log
    await logAudit({
      actorId: req.user.id,
      action: "BLOCK_USER",
      targetUserId,
      details: { reason: reason || "No reason provided", targetEmail: targetUser.email },
    });

    return res.status(200).json({
      success: true,
      message: "User account has been blocked successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error blocking user:", error);
    return res.status(500).json({ success: false, message: "Failed to block user" });
  }
}

// 5. Unblock User
export async function unblockUser(req, res) {
  const targetUserId = req.params?.id;

  if (!targetUserId || !isValidUUID(targetUserId)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Valid user ID is required" }
    });
  }

  try {
    const targetRes = await pool.query(`SELECT id, email, role, status FROM users WHERE id = $1`, [targetUserId]);
    if (targetRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const targetUser = targetRes.rows[0];
    const targetRole = getUserRole(targetUser);

    if (targetRole === "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Only a Super Admin can unblock an Admin account." }
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET status = 'active', blocked_by = NULL, blocked_at = NULL, block_reason = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, name, email, status`,
      [targetUserId]
    );

    // Rule 6: Log unblock action in audit_log
    await logAudit({
      actorId: req.user.id,
      action: "UNBLOCK_USER",
      targetUserId,
      details: { targetEmail: targetUser.email },
    });

    return res.status(200).json({
      success: true,
      message: "User account has been unblocked.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error unblocking user:", error);
    return res.status(500).json({ success: false, message: "Failed to unblock user" });
  }
}

// 6. Promote User to Admin (Super Admin Only - Phase 3 Backend)
export async function promoteUser(req, res) {
  const targetUserId = req.params?.id || req.body?.userId;

  if (!targetUserId || !isValidUUID(targetUserId)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Valid user ID is required" }
    });
  }

  try {
    const targetRes = await pool.query(`SELECT id, email, role FROM users WHERE id = $1`, [targetUserId]);
    if (targetRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const targetUser = targetRes.rows[0];
    const effRole = getUserRole(targetUser);

    if (effRole === "super_admin") {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_ACTION", message: "User is already a Super Admin." }
      });
    }

    const result = await pool.query(
      `UPDATE users SET role = 'admin', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name, email, role`,
      [targetUserId]
    );

    // Rule 6: Log promote action in audit_log
    await logAudit({
      actorId: req.user.id,
      action: "PROMOTE_ADMIN",
      targetUserId,
      details: { targetEmail: targetUser.email },
    });

    return res.status(200).json({
      success: true,
      message: `${targetUser.email} has been promoted to Admin.`,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error promoting user:", error);
    return res.status(500).json({ success: false, message: "Failed to promote user" });
  }
}

// 7. Demote Admin to User (Super Admin Only - Phase 3 Backend)
export async function demoteUser(req, res) {
  const targetUserId = req.params?.id || req.body?.userId;

  if (!targetUserId || !isValidUUID(targetUserId)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Valid user ID is required" }
    });
  }

  try {
    const targetRes = await pool.query(`SELECT id, email, role FROM users WHERE id = $1`, [targetUserId]);
    if (targetRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const targetUser = targetRes.rows[0];
    const effRole = getUserRole(targetUser);

    // Rule 4: Super admin cannot be demoted
    if (effRole === "super_admin") {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Super Admin accounts cannot be demoted or removed." }
      });
    }

    const result = await pool.query(
      `UPDATE users SET role = 'user', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name, email, role`,
      [targetUserId]
    );

    // Rule 6: Log demote action in audit_log
    await logAudit({
      actorId: req.user.id,
      action: "DEMOTE_ADMIN",
      targetUserId,
      details: { targetEmail: targetUser.email },
    });

    return res.status(200).json({
      success: true,
      message: `Admin access removed for ${targetUser.email}.`,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error demoting admin:", error);
    return res.status(500).json({ success: false, message: "Failed to demote admin" });
  }
}

// 8. Get Audit Log Records (Super Admin Only)
export async function getAuditLogs(req, res) {
  try {
    const result = await pool.query(`
      SELECT 
        a.id,
        a.action,
        a.details,
        a.created_at AS "createdAt",
        actor.name AS "actorName",
        actor.email AS "actorEmail",
        target.name AS "targetName",
        target.email AS "targetEmail"
      FROM audit_log a
      LEFT JOIN users actor ON a.actor_id = actor.id
      LEFT JOIN users target ON a.target_user_id = target.id
      ORDER BY a.created_at DESC
      LIMIT 200
    `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      logs: result.rows,
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch audit logs" });
  }
}

// 9. Legacy / Portal & Scholarship CRUD methods (Preserved)
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
      message: "Scholarship created successfully!",
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
      message: "Scholarship updated successfully!",
      scholarship: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating scholarship:", error);
    return res.status(500).json({ success: false, message: "Failed to update scholarship" });
  }
}

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
      message: "Scholarship deleted successfully!",
      deletedId: scholarshipId,
    });
  } catch (error) {
    console.error("Error deleting scholarship:", error);
    return res.status(500).json({ success: false, message: "Failed to delete scholarship" });
  }
}

export async function getAdminPortals(req, res) {
  try {
    const result = await pool.query(`
      SELECT 
        p.id, p.name, p.description, p.url, p.logo_url AS "logoUrl", p.is_active AS "isActive",
        p.created_at AS "createdAt", p.updated_at AS "updatedAt", COUNT(s.id)::int AS "scholarshipsCount"
      FROM scholarship_portals p
      LEFT JOIN scholarships s ON s.portal_id = p.id
      GROUP BY p.id
      ORDER BY p.name ASC
    `);

    return res.status(200).json({ success: true, count: result.rows.length, portals: result.rows });
  } catch (error) {
    console.error("Error fetching scholarship portals:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch portals" });
  }
}

export async function createAdminPortal(req, res) {
  const { name, description, url, logoUrl, isActive } = req.body || {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Portal name is required." } });
  }

  if (!url || typeof url !== "string" || !url.trim().startsWith("http")) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Valid URL is required." } });
  }

  try {
    const result = await pool.query(
      `INSERT INTO scholarship_portals (name, description, url, logo_url, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, url, logo_url AS "logoUrl", is_active AS "isActive", created_at AS "createdAt"`,
      [name.trim(), description || "", url.trim(), logoUrl || "", isActive !== false]
    );

    return res.status(201).json({ success: true, message: "Scholarship portal created successfully!", portal: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ success: false, error: { code: "DUPLICATE_ERROR", message: "A portal with this name already exists." } });
    }
    console.error("Error creating portal:", error);
    return res.status(500).json({ success: false, message: "Failed to create portal" });
  }
}

export async function updateAdminPortal(req, res) {
  const portalId = req.params?.id;
  const { name, description, url, logoUrl, isActive } = req.body || {};

  if (!portalId || !isValidUUID(portalId)) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Valid portal UUID is required." } });
  }

  try {
    const result = await pool.query(
      `UPDATE scholarship_portals
       SET name = COALESCE($1, name), description = COALESCE($2, description), url = COALESCE($3, url),
           logo_url = COALESCE($4, logo_url), is_active = COALESCE($5, is_active), updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, name, description, url, logo_url AS "logoUrl", is_active AS "isActive"`,
      [name ? name.trim() : null, description, url ? url.trim() : null, logoUrl, isActive, portalId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Scholarship portal not found." } });
    }

    return res.status(200).json({ success: true, message: "Scholarship portal updated successfully!", portal: result.rows[0] });
  } catch (error) {
    console.error("Error updating portal:", error);
    return res.status(500).json({ success: false, message: "Failed to update portal" });
  }
}

export async function toggleAdminPortalStatus(req, res) {
  const portalId = req.params?.id;
  const { isActive } = req.body || {};

  if (!portalId || !isValidUUID(portalId)) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Valid portal UUID is required." } });
  }

  try {
    const result = await pool.query(
      `UPDATE scholarship_portals SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, is_active AS "isActive"`,
      [isActive, portalId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Scholarship portal not found." } });
    }

    return res.status(200).json({ success: true, message: "Portal status updated.", portal: result.rows[0] });
  } catch (error) {
    console.error("Error toggling portal status:", error);
    return res.status(500).json({ success: false, message: "Failed to update portal status" });
  }
}

export async function deleteAdminPortal(req, res) {
  const portalId = req.params?.id;

  if (!portalId || !isValidUUID(portalId)) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Valid portal UUID is required." } });
  }

  try {
    const checkRes = await pool.query(`SELECT COUNT(*) FROM scholarships WHERE portal_id = $1`, [portalId]);
    const linkedCount = parseInt(checkRes.rows[0].count, 10);

    if (linkedCount > 0) {
      return res.status(409).json({
        success: false,
        error: { code: "PORTAL_IN_USE", message: `Cannot delete portal because ${linkedCount} scholarship(s) are linked to it.` }
      });
    }

    const delRes = await pool.query(`DELETE FROM scholarship_portals WHERE id = $1 RETURNING id`, [portalId]);

    if (delRes.rowCount === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Scholarship portal not found." } });
    }

    return res.status(200).json({ success: true, message: "Scholarship portal deleted successfully!", deletedId: portalId });
  } catch (error) {
    console.error("Error deleting portal:", error);
    return res.status(500).json({ success: false, message: "Failed to delete portal" });
  }
}
