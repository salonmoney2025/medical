import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/backend/database/connection';
import { hashPassword, validatePassword } from '@/backend/server/auth/password';
import { withAuth } from '@/backend/server/auth/middleware';
import { CreateUserDto, ApiResponse, User } from '@/backend/server/types';
import { isValidEmail } from '@/backend/server/utils/helpers';

// GET all users (Super Admin only)
async function getUsersHandler(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const roleFilter = searchParams.get('role');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = `
      SELECT id, email, full_name, role, is_active, designation, campus, status, created_at, updated_at
      FROM users
    `;

    const params: any[] = [];

    // Add role filter if specified and not 'all'
    if (roleFilter && roleFilter !== 'all') {
      query += ' WHERE role = ?';
      params.push(roleFilter);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const users = await executeQuery(query, params);

    return NextResponse.json(
      {
        success: true,
        data: users,
      } as ApiResponse<User[]>,
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve users',
        debug: process.env.NODE_ENV === 'development' ? error?.message || String(error) : undefined,
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// POST - Create new user (Super Admin only)
async function createUserHandler(request: NextRequest) {
  try {
    const body: CreateUserDto = await request.json();
    const { email, password, full_name, role } = body;

    // Validate input
    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        {
          success: false,
          error: 'All fields are required',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: passwordValidation.message,
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Validate role
    if (!['super_admin', 'medical_officer'].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid role',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Check if email already exists
    const checkQuery = 'SELECT id FROM users WHERE email = ?';
    const existingUsers = await executeQuery(checkQuery, [email]);

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already exists',
        } as ApiResponse,
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert new user
    const insertQuery = `
      INSERT INTO users (email, password, full_name, role)
      VALUES (?, ?, ?, ?)
    `;

    const result = await executeQuery(insertQuery, [
      email,
      hashedPassword,
      full_name,
      role,
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: result.insertId,
          email,
          full_name,
          role,
        },
        message: 'User created successfully',
      } as ApiResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// Export protected routes (only super_admin can access)
export const GET = withAuth(getUsersHandler, ['super_admin']);
export const POST = withAuth(createUserHandler, ['super_admin']);
