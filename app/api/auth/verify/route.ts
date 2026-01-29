import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticate(request);

    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || 'Invalid token',
        } as ApiResponse,
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          userId: authResult.user.userId,
          email: authResult.user.email,
          role: authResult.user.role,
        },
        message: 'Token is valid',
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Token verification failed',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
