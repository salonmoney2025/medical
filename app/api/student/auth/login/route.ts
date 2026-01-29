import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/connection';
import { ApiResponse } from '@/types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// POST - Student login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appid, password } = body;

    // Validate input
    if (!appid || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'APPID and password are required',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Find student by APPID or medical_report_id
    const query = `
      SELECT
        id, name, appid, matriculation_number, program, faculty, department, campus,
        medical_report_id, password, health_percentage, health_status
      FROM students
      WHERE (appid = ? OR matriculation_number = ?) AND password IS NOT NULL
    `;

    const students = await executeQuery(query, [appid, appid]);

    if (!students || students.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid APPID or password',
        } as ApiResponse,
        { status: 401 }
      );
    }

    const student = students[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, student.password);

    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid APPID or password',
        } as ApiResponse,
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: student.id,
        appid: student.appid || student.matriculation_number,
        type: 'student',
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...studentData } = student;

    return NextResponse.json(
      {
        success: true,
        token,
        student: studentData,
        message: 'Login successful',
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Student login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during login',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
