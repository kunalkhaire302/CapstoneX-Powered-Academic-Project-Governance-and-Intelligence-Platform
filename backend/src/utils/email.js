const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email using configured SMTP.
 * @param {object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email body (HTML)
 * @param {string} [options.text] - Plain text fallback
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!process.env.SMTP_USER) {
      logger.warn('SMTP not configured — email not sent');
      return { success: false, reason: 'SMTP not configured' };
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@capstonex.com',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error.message);
    return { success: false, reason: error.message };
  }
};

// ──────────────────────────────────────────
// Email Templates
// ──────────────────────────────────────────

const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to CapstoneX!',
    html: `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #D2232A; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-family: 'DM Serif Display', Georgia, serif;">CapstoneX</h1>
        </div>
        <div style="padding: 32px; background: #FFFFFF;">
          <h2 style="color: #231F20;">Welcome, ${name}!</h2>
          <p style="color: #666666; line-height: 1.6;">
            Your account has been created successfully. You can now log in to access your dashboard,
            manage your capstone project, and collaborate with your team.
          </p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login"
             style="display: inline-block; background: #D2232A; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 6px; margin-top: 16px;">
            Go to Dashboard
          </a>
        </div>
        <div style="padding: 16px; background: #F8F9FA; text-align: center; color: #666666; font-size: 12px;">
          © ${new Date().getFullYear()} CapstoneX. All rights reserved.
        </div>
      </div>
    `,
  }),

  passwordReset: (name, resetLink) => ({
    subject: 'Reset Your CapstoneX Password',
    html: `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #D2232A; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-family: 'DM Serif Display', Georgia, serif;">CapstoneX</h1>
        </div>
        <div style="padding: 32px; background: #FFFFFF;">
          <h2 style="color: #231F20;">Password Reset</h2>
          <p style="color: #666666; line-height: 1.6;">
            Hi ${name}, we received a request to reset your password. Click the button below to create a new one.
          </p>
          <a href="${resetLink}"
             style="display: inline-block; background: #D2232A; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 6px; margin-top: 16px;">
            Reset Password
          </a>
          <p style="color: #666666; font-size: 13px; margin-top: 24px;">
            If you didn't request this, please ignore this email. The link expires in 1 hour.
          </p>
        </div>
      </div>
    `,
  }),

  notification: (name, title, body) => ({
    subject: `CapstoneX: ${title}`,
    html: `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #D2232A; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-family: 'DM Serif Display', Georgia, serif;">CapstoneX</h1>
        </div>
        <div style="padding: 32px; background: #FFFFFF;">
          <h2 style="color: #231F20;">${title}</h2>
          <p style="color: #666666; line-height: 1.6;">Hi ${name},</p>
          <p style="color: #666666; line-height: 1.6;">${body}</p>
        </div>
      </div>
    `,
  }),
};

module.exports = { sendEmail, emailTemplates };
