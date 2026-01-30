import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/backend/database/connection';
import { withAuth } from '@/backend/server/auth/middleware';
import { ApiResponse } from '@/backend/server/types';
import bcrypt from 'bcryptjs';

// POST invite new admin/user
async function inviteUserHandler(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if user already exists
    const checkQuery = 'SELECT id FROM users WHERE email = ?';
    const existing = await executeQuery(checkQuery, [body.email]);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Use provided password or generate a temporary one
    const tempPassword = body.password || Math.random().toString(36).slice(-10);
    if (tempPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' } as ApiResponse,
        { status: 400 }
      );
    }
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Determine role enum value based on input
    let roleEnum = 'medical_officer';
    if (body.role?.toLowerCase().includes('super admin')) {
      roleEnum = 'super_admin';
    }

    const insertQuery = `
      INSERT INTO users (email, password, full_name, role, designation, campus, status)
      VALUES (?, ?, ?, ?, ?, ?, 'invited')
    `;

    await executeQuery(insertQuery, [
      body.email,
      hashedPassword,
      body.full_name,
      roleEnum,
      body.designation,
      body.campus,
    ]);

    return NextResponse.json(
      {
        success: true,
        message: 'User invited successfully',
        data: {
          email: body.email,
          temporary_password: tempPassword,
        },
      } as ApiResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error('Invite user error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to invite user',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

export const POST = withAuth(inviteUserHandler, ['super_admin']);
