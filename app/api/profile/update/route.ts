import { getUserFromRequest } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/QaMonitorUsers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  await connectToDatabase();

  const decoded = getUserFromRequest(request);

  // ✅ FIX: Check for invalid token
  if (!decoded) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Invalid token' },
      { status: 401 }
    );
  }

  const { name, password } = await request.json();

  // ✅ Find the user
  const user = await User.findById(decoded.userId);
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 }
    );
  }

  // ✅ Update name and/or password
  if (name) user.name = name;
  if (password) user.password = password;

  await user.save();

  return NextResponse.json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });
}
