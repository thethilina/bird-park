import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Send a password-reset email containing a one-time link.
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const mailOptions = {
    from: `"Bird Park" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Reset your Bird Park password",
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #111; color: #e5e5e5; border-radius: 16px;">
        <h1 style="font-size: 24px; font-weight: 600; color: #DEBE83; margin-bottom: 8px;">Bird Park</h1>
        <p style="font-size: 15px; line-height: 1.6; color: #a3a3a3;">
          We received a request to reset your password. Click the button below to choose a new one.
          This link expires in <strong style="color:#e5e5e5;">1 hour</strong>.
        </p>
        <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 32px; background: #DEBE83; color: #111; font-weight: 600; border-radius: 999px; text-decoration: none; font-size: 15px;">
          Reset Password
        </a>
        <p style="font-size: 13px; color: #737373;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
