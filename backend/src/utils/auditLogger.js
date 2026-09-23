import pool from "../config/db.js";

/**
 * Helper to record sensitive administrative actions in audit_log.
 * 
 * Rules:
 * Log every block, unblock, promote, demote, and notification send in audit_log.
 */
export async function logAudit({ actorId, action, targetUserId = null, details = null }) {
  try {
    await pool.query(
      `
        INSERT INTO audit_log (actor_id, action, target_user_id, details)
        VALUES ($1, $2, $3, $4)
      `,
      [actorId, action, targetUserId, details ? JSON.stringify(details) : null]
    );
  } catch (error) {
    console.error("Failed to write audit_log entry:", error);
  }
}
