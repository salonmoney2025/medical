import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/connection';
import { withAuth } from '@/lib/auth/middleware';
import { ApiResponse } from '@/types';

// POST - Super admin resets a student's password (plain text, matches assign pattern)
async function resetStudentPasswordHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_id, new_password } = body;

    if (!student_id || !new_password) {
      return NextResponse.json(
        { success: false, error: 'Student ID and new password are required' } as ApiResponse,
        { status: 400 }
      );
    }

    if (new_password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' } as ApiResponse,
        { status: 400 }
      );
    }

    // Verify student exists
    const students = await executeQuery('SELECT id, name, appid FROM students WHERE id = ?', [student_id]);
    if (!students || students.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Student not found' } as ApiResponse,
        { status: 404 }
      );
    }

    const student = students[0];

    // Update password (plain text, matching the assign endpoint pattern)
    await executeQuery('UPDATE students SET password = ?, updated_at = NOW() WHERE id = ?', [new_password, student_id]);

    // Log the action
    try {
      await executeQuery(
        `INSERT INTO system_logs (action, initiator, status, role, details) VALUES (?, ?, ?, ?, ?)`,
        ['Reset Student Password', 'super_admin', 'success', 'super_admin', `Password reset for student ${student.name} (APPID: ${student.appid})`]
      );
    } catch (logError) {
      console.error('Failed to log student password reset:', logError);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Password reset successfully for ${student.name}`,
        data: { password: new_password },
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset student password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset student password' } as ApiResponse,
      { status: 500 }
    );
  }
}

export const POST = withAuth(resetStudentPasswordHandler, ['super_admin']);
