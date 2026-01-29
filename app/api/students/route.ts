import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/connection';
import { withAuth } from '@/lib/auth/middleware';
import { ApiResponse, Student, StudentUploadData } from '@/types';

// GET all students or search by Student ID, matriculation number, or APPID
async function getStudentsHandler(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('student_id');
    const matriculationNumber = searchParams.get('matriculation_number');
    const appid = searchParams.get('appid');
    const search = searchParams.get('search');
    const searchField = searchParams.get('search_field');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query: string;
    let params: any[];
    let countQuery: string;
    let countParams: any[];

    if (studentId) {
      // Search by Student ID (database id) - exact match
      query = `SELECT * FROM students WHERE id = ?`;
      params = [studentId];
      countQuery = 'SELECT COUNT(*) as total FROM students WHERE id = ?';
      countParams = [studentId];
    } else if (appid) {
      // Search by APPID (exact or partial match)
      query = `
        SELECT * FROM students
        WHERE appid = ? OR matriculation_number = ?
      `;
      params = [appid, appid];
      countQuery = 'SELECT COUNT(*) as total FROM students WHERE appid = ? OR matriculation_number = ?';
      countParams = [appid, appid];
    } else if (matriculationNumber) {
      // Search for specific student by matriculation number
      query = `
        SELECT * FROM students
        WHERE matriculation_number = ?
      `;
      params = [matriculationNumber];
      countQuery = 'SELECT COUNT(*) as total FROM students WHERE matriculation_number = ?';
      countParams = [matriculationNumber];
    } else if (search) {
      // General text search across multiple fields
      const searchPattern = `%${search}%`;

      if (searchField === 'appid') {
        query = `SELECT * FROM students WHERE appid LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params = [searchPattern, limit, offset];
        countQuery = 'SELECT COUNT(*) as total FROM students WHERE appid LIKE ?';
        countParams = [searchPattern];
      } else if (searchField === 'name') {
        query = `SELECT * FROM students WHERE name LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params = [searchPattern, limit, offset];
        countQuery = 'SELECT COUNT(*) as total FROM students WHERE name LIKE ?';
        countParams = [searchPattern];
      } else if (searchField === 'program') {
        query = `SELECT * FROM students WHERE program LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params = [searchPattern, limit, offset];
        countQuery = 'SELECT COUNT(*) as total FROM students WHERE program LIKE ?';
        countParams = [searchPattern];
      } else if (searchField === 'campus') {
        query = `SELECT * FROM students WHERE campus LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params = [searchPattern, limit, offset];
        countQuery = 'SELECT COUNT(*) as total FROM students WHERE campus LIKE ?';
        countParams = [searchPattern];
      } else if (searchField === 'id_mat') {
        query = `SELECT * FROM students WHERE medical_report_id LIKE ? OR matriculation_number LIKE ? OR appid LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params = [searchPattern, searchPattern, searchPattern, limit, offset];
        countQuery = 'SELECT COUNT(*) as total FROM students WHERE medical_report_id LIKE ? OR matriculation_number LIKE ? OR appid LIKE ?';
        countParams = [searchPattern, searchPattern, searchPattern];
      } else {
        // Search across all relevant fields
        query = `
          SELECT * FROM students
          WHERE appid LIKE ? OR name LIKE ? OR program LIKE ? OR campus LIKE ? OR matriculation_number LIKE ? OR medical_report_id LIKE ?
          ORDER BY created_at DESC
          LIMIT ? OFFSET ?
        `;
        params = [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, limit, offset];
        countQuery = 'SELECT COUNT(*) as total FROM students WHERE appid LIKE ? OR name LIKE ? OR program LIKE ? OR campus LIKE ? OR matriculation_number LIKE ? OR medical_report_id LIKE ?';
        countParams = [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern];
      }
    } else {
      // Get all students with pagination
      query = `
        SELECT * FROM students
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      params = [limit, offset];
      countQuery = 'SELECT COUNT(*) as total FROM students';
      countParams = [];
    }

    const students = await executeQuery(query, params);

    // Get total count for the current query
    const countResult = await executeQuery(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    return NextResponse.json(
      {
        success: true,
        data: students,
        pagination: {
          total,
          limit,
          offset,
        },
      } as ApiResponse<Student[]>,
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get students error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve students',
        debug: process.env.NODE_ENV === 'development' ? error?.message || String(error) : undefined,
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// POST - Add single student or bulk upload (Super Admin only)
async function createStudentsHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const students: StudentUploadData[] = Array.isArray(body) ? body : [body];

    if (students.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No student data provided',
        } as ApiResponse,
        { status: 400 }
      );
    }

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as any[],
    };

    // Insert students one by one
    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      try {
        // Validate required fields
        if (!student.name || !student.matriculation_number || !student.program || !student.faculty || !student.department) {
          results.failed++;
          results.errors.push({
            index: i,
            matriculation_number: student.matriculation_number || 'N/A',
            error: 'Missing required fields',
          });
          continue;
        }

        // Check if matriculation number already exists
        const checkQuery = 'SELECT id FROM students WHERE matriculation_number = ?';
        const existing = await executeQuery(checkQuery, [student.matriculation_number]);

        if (existing && existing.length > 0) {
          results.failed++;
          results.errors.push({
            index: i,
            matriculation_number: student.matriculation_number,
            error: 'Matriculation number already exists',
          });
          continue;
        }

        // Insert student
        const insertQuery = `
          INSERT INTO students (name, matriculation_number, program, faculty, department)
          VALUES (?, ?, ?, ?, ?)
        `;

        await executeQuery(insertQuery, [
          student.name,
          student.matriculation_number,
          student.program,
          student.faculty,
          student.department,
        ]);

        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          index: i,
          matriculation_number: student.matriculation_number || 'N/A',
          error: 'Failed to insert student',
        });
      }
    }

    const statusCode = results.successful > 0 ? 201 : 400;

    return NextResponse.json(
      {
        success: results.successful > 0,
        data: results,
        message: `Successfully added ${results.successful} student(s). ${results.failed} failed.`,
      } as ApiResponse,
      { status: statusCode }
    );
  } catch (error) {
    console.error('Create students error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create students',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// Export routes with authentication
export const GET = withAuth(getStudentsHandler, ['super_admin', 'medical_officer']);
export const POST = withAuth(createStudentsHandler, ['super_admin']);
