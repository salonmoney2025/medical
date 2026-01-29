import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/connection';
import { comparePassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { LoginDto, AuthResponse, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: LoginDto = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and password are required',
        } as AuthResponse,
        { status: 400 }
      );
    }

    // Find user by email
    const query = `
      SELECT id, email, password, full_name, role, is_active, created_at, updated_at
      FROM users
      WHERE email = ?
    `;

    const results = await executeQuery(query, [email]);

    if (!results || results.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        } as AuthResponse,
        { status: 401 }
      );
    }

    const user = results[0];

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: 'Account is disabled. Please contact administrator.',
        } as AuthResponse,
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        } as AuthResponse,
        { status: 401 }
      );
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    // Generate JWT token
    const token = generateToken(userWithoutPassword);

    // Log successful login
    try {
      await executeQuery(
        `INSERT INTO system_logs (action, initiator, status, role, details) VALUES (?, ?, ?, ?, ?)`,
        ['Login Admin', user.email, 'success', user.role, `User ${user.full_name} logged in successfully`]
      );
    } catch (logError) {
      // Non-critical, don't block login if logging fails
      console.error('Failed to log login action:', logError);
    }

    return NextResponse.json(
      {
        success: true,
        user: userWithoutPassword,
        token,
        message: 'Login successful',
      } as AuthResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during login',
      } as AuthResponse,
      { status: 500 }
    );
  }
}
