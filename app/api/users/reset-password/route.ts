import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/connection';
import { withAuth } from '@/lib/auth/middleware';
import { hashPassword } from '@/lib/auth/password';
import { ApiResponse } from '@/types';

// POST - Super admin resets any user's password (no old password required)
async function resetPasswordHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, new_password } = body;

    if (!user_id || !new_password) {
      return NextResponse.json(
        { success: false, error: 'User ID and new password are required' } as ApiResponse,
        { status: 400 }
      );
    }

    if (new_password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' } as ApiResponse,
        { status: 400 }
      );
    }

    // Verify target user exists
    const users = await executeQuery('SELECT id, email, full_name, role FROM users WHERE id = ?', [user_id]);
    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' } as ApiResponse,
        { status: 404 }
      );
    }

    const targetUser = users[0];

    // Hash new password
    const hashedPassword = await hashPassword(new_password);

    // Update password
    await executeQuery('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hashedPassword, user_id]);

    // Log the action
    try {
      await executeQuery(
        `INSERT INTO system_logs (action, initiator, status, role, details) VALUES (?, ?, ?, ?, ?)`,
        ['Reset Password', 'super_admin', 'success', 'super_admin', `Password reset for ${targetUser.email} (${targetUser.full_name})`]
      );
    } catch (logError) {
      console.error('Failed to log password reset:', logError);
    }

    return NextResponse.json(
      { success: true, message: `Password reset successfully for ${targetUser.full_name}` } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset password' } as ApiResponse,
      { status: 500 }
    );
  }
}

export const POST = withAuth(resetPasswordHandler, ['super_admin']);
