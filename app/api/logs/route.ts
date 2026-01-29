import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/backend/database/connection';
import { withAuth } from '@/backend/server/auth/middleware';
import { ApiResponse } from '@/backend/server/types';

// GET all system logs
async function getLogsHandler(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const query = `
      SELECT * FROM system_logs
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const logs = await executeQuery(query, [limit, offset]);

    // Get total count
    const countQuery = 'SELECT COUNT(*) as total FROM system_logs';
    const countResult = await executeQuery(countQuery);
    const total = countResult[0]?.total || 0;

    return NextResponse.json(
      {
        success: true,
        data: logs,
        pagination: {
          total,
          limit,
          offset,
        },
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get logs error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve logs',
        debug: process.env.NODE_ENV === 'development' ? error?.message || String(error) : undefined,
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// POST create a new log entry
async function createLogHandler(request: NextRequest) {
  try {
    const body = await request.json();

    const insertQuery = `
      INSERT INTO system_logs (action, initiator, status, role, ip_address, user_agent, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await executeQuery(insertQuery, [
      body.action,
      body.initiator,
      body.status,
      body.role,
      body.ip_address || null,
      body.user_agent || null,
      body.details || null,
    ]);

    return NextResponse.json(
      {
        success: true,
        message: 'Log entry created successfully',
      } as ApiResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error('Create log error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create log entry',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

export const GET = withAuth(getLogsHandler, ['super_admin']);
export const POST = withAuth(createLogHandler, ['super_admin', 'medical_officer']);
