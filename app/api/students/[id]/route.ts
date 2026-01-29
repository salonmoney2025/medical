import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/connection';
import { withAuth } from '@/lib/auth/middleware';
import { ApiResponse } from '@/types';
import { JwtPayload } from '@/lib/auth/jwt';

function extractStudentId(request: NextRequest): string {
  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  return segments[segments.indexOf('students') + 1];
}

// GET single student by ID
async function getStudentHandler(
  request: NextRequest,
  _user: JwtPayload
) {
  try {
    const studentId = extractStudentId(request);

    const query = 'SELECT * FROM students WHERE id = ?';
    const students = await executeQuery(query, [studentId]);

    if (!students || students.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Student not found',
        } as ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: students[0],
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Get student error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve student',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// PUT update student
async function updateStudentHandler(
  request: NextRequest,
  _user: JwtPayload
) {
  try {
    const studentId = extractStudentId(request);
    const body = await request.json();

    const updateQuery = `
      UPDATE students
      SET
        name = ?,
        program = ?,
        faculty = ?,
        department = ?,
        campus = ?,
        academic_year = ?,
        appid = ?
      WHERE id = ?
    `;

    await executeQuery(updateQuery, [
      body.name,
      body.program,
      body.faculty || 'Medical Sciences',
      body.department || 'Medical',
      body.campus,
      body.academic_year,
      body.appid || body.matriculation_number,
      studentId,
    ]);

    return NextResponse.json(
      {
        success: true,
        message: 'Student updated successfully',
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update student',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// DELETE student
async function deleteStudentHandler(
  request: NextRequest,
  _user: JwtPayload
) {
  try {
    const studentId = extractStudentId(request);

    const deleteQuery = 'DELETE FROM students WHERE id = ?';
    await executeQuery(deleteQuery, [studentId]);

    return NextResponse.json(
      {
        success: true,
        message: 'Student deleted successfully',
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete student',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

export const GET = withAuth(getStudentHandler, ['super_admin', 'medical_officer']);
export const PUT = withAuth(updateStudentHandler, ['super_admin']);
export const DELETE = withAuth(deleteStudentHandler, ['super_admin']);
