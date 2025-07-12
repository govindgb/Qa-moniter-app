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
  private isConfigured: boolean = false;

  constructor() {
    console.log('🔧 Initializing EmailService...');
    try {
      this.transporter = this.createTransporter();
      this.isConfigured = true;
      console.log('✅ EmailService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      this.isConfigured = false;
    }
  }

  private createTransporter(): nodemailer.Transporter {
    console.log('🔧 Initializing email transporter...');
    
    // Clean and validate environment variables
    const smtpHost = process.env.SMTP_HOST?.trim();
    const smtpPort = parseInt(process.env.SMTP_PORT?.trim() || '587');
    const smtpSecure = process.env.SMTP_SECURE?.trim() === 'true';
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS?.trim().replace(/['"]/g, ''); // Remove quotes
    
    console.log('📧 Raw environment variables:', {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_SECURE: process.env.SMTP_SECURE,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS_LENGTH: process.env.SMTP_PASS?.length,
      SMTP_PASS_HAS_QUOTES: process.env.SMTP_PASS?.includes('"') || process.env.SMTP_PASS?.includes("'"),
    });
    
    const emailConfig: EmailConfig = {
      host: smtpHost || 'smtp.gmail.com',
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser || '',
        pass: smtpPass || '',
      },
    };

    console.log('📧 Cleaned email config:', {
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      user: emailConfig.auth.user,
      passLength: emailConfig.auth.pass?.length,
      passPreview: emailConfig.auth.pass ? `${emailConfig.auth.pass.substring(0, 4)}****` : 'MISSING',
    });

    // Validate required environment variables
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      const missingVars = [];
      if (!emailConfig.auth.user) missingVars.push('SMTP_USER');
      if (!emailConfig.auth.pass) missingVars.push('SMTP_PASS');
      throw new Error(`SMTP credentials are missing: ${missingVars.join(', ')}. Please check your .env file.`);
    }

    console.log('🔑 Creating nodemailer transporter...');
    const transporter = nodemailer.createTransporter(emailConfig);
    
    // Add event listeners for debugging
    transporter.on('token', token => {
      console.log('🔑 A new access token was generated');
      console.log('User: %s', token.user);
    });

    transporter.on('idle', () => {
      console.log('📬 Connection is idle');
    });

    console.log('✅ Transporter created successfully');
    return transporter;
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    if (!this.isConfigured) {
      console.error('❌ Email service is not configured properly');
      throw new Error('Email service is not properly configured. Check your SMTP settings in .env file.');
    }

    try {
      console.log('📤 Attempting to send email to:', options.to);
      
      // Verify connection before sending
      console.log('🔍 Verifying SMTP connection...');
      await this.transporter.verify();
      console.log('✅ SMTP connection verified successfully');
      
      const fromEmail = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim();
      const appName = process.env.APP_NAME?.trim() || 'QAMonitorTool';
      
      const mailOptions = {
        from: `"${appName}" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      console.log('📧 Mail options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        hasHtml: !!mailOptions.html,
        hasText: !!mailOptions.text,
      });

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully!');
      console.log('📨 Message ID:', info.messageId);
      console.log('📬 Response:', info.response);
      console.log('📋 Accepted:', info.accepted);
      console.log('❌ Rejected:', info.rejected);
      console.log('⏳ Pending:', info.pending);
      
      if (info.rejected && info.rejected.length > 0) {
        throw new Error(`Email was rejected for: ${info.rejected.join(', ')}`);
      }
      
    } catch (error) {
      console.error('❌ Error sending email:', error);
      
      if (error instanceof Error) {
        // Provide more specific error messages
        if (error.message.includes('Invalid login') || error.message.includes('Username and Password not accepted')) {
          throw new Error('Invalid SMTP credentials. Please check your email and app password.');
        } else if (error.message.includes('Application-specific password required')) {
          throw new Error('Gmail requires an App Password. Please generate one in your Google Account settings.');
        } else if (error.message.includes('Connection timeout')) {
          throw new Error('SMTP connection timeout. Please check your network connection.');
        } else if (error.message.includes('ENOTFOUND')) {
          throw new Error('SMTP server not found. Please check your SMTP host configuration.');
        } else if (error.message.includes('ECONNREFUSED')) {
          throw new Error('Connection refused by SMTP server. Please check your port and security settings.');
        } else if (error.message.includes('self signed certificate')) {
          throw new Error('SSL certificate issue. Try setting SMTP_SECURE=false for port 587.');
        }
      }
      
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string, userName: string): Promise<void> {
    console.log('🔄 Preparing password reset email for:', email);
    
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    console.log('🔗 Reset URL generated:', resetUrl);
    
    const html = this.generatePasswordResetEmailTemplate(userName, resetUrl);
    const text = this.generatePasswordResetEmailText(userName, resetUrl);

    console.log('📝 Email template generated, sending...');
    
    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password - QAMonitorTool',
      html,
      text,
    });
    
    console.log('🎉 Password reset email sent successfully!');
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