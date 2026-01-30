import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/backend/server/auth/jwt';
import { executeQuery } from '@/backend/database/connection';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Get all students
    const students = await executeQuery(`
      SELECT
        appid as 'APPID',
        name as 'Full Name',
        email as 'Email',
        program as 'Program',
        campus as 'Campus',
        medical_report_id as 'Medical Report ID',
        report_status as 'Status',
        health_percentage as 'Health%',
        health_status as 'Health Status',
        created_at as 'Created Date'
      FROM students
      ORDER BY appid ASC
    `);

    // Return JSON data (frontend will convert to Excel)
    return NextResponse.json({
      success: true,
      data: students
    });

  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to export students' },
      { status: 500 }
    );
  }
}
