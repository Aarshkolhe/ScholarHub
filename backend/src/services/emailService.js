import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

/**
 * Send a generic email.
 */
export async function sendEmail({ to, subject, text, html }) {
  return transporter.sendMail({
    from: `"ScholarHub Alerts" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
}

/**
 * Send an Automated Deadline Reminder Email.
 */
export async function sendDeadlineAlertEmail({
  to,
  studentName = "Student",
  scholarshipName,
  deadline,
  daysLeft,
  amount = "Full Tuition / Merit Grant",
  portalUrl = "https://scholarhub.edu",
}) {
  const subject = `⏳ Deadline Reminder: ${scholarshipName} closes in ${daysLeft} days!`;
  
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
      <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 32px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">🎓 ScholarHub</h1>
        <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Scholarship Deadline Alert</p>
      </div>

      <div style="padding: 32px 24px;">
        <p style="font-size: 16px; font-weight: 600; margin-top: 0;">Hello ${studentName},</p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          This is an urgent reminder that the application deadline for <strong>${scholarshipName}</strong> is approaching fast.
        </p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Scholarship:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">${scholarshipName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Award Amount:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #2563eb; text-align: right;">${amount}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Application Deadline:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #dc2626; text-align: right;">${deadline}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Time Remaining:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #d97706; text-align: right;">⏳ ${daysLeft} Days Left</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 32px 0 16px;">
          <a href="${portalUrl}" style="background: #2563eb; color: #ffffff; padding: 14px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
            Apply Before Deadline &rarr;
          </a>
        </div>

        <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; text-align: center; margin-top: 24px;">
          Make sure your income certificate, caste certificate, and academic marks transcripts are uploaded before submission.
        </p>
      </div>

      <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} ScholarHub Portal. You received this email because you opted into deadline notifications.
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject,
    text: `Deadline Alert: ${scholarshipName} closes in ${daysLeft} days (${deadline}). Grant amount: ${amount}. Apply here: ${portalUrl}`,
    html,
  });
}

/**
 * Send an Application Confirmation Email.
 */
export async function sendApplicationConfirmationEmail({
  to,
  studentName = "Student",
  scholarshipName,
  applicationId,
}) {
  const subject = `✅ Application Received: ${scholarshipName}`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
      <div style="background: linear-gradient(135deg, #059669, #0d9488); padding: 32px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800;">🎓 ScholarHub</h1>
        <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Application Confirmation</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="font-size: 16px; font-weight: 600; margin-top: 0;">Hello ${studentName},</p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          Your application for <strong>${scholarshipName}</strong> has been successfully submitted and logged in the ScholarHub database.
        </p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
          <p style="font-size: 12px; color: #166534; margin: 0; font-weight: 600;">Reference Application ID</p>
          <p style="font-size: 18px; font-weight: 800; color: #15803d; margin: 4px 0 0; letter-spacing: 1px;">#${applicationId}</p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject,
    text: `Your application for ${scholarshipName} was submitted. Application ID: #${applicationId}`,
    html,
  });
}

/**
 * Test Gmail SMTP connection.
 */
export async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log("Gmail SMTP connection successful.");
  } catch (error) {
    console.warn("Gmail SMTP verify notice (will deliver on send):", error.message);
  }
}