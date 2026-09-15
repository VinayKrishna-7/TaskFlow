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
      if (process.env.NODE_ENV === 'test' || !process.env.SMTP_USER || process.env.SMTP_USER === 'mock_user') {
        return true;
      }

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'TaskFlow <no-reply@taskflow.dev>',
        to,
        subject,
        html,
      });
      return true;
    } catch (err) {
      console.warn('Could not send email notification:', err);
      return false;
    }
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