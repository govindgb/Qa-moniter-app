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

    const smtpHost = process.env.SMTP_HOST?.trim();
    const smtpPort = parseInt(process.env.SMTP_PORT?.trim() || '587');
    const smtpSecure = process.env.SMTP_SECURE?.trim() === 'true';
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS?.trim().replace(/['"]/g, '');

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

    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      const missingVars = [];
      if (!emailConfig.auth.user) missingVars.push('SMTP_USER');
      if (!emailConfig.auth.pass) missingVars.push('SMTP_PASS');
      throw new Error(`SMTP credentials are missing: ${missingVars.join(', ')}. Please check your .env file.`);
    }

    console.log('🔑 Creating nodemailer transporter...');
    const transporter = nodemailer.createTransport(emailConfig); // ✅ FIXED

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
      <body>
        <h1>Hello ${userName},</h1>
        <p>You requested to reset your password.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>If you didn't request this, ignore this email.</p>
      </body>
      </html>
    `;
  }

  private generatePasswordResetEmailText(userName: string, resetUrl: string): string {
    return `
Hello ${userName},

To reset your password, visit:
${resetUrl}

If you didn't request this, ignore this message.

- QAMonitorTool
    `;
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('❌ SMTP connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
export default EmailService;
