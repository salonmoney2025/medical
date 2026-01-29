import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/backend/database/connection';
import { withAuth } from '@/backend/server/auth/middleware';
import { ApiResponse } from '@/backend/server/types';

interface DashboardStatistics {
  totalStudentsUploaded: number;
  matriculationIdAssigned: number;
  matriculationIdPending: number;
  campusData: Array<{
    campus: string;
    count: number;
  }>;
}

async function getDashboardStatsHandler(request: NextRequest) {
  try {
    // Get total students
    const totalQuery = 'SELECT COUNT(*) as total FROM students';
    const totalResult = await executeQuery(totalQuery);
    const totalStudents = totalResult[0]?.total || 0;

    // Get students with assigned matriculation IDs
    // Assuming all students in the DB have matriculation numbers assigned
    const assignedQuery = `
      SELECT COUNT(*) as assigned
      FROM students
      WHERE matriculation_number IS NOT NULL AND matriculation_number != ''
    `;
    const assignedResult = await executeQuery(assignedQuery);
    const assignedIds = assignedResult[0]?.assigned || 0;

    // Calculate pending (for now, this could be based on a status field)
    const pendingIds = totalStudents - assignedIds;

    // Get campus data - group by campus field
    const campusQuery = `
      SELECT COALESCE(campus, faculty, 'Unknown') as campus, COUNT(*) as count
      FROM students
      GROUP BY COALESCE(campus, faculty, 'Unknown')
      ORDER BY count DESC
    `;
    const campusResult = await executeQuery(campusQuery);

    const stats: DashboardStatistics = {
      totalStudentsUploaded: totalStudents,
      matriculationIdAssigned: assignedIds,
      matriculationIdPending: pendingIds,
      campusData: campusResult || [],
    };

    return NextResponse.json(
      {
        success: true,
        data: stats,
      } as ApiResponse<DashboardStatistics>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve dashboard statistics',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// Export route with authentication - only super_admin can access
export const GET = withAuth(getDashboardStatsHandler, ['super_admin']);
