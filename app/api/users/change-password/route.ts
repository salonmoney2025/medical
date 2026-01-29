import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/connection';
import { withAuth } from '@/lib/auth/middleware';
import { ApiResponse } from '@/types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// POST - Change password
async function changePasswordHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { old_password, new_password } = body;

    // Get user from token
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        } as ApiResponse,
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    );

    // Validate input
    if (!old_password || !new_password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Old password and new password are required',
        } as ApiResponse,
        { status: 400 }
      );
    }

    if (new_password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: 'New password must be at least 8 characters',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Get current user
    const userQuery = 'SELECT id, email, password FROM users WHERE id = ?';
    const users = await executeQuery(userQuery, [decoded.id]);

    if (!users || users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        } as ApiResponse,
        { status: 404 }
      );
    }

    const user = users[0];

    // Verify old password
    const isValidOldPassword = await bcrypt.compare(old_password, user.password);

    if (!isValidOldPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Current password is incorrect',
        } as ApiResponse,
        { status: 401 }
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(new_password, 10);

    // Update password
    const updateQuery = 'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?';
    await executeQuery(updateQuery, [hashedNewPassword, user.id]);

    // Create log entry
    try {
      const logQuery = `
        INSERT INTO system_logs (action, initiator, status, role)
        VALUES ('Change Password', ?, 'success', ?)
      `;
      await executeQuery(logQuery, [user.email, decoded.role]);
    } catch (logError) {
      console.error('Failed to create log entry:', logError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Password changed successfully',
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to change password',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

export const POST = withAuth(changePasswordHandler, ['super_admin', 'medical_officer']);
