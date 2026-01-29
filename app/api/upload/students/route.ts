import { NextRequest, NextResponse } from 'next/server';
import { parseStudentExcel, validateStudentData } from '@/backend/server/utils/excel';
import { executeQuery } from '@/backend/database/connection';
import { withAuth } from '@/backend/server/auth/middleware';
import { ApiResponse, ExcelUploadResult } from '@/backend/server/types';

// POST - Upload Excel file with student data
async function uploadStudentsHandler(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse Excel file
    let students;
    try {
      students = parseStudentExcel(buffer);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to parse Excel file. Please ensure it matches the template format.',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Validate student data
    const validation = validateStudentData(students);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          data: validation,
          error: 'Validation failed. Please check the errors and try again.',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Insert students into database
    const results: ExcelUploadResult = {
      success: true,
      total: students.length,
      successful: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      try {
        // Check if matriculation number already exists
        const checkQuery = 'SELECT id FROM students WHERE matriculation_number = ?';
        const existing = await executeQuery(checkQuery, [student.matriculation_number]);

        if (existing && existing.length > 0) {
          results.failed++;
          results.errors.push({
            row: i + 2,
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
          row: i + 2,
          matriculation_number: student.matriculation_number,
          error: 'Database insertion failed',
        });
      }
    }

    results.success = results.successful > 0;

    return NextResponse.json(
      {
        success: results.success,
        data: results,
        message: `Upload complete. ${results.successful} students added successfully. ${results.failed} failed.`,
      } as ApiResponse,
      { status: results.success ? 201 : 400 }
    );
  } catch (error) {
    console.error('Upload students error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process file upload',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// Export protected route (only super_admin can upload)
export const POST = withAuth(uploadStudentsHandler, ['super_admin']);
