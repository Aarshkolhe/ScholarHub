import pool from "../config/db.js";
import { logAudit } from "../utils/auditLogger.js";
import { sendDeadlineAlertEmail } from "../services/emailService.js";

// 1. Get In-App Notifications for Current Authenticated User
export async function getUserNotifications(req, res) {
  try {
    const userId = req.user.id;

    const listRes = await pool.query(
      `
        SELECT 
          un.id AS "userNotificationId",
          un.is_read AS "isRead",
          un.read_at AS "readAt",
          n.id AS "notificationId",
          n.title,
          n.message,
          n.type,
          n.scholarship_id AS "scholarshipId",
          n.created_at AS "createdAt"
        FROM user_notifications un
        JOIN notifications n ON un.notification_id = n.id
        WHERE un.user_id = $1
        ORDER BY n.created_at DESC
        LIMIT 50
      `,
      [userId]
    );

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM user_notifications WHERE user_id = $1 AND is_read = false`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      unreadCount: parseInt(countRes.rows[0].count, 10),
      notifications: listRes.rows,
    });
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
}

// 2. Mark Single Notification as Read
export async function markNotificationAsRead(req, res) {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    await pool.query(
      `
        UPDATE user_notifications
        SET is_read = true, read_at = CURRENT_TIMESTAMP
        WHERE (id = $1 OR notification_id = $1) AND user_id = $2
      `,
      [notificationId, userId]
    );

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
    });
  } catch (error) {
    console.error("Error marking notification read:", error);
    return res.status(500).json({ success: false, message: "Failed to update notification" });
  }
}

// 3. Mark All Notifications as Read for User
export async function markAllNotificationsAsRead(req, res) {
  try {
    const userId = req.user.id;

    await pool.query(
      `
        UPDATE user_notifications
        SET is_read = true, read_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND is_read = false
      `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("Error marking all notifications read:", error);
    return res.status(500).json({ success: false, message: "Failed to mark notifications read" });
  }
}

// 4. Preview Notification Recipient Count (Admin Only)
export async function previewNotificationRecipients(req, res) {
  try {
    const { category, state, qualification } = req.body || {};

    let queryText = `
      SELECT COUNT(DISTINCT u.id)
      FROM users u
      LEFT JOIN student_profiles p ON u.id = p.user_id
      WHERE u.status = 'active'
    `;
    const queryParams = [];

    if (category && category !== "all") {
      queryParams.push(category);
      queryText += ` AND LOWER(p.category) = LOWER($${queryParams.length})`;
    }

    if (state && state !== "all") {
      queryParams.push(state);
      queryText += ` AND LOWER(p.domicile_state) = LOWER($${queryParams.length})`;
    }

    if (qualification && qualification !== "all") {
      queryParams.push(qualification);
      queryText += ` AND (LOWER(p.qualification) LIKE LOWER('%' || $${queryParams.length} || '%') OR LOWER(p.current_course) LIKE LOWER('%' || $${queryParams.length} || '%'))`;
    }

    const result = await pool.query(queryText, queryParams);

    return res.status(200).json({
      success: true,
      count: parseInt(result.rows[0].count, 10),
    });
  } catch (error) {
    console.error("Error calculating notification recipients preview:", error);
    return res.status(500).json({ success: false, message: "Failed to preview recipients" });
  }
}

// 5. Send Notification Asynchronously (Admin Only)
export async function sendAdminNotification(req, res) {
  const { title, message, type, scholarshipId, filters } = req.body || {};

  if (!title || !message) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Title and message are required." },
    });
  }

  const validTypes = ["new_scholarship", "deadline_reminder", "announcement"];
  const notifType = validTypes.includes(type) ? type : "announcement";

  // Asynchronous Non-Blocking Execution
  setImmediate(async () => {
    try {
      // 1. Create base notification record
      const notifRes = await pool.query(
        `
          INSERT INTO notifications (title, message, type, scholarship_id, created_by)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `,
        [title.trim(), message.trim(), notifType, scholarshipId || null, req.user.id]
      );

      const notificationId = notifRes.rows[0].id;

      // 2. Query target users matching filters
      const { category, state, qualification } = filters || {};
      let queryText = `
        SELECT DISTINCT u.id
        FROM users u
        LEFT JOIN student_profiles p ON u.id = p.user_id
        WHERE u.status = 'active'
      `;
      const queryParams = [];

      if (category && category !== "all") {
        queryParams.push(category);
        queryText += ` AND LOWER(p.category) = LOWER($${queryParams.length})`;
      }

      if (state && state !== "all") {
        queryParams.push(state);
        queryText += ` AND LOWER(p.domicile_state) = LOWER($${queryParams.length})`;
      }

      if (qualification && qualification !== "all") {
        queryParams.push(qualification);
        queryText += ` AND (LOWER(p.qualification) LIKE LOWER('%' || $${queryParams.length} || '%') OR LOWER(p.current_course) LIKE LOWER('%' || $${queryParams.length} || '%'))`;
      }

      const usersRes = await pool.query(queryText, queryParams);
      const targetUsers = usersRes.rows;

      // 3. Batch insert user_notifications (Do not duplicate - Rule 4)
      for (const target of targetUsers) {
        await pool.query(
          `
            INSERT INTO user_notifications (user_id, notification_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, notification_id) DO NOTHING
          `,
          [target.id, notificationId]
        );
      }

      // 4. Log in audit_log
      await logAudit({
        actorId: req.user.id,
        action: "SEND_NOTIFICATION",
        details: {
          title,
          type: notifType,
          scholarshipId: scholarshipId || null,
          recipientCount: targetUsers.length,
        },
      });

      console.log(`Notification '${title}' sent to ${targetUsers.length} user(s).`);
    } catch (err) {
      console.error("Background notification processing error:", err);
    }
  });

  return res.status(200).json({
    success: true,
    message: "Notification has been queued for asynchronous delivery.",
  });
}

// 6. Get Admin Notification History
export async function getNotificationHistory(req, res) {
  try {
    const result = await pool.query(`
      SELECT 
        n.id,
        n.title,
        n.message,
        n.type,
        n.scholarship_id AS "scholarshipId",
        n.created_at AS "createdAt",
        c.name AS "createdByName",
        c.email AS "createdByEmail",
        COUNT(un.id)::int AS "recipientCount"
      FROM notifications n
      LEFT JOIN users c ON n.created_by = c.id
      LEFT JOIN user_notifications un ON un.notification_id = n.id
      GROUP BY n.id, c.name, c.email
      ORDER BY n.created_at DESC
      LIMIT 100
    `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      history: result.rows,
    });
  } catch (error) {
    console.error("Error fetching notification history:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch notification history" });
  }
}

// 7. Legacy Email Deadline Alert
export async function sendDeadlineAlert(req, res) {
  const { email, studentName, scholarshipName, deadline, daysLeft, amount, portalUrl } = req.body;

  if (!email || !scholarshipName) {
    return res.status(400).json({
      success: false,
      message: "Recipient email and scholarshipName are required.",
    });
  }

  try {
    const info = await sendDeadlineAlertEmail({
      to: email,
      studentName: studentName || "Student",
      scholarshipName,
      deadline: deadline || "31 Oct 2026",
      daysLeft: daysLeft || 5,
      amount: amount || "₹50,000 / Year",
      portalUrl: portalUrl || "https://scholarhub.edu",
    });

    return res.status(200).json({
      success: true,
      message: `Deadline alert email successfully sent to ${email}`,
      messageId: info?.messageId,
    });
  } catch (error) {
    console.error("Error sending deadline email alert:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send email alert. Please check SMTP credentials.",
      error: error.message,
    });
  }
}
