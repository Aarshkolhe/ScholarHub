import pool from "../config/db.js";

/**
 * Automated Daily Deadline Reminder Scheduler
 * Runs daily to check for scholarships expiring in 7, 3, or 1 days,
 * and notifies matching active students.
 */

// Helper to send email notification (hook for future nodemailer integration)
export async function sendDeadlineAlertEmail(userEmail, scholarshipName, daysLeft) {
  // Placeholder hook for email integration (e.g., via nodemailer/sendgrid)
  console.log(`[Email Alert Hook] Sending alert to ${userEmail}: ${scholarshipName} closing in ${daysLeft} days.`);
  return true;
}

export async function checkAndSendDeadlineReminders() {
  console.log("[Scheduler] Running daily scholarship deadline reminder check...");

  try {
    // 1. Find scholarships closing in 7, 3, or 1 days
    const scholarshipResult = await pool.query(
      `SELECT id, name, days_left, category, degree, stream 
       FROM scholarships 
       WHERE days_left IN (7, 3, 1)`
    );

    const expiringScholarships = scholarshipResult.rows;

    if (expiringScholarships.length === 0) {
      console.log("[Scheduler] No scholarships closing in 7, 3, or 1 days today.");
      return { status: "success", count: 0 };
    }

    console.log(`[Scheduler] Found ${expiringScholarships.length} expiring scholarship(s).`);

    let totalNotificationsCreated = 0;

    for (const scholarship of expiringScholarships) {
      const daysLeft = scholarship.days_left;
      const title = `Deadline Alert: ${scholarship.name}`;
      const message = `Reminder: Application deadline for "${scholarship.name}" is in ${daysLeft} day${daysLeft > 1 ? "s" : ""}! Apply now before it closes.`;

      // 2. Find eligible active non-blocked users matching category/qualification if set, or all active users
      const usersResult = await pool.query(
        `SELECT DISTINCT u.id, u.email 
         FROM users u
         LEFT JOIN student_profiles sp ON u.id = sp.user_id
         WHERE u.status = 'active' 
           AND u.role = 'user'
           AND (
             sp.id IS NULL OR
             sp.category = $1 OR
             sp.qualification = $2 OR
             $1 = 'General' OR
             $1 = 'Government'
           )`,
        [scholarship.category, scholarship.degree]
      );

      const targetUsers = usersResult.rows;

      if (targetUsers.length === 0) continue;

      // 3. Create or find existing notification record for this scholarship & deadline reminder type
      const notifInsert = await pool.query(
        `INSERT INTO notifications (title, message, type, scholarship_id)
         VALUES ($1, $2, 'deadline_reminder', $3)
         RETURNING id`,
        [title, message, scholarship.id]
      );

      const notificationId = notifInsert.rows[0].id;

      // 4. Batch insert into user_notifications with duplicate suppression
      for (const user of targetUsers) {
        const result = await pool.query(
          `INSERT INTO user_notifications (user_id, notification_id)
           VALUES ($1, $2)
           ON CONFLICT (user_id, notification_id) DO NOTHING
           RETURNING id`,
          [user.id, notificationId]
        );

        if (result.rowCount > 0) {
          totalNotificationsCreated++;
          // Trigger email alert hook async
          sendDeadlineAlertEmail(user.email, scholarship.name, daysLeft).catch((err) =>
            console.error("[Scheduler] Email alert error:", err)
          );
        }
      }
    }

    console.log(`[Scheduler] Deadline check complete. Created ${totalNotificationsCreated} user notification(s).`);
    return { status: "success", count: totalNotificationsCreated };
  } catch (error) {
    console.error("[Scheduler] Error running deadline reminder check:", error);
    return { status: "error", error: error.message };
  }
}

/**
 * Initializes daily background cron schedule (runs once every 24 hours at 08:00 AM, or runs immediately once on startup).
 */
export function initDeadlineScheduler() {
  // Run once on server startup after a brief delay
  setTimeout(() => {
    checkAndSendDeadlineReminders().catch((err) =>
      console.error("[Scheduler] Startup check error:", err)
    );
  }, 10000); // 10 seconds after server launch

  // Schedule to run every 24 hours (86,400,000 ms)
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  setInterval(() => {
    checkAndSendDeadlineReminders().catch((err) =>
      console.error("[Scheduler] Interval check error:", err)
    );
  }, TWENTY_FOUR_HOURS);

  console.log("[Scheduler] Daily scholarship deadline reminder service initialized.");
}
