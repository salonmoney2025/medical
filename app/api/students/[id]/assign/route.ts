import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/backend/database/connection';
import { withAuth } from '@/backend/server/auth/middleware';
import { ApiResponse } from '@/backend/server/types';
import { JwtPayload } from '@/backend/server/auth/jwt';

// POST assign medical report ID to student
async function assignReportIdHandler(
  request: NextRequest,
  _user: JwtPayload
) {
  try {
    // Extract student ID from URL path
    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    const studentId = segments[segments.indexOf('students') + 1];

    // Generate a unique medical report ID
    // Format: MED + year + random number
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const reportId = `${randomNum}`;

    // Generate a random password for student login
    const password = Math.random().toString(36).slice(-8);

    const updateQuery = `
      UPDATE students
      SET
        medical_report_id = ?,
        report_status = 'assigned',
        password = ?
      WHERE id = ?
    `;

    await executeQuery(updateQuery, [reportId, password, studentId]);

    return NextResponse.json(
      {
        success: true,
        message: 'Medical report ID assigned successfully',
        data: {
          medical_report_id: reportId,
          password: password,
        },
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Assign report ID error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to assign medical report ID',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

export const POST = withAuth(assignReportIdHandler, ['super_admin']);
