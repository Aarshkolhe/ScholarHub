import { sendDeadlineAlertEmail } from "../services/emailService.js";

/**
 * Trigger a deadline alert email for a specific scholarship.
 */
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
