import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export function generateToken(payload: JWTPayload, expiresIn: string = '7d'): string {
  const expirationTime = getExpirationTimeInSeconds(expiresIn);
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expirationTime });
}

function getExpirationTimeInSeconds(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)(s|m|h|d)$/);
  if (!match) {
    throw new Error(`Invalid expiration time format: ${expiresIn}`);
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    default:
      throw new Error(`Unsupported unit: ${unit}`);
  }
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check cookies
  const token = request.cookies.get('auth-token')?.value;
  return token || null;
}

export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  
  return verifyToken(token);
}