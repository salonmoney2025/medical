import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, hasRole, JwtPayload } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JwtPayload;
}

/**
 * Middleware to authenticate requests
 * Verifies JWT token and attaches user info to request
 */
export const authenticate = async (
  request: NextRequest
): Promise<{ authenticated: boolean; user?: JwtPayload; error?: string }> => {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return {
        authenticated: false,
        error: 'No authentication token provided',
      };
    }

    const user = verifyToken(token);

    return {
      authenticated: true,
      user,
    };
  } catch (error) {
    return {
      authenticated: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
    };
  }
};

/**
 * Middleware to check if user has required role
 */
export const authorize = (
  user: JwtPayload | undefined,
  allowedRoles: string[]
): { authorized: boolean; error?: string } => {
  if (!user) {
    return {
      authorized: false,
      error: 'User not authenticated',
    };
  }

  if (!hasRole(user.role, allowedRoles)) {
    return {
      authorized: false,
      error: 'Insufficient permissions',
    };
  }

  return {
    authorized: true,
  };
};

/**
 * Create protected API route handler
 * @param handler - Route handler function
 * @param allowedRoles - Array of roles that can access this route
 */
export const withAuth = (
  handler: (request: NextRequest, user: JwtPayload) => Promise<Response>,
  allowedRoles?: string[]
) => {
  return async (request: NextRequest): Promise<Response> => {
    // Authenticate user
    const authResult = await authenticate(request);

    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || 'Authentication failed',
        },
        { status: 401 }
      );
    }

    // Authorize user if roles are specified
    if (allowedRoles && allowedRoles.length > 0) {
      const authzResult = authorize(authResult.user, allowedRoles);

      if (!authzResult.authorized) {
        return NextResponse.json(
          {
            success: false,
            error: authzResult.error || 'Access denied',
          },
          { status: 403 }
        );
      }
    }

    // Call the actual handler with authenticated user
    return handler(request, authResult.user);
  };
};
