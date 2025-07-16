import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (session?.user) {
      // Redirect to dashboard on successful authentication
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      // Redirect to login on failed authentication
      return NextResponse.redirect(new URL('/login?error=Authentication failed', request.url));
    }
  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.redirect(new URL('/login?error=Authentication error', request.url));
  }
}