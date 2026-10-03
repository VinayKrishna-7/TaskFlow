import nodemailer from 'nodemailer';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: Number(process.env.SMTP_PORT) || 2525,
    auth: {
      user: process.env.SMTP_USER || 'mock_user',
      pass: process.env.SMTP_PASSWORD || 'mock_pass',
    },
  });

  static async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const isRealSmtp = process.env.SMTP_USER && process.env.SMTP_USER !== 'mock_user' && process.env.NODE_ENV !== 'test';
      
      console.log(`\n======================================================`);
      console.log(`📧 [EMAIL NOTIFICATION]`);
      console.log(`📬 To: ${to}`);
      console.log(`📌 Subject: ${subject}`);

      if (isRealSmtp) {
        const info = await this.transporter.sendMail({
          from: process.env.EMAIL_FROM || 'TaskFlow <no-reply@taskflow.dev>',
          to,
          subject,
          html,
        });
        console.log(`✅ Status: Sent via SMTP (Message ID: ${info.messageId})`);
        console.log(`======================================================\n`);
        return true;
      }

      console.log(`ℹ️ Status: Simulated delivery (Dev/Local mode)`);
      console.log(`💡 Configure SMTP credentials in server/.env for real external mailbox delivery`);
      console.log(`======================================================\n`);
      return true;
    } catch (err) {
      console.warn('⚠️ Could not dispatch SMTP email:', err);
      return false;
    }
  }

  static async sendPasswordResetEmail(userEmail: string, userName: string, resetToken: string): Promise<boolean> {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(userEmail)}`;

    console.log(`\n🔐 ======================================================`);
    console.log(`🔑 [PASSWORD RESET REQUEST]`);
    console.log(`👤 User: ${userName} (${userEmail})`);
    console.log(`🔗 Direct Reset Link: ${resetUrl}`);
    console.log(`🎫 Reset Token: ${resetToken}`);
    console.log(`======================================================\n`);

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
        <div style="margin-bottom: 24px;">
          <h2 style="color: #800020; margin: 0 0 8px 0; font-size: 22px; font-weight: 700;">TaskFlow — Password Reset Request</h2>
          <p style="color: #64748b; font-size: 14px; margin: 0;">Secure project and workspace account recovery</p>
        </div>

        <p style="font-size: 15px; line-height: 1.6;">Hello <strong>${userName}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
          We received a request to reset the password for your TaskFlow account (<strong>${userEmail}</strong>).
          Click the button below to set a new password:
        </p>

        <div style="margin: 28px 0; text-align: center;">
          <a href="${resetUrl}" style="background-color: #800020; color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block;">
            Reset My Password
          </a>
        </div>

        <div style="padding: 16px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #64748b; margin: 0 0 6px 0;">Alternatively, copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #2563eb; word-break: break-all; margin: 0;">
            <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a>
          </p>
          <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #cbd5e1;">
            <span style="font-size: 12px; color: #64748b;">Or enter this reset token manually: </span>
            <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: 600;">${resetToken}</code>
          </div>
        </div>

        <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0;">
          This reset link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `;

    return this.sendEmail(userEmail, 'TaskFlow — Reset Your Password', html);
  }

  static async sendTaskAssignedEmail(userEmail: string, userName: string, taskTitle: string, projectName: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #059669;">TaskFlow - New Task Assignment</h2>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>You have been assigned to task: <strong>${taskTitle}</strong> in project <strong>${projectName}</strong>.</p>
        <p>Log in to your TaskFlow dashboard to view task details and track progress.</p>
      </div>
    `;
    return this.sendEmail(userEmail, `Task Assigned: ${taskTitle}`, html);
  }
}