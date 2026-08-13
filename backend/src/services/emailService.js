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
 * Send an email.
 */
export async function sendEmail({ to, subject, text, html }) {
  return transporter.sendMail({
    from: `"ScholarHub" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
}

/**
 * Test Gmail SMTP connection.
 */
export async function testEmailConnection() {
  await transporter.verify();
  console.log("Gmail SMTP connection successful.");
}