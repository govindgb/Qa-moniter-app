import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email';

// Test endpoint to send a real email (for debugging only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, testType = 'basic' } = body;

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email address is required',
        },
        { status: 400 }
      );
    }

    console.log('🧪 Sending test email to:', email);

    if (testType === 'reset') {
      // Test password reset email
      const testToken = 'test-token-123';
      await emailService.sendPasswordResetEmail(email, testToken, 'Test User');
    } else {
      // Send basic test email
      await emailService.sendEmail({
        to: email,
        subject: 'Test Email from QAMonitorTool',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #3b82f6;">🧪 Test Email</h2>
            <p>This is a test email from your QAMonitorTool application.</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p>If you received this email, your SMTP configuration is working correctly!</p>
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af;"><strong>✅ Email service is working properly!</strong></p>
            </div>
          </div>
        `,
        text: `Test Email from QAMonitorTool\n\nThis is a test email sent at ${new Date().toISOString()}.\n\nIf you received this email, your SMTP configuration is working correctly!`,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${email}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send test email',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Get email service status
export async function GET() {
  try {
    console.log('🔍 Checking email service status...');
    
    // Check environment variables
    const envStatus = {
      SMTP_HOST: !!process.env.SMTP_HOST,
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASS: !!process.env.SMTP_PASS,
      SMTP_PORT: process.env.SMTP_PORT || '587',
      SMTP_SECURE: process.env.SMTP_SECURE || 'false',
      SMTP_FROM: process.env.SMTP_FROM || process.env.SMTP_USER,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      SMTP_PASS_HAS_QUOTES: process.env.SMTP_PASS?.includes('"') || process.env.SMTP_PASS?.includes("'"),
      SMTP_PASS_LENGTH: process.env.SMTP_PASS?.length,
    };

    console.log('📋 Environment variables status:', envStatus);

    // Test SMTP connection
    const isConnected = await emailService.verifyConnection();
    
    return NextResponse.json({
      success: true,
      emailConfigured: isConnected,
      environmentVariables: envStatus,
      connectionTest: isConnected ? 'PASSED' : 'FAILED',
      message: isConnected 
        ? 'Email service is ready to send emails' 
        : 'Email service configuration has issues',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error checking email service:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}