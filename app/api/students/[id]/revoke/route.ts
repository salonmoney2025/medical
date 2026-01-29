import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/backend/database/connection';
import { withAuth } from '@/backend/server/auth/middleware';
import { ApiResponse } from '@/backend/server/types';
import { JwtPayload } from '@/backend/server/auth/jwt';

// POST revoke medical report ID from student
async function revokeReportIdHandler(
  request: NextRequest,
  _user: JwtPayload
) {
  try {
    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    const studentId = segments[segments.indexOf('students') + 1];

    const updateQuery = `
      UPDATE students
      SET
        medical_report_id = NULL,
        report_status = 'pending',
        password = NULL
      WHERE id = ?
    `;

    await executeQuery(updateQuery, [studentId]);

    return NextResponse.json(
      {
        success: true,
        message: 'Medical report ID revoked successfully',
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Revoke report ID error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to revoke medical report ID',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

export const POST = withAuth(revokeReportIdHandler, ['super_admin']);
