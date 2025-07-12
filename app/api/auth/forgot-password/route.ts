import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/QaMonitorUsers';
import { generateToken } from '@/lib/auth';
import { emailService } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { email } = body;

    // Validation
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email address is required',
        },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'No account found with this email address',
        },
        { status: 404 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account is deactivated. Please contact administrator.',
        },
        { status: 401 }
      );
    }

    // Generate a temporary token for password reset (valid for 1 hour)
    const resetToken = generateToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    }, '1h'); // Set expiration to 1 hour

    try {
      // Send password reset email
      console.log('🚀 Attempting to send password reset email...');
      await emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.name
      );
      console.log('✅ Password reset email sent successfully');

      return NextResponse.json({
        success: true,
        message: 'Password reset instructions have been sent to your email address',
        data: {
          email: user.email,
          name: user.name,
        },
      });
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      console.error('Email error details:', emailError);
      
      // Return success but with a different message if email fails
      // This prevents email enumeration attacks
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, password reset instructions have been sent',
        data: {
          email: user.email,
          name: user.name,
        },
      });
    }
  } catch (error) {
    console.error('Error in forgot password:', error);
    console.error('Forgot password error details:', error);
    
    // Generic error message to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, password reset instructions have been sent',
    });
  }
}

// Add a test endpoint for email verification (remove in production)
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing email service configuration...');
    
    // Check environment variables
    const requiredEnvVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing environment variables: ${missingVars.join(', ')}`,
        envCheck: {
          SMTP_HOST: !!process.env.SMTP_HOST,
          SMTP_USER: !!process.env.SMTP_USER,
          SMTP_PASS: !!process.env.SMTP_PASS,
          SMTP_PORT: process.env.SMTP_PORT || '587',
          SMTP_SECURE: process.env.SMTP_SECURE || 'false',
        }
      }, { status: 500 });
    }
    
    const isConnected = await emailService.verifyConnection();
    return NextResponse.json({
      success: true,
      emailConfigured: isConnected,
      message: isConnected ? 'Email service is configured correctly' : 'Email service configuration failed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error testing email connection:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Email service test failed',
      },
      { status: 500 }
    );
  }
}