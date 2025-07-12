import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = this.createTransporter();
  }

  private createTransporter(): nodemailer.Transporter {
    const emailConfig: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    // Validate required environment variables
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      throw new Error('SMTP credentials are not configured. Please set SMTP_USER and SMTP_PASS environment variables.');
    }

    return nodemailer.createTransporter(emailConfig);
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'QAMonitorTool'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email. Please try again later.');
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string, userName: string): Promise<void> {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const html = this.generatePasswordResetEmailTemplate(userName, resetUrl);
    const text = this.generatePasswordResetEmailText(userName, resetUrl);

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password - QAMonitorTool',
      html,
      text,
    });
  }

  private generatePasswordResetEmailTemplate(userName: string, resetUrl: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                display: inline-block;
                font-weight: bold;
                font-size: 18px;
                margin-bottom: 20px;
            }
            .title {
                color: #1f2937;
                font-size: 24px;
                font-weight: bold;
                margin: 0;
            }
            .content {
                margin: 30px 0;
            }
            .greeting {
                font-size: 16px;
                margin-bottom: 20px;
            }
            .message {
                font-size: 16px;
                margin-bottom: 30px;
                color: #4b5563;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
                padding: 14px 28px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                text-align: center;
                margin: 20px 0;
                transition: all 0.3s ease;
            }
            .button:hover {
                background: linear-gradient(135deg, #1d4ed8, #1e40af);
                transform: translateY(-1px);
            }
            .security-notice {
                background: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 8px;
                padding: 16px;
                margin: 30px 0;
            }
            .security-notice h4 {
                color: #92400e;
                margin: 0 0 8px 0;
                font-size: 14px;
                font-weight: 600;
            }
            .security-notice p {
                color: #92400e;
                margin: 0;
                font-size: 14px;
            }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }
            .footer a {
                color: #3b82f6;
                text-decoration: none;
            }
            .expiry {
                color: #ef4444;
                font-weight: 600;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🐛 QAMonitorTool</div>
                <h1 class="title">Reset Your Password</h1>
            </div>
            
            <div class="content">
                <p class="greeting">Hello ${userName},</p>
                
                <p class="message">
                    We received a request to reset your password for your QAMonitorTool account. 
                    If you made this request, click the button below to reset your password.
                </p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reset My Password</a>
                </div>
                
                <p class="expiry" style="text-align: center; margin-top: 15px;">
                    ⏰ This link will expire in 1 hour for security reasons.
                </p>
                
                <div class="security-notice">
                    <h4>🔒 Security Notice</h4>
                    <p>
                        If you didn't request a password reset, please ignore this email. 
                        Your password will remain unchanged. For security, this reset link 
                        will expire automatically.
                    </p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    If the button above doesn't work, copy and paste this link into your browser:<br>
                    <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
                </p>
            </div>
            
            <div class="footer">
                <p>
                    This email was sent by QAMonitorTool<br>
                    If you have any questions, please contact our support team.
                </p>
                <p style="margin-top: 15px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}">Visit QAMonitorTool</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generatePasswordResetEmailText(userName: string, resetUrl: string): string {
    return `
Hello ${userName},

We received a request to reset your password for your QAMonitorTool account.

To reset your password, please click on the following link:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

If you have any questions, please contact our support team.

Best regards,
The QAMonitorTool Team

---
This email was sent by QAMonitorTool
Visit us at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
    `;
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
export default EmailService;