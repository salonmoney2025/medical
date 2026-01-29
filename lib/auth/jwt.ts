import jwt from 'jsonwebtoken';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT token for user
 * @param user - User object
 * @returns JWT token string
 */
export const generateToken = (user: Omit<User, 'password'>): string => {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate authentication token');
  }
};

/**
 * Verify and decode JWT token
 * @param token - JWT token string
 * @returns Decoded token payload
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export const extractTokenFromHeader = (authHeader: string | null): string | null => {
  if (!authHeader) {
    return null;
  }

  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }

  return null;
};

/**
 * Check if user has required role
 * @param userRole - User's role
 * @param requiredRoles - Array of allowed roles
 * @returns Boolean indicating if user has permission
 */
export const hasRole = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole);
};
