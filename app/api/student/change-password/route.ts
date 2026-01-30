import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/backend/database/connection';
import { ApiResponse } from '@/backend/server/types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// POST - Student change password
export async function POST(request: NextRequest) {
  try {
    // Verify student token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' } as ApiResponse,
        { status: 401 }
      );
    }

    if (decoded.type !== 'student') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 403 }
      );
    }

    const body = await request.json();
    const { old_password, new_password } = body;

    if (!old_password || !new_password) {
      return NextResponse.json(
        { success: false, error: 'Old password and new password are required' } as ApiResponse,
        { status: 400 }
      );
    }

    if (new_password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 8 characters' } as ApiResponse,
        { status: 400 }
      );
    }

    // Get current password hash
    const students = await executeQuery('SELECT id, password FROM students WHERE id = ?', [decoded.id]);
    if (!students || students.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Student not found' } as ApiResponse,
        { status: 404 }
      );
    }

    const student = students[0];

    // Verify old password
    const isValid = await bcrypt.compare(old_password, student.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' } as ApiResponse,
        { status: 400 }
      );
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await executeQuery('UPDATE students SET password = ? WHERE id = ?', [hashedPassword, decoded.id]);

    return NextResponse.json(
      { success: true, message: 'Password changed successfully' } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Student change password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to change password' } as ApiResponse,
      { status: 500 }
    );
  }
}
