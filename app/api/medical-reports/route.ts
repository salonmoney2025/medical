import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/backend/database/connection';
import { withAuth } from '@/backend/server/auth/middleware';
import { ApiResponse } from '@/backend/server/types';
import { JwtPayload } from '@/backend/server/auth/jwt';
import bcrypt from 'bcryptjs';

// Ensure medical_records table has all required columns
async function ensureMedicalRecordColumns() {
  const columnsToAdd = [
    { name: 'diagnosis', sql: 'ALTER TABLE medical_records ADD COLUMN diagnosis TEXT NULL' },
    { name: 'health_percentage', sql: 'ALTER TABLE medical_records ADD COLUMN health_percentage INT DEFAULT 0' },
    { name: 'health_status', sql: "ALTER TABLE medical_records ADD COLUMN health_status VARCHAR(50) NULL" },
  ];

  for (const col of columnsToAdd) {
    try {
      const rows = await executeQuery(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'medical_records' AND COLUMN_NAME = ?`,
        [col.name]
      );
      if (!rows || rows.length === 0) {
        await executeQuery(col.sql);
        console.log(`Added missing column: medical_records.${col.name}`);
      }
    } catch (e) {
      // Column might already exist, ignore
    }
  }
}

// POST - Create medical report
async function createMedicalReportHandler(request: NextRequest, user: JwtPayload) {
  try {
    const body = await request.json();
    const {
      student_id,
      weight,
      height,
      visual_acuity_le,
      visual_acuity_re,
      blood_group,
      past_medical_history,
      current_chronic_illness,
      long_standing_medication,
      known_allergies,
      respiratory_breast_exam,
      cardiovascular_exam,
      mental_state_exam,
      additional_notes,
      diagnosis,
      health_percentage,
      health_status,
    } = body;

    // Use authenticated user's ID as medical officer
    const medical_officer_id = user.userId;

    // Validate required fields
    if (!student_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Student ID is required',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Auto-migrate: ensure diagnosis, health_percentage, health_status columns exist
    await ensureMedicalRecordColumns();

    // Generate unique medical report ID (4-digit number)
    const reportId = Math.floor(1000 + Math.random() * 9000).toString();

    // Generate random password for student (8 characters)
    const studentPassword = Math.random().toString(36).slice(-8).toUpperCase();
    const hashedPassword = await bcrypt.hash(studentPassword, 10);

    // Insert medical record
    const insertRecordQuery = `
      INSERT INTO medical_records (
        student_id, medical_officer_id,
        weight, height,
        visual_acuity_le, visual_acuity_re,
        blood_group,
        past_medical_history, current_chronic_illness,
        long_standing_medication, known_allergies,
        respiratory_breast_exam, cardiovascular_exam, mental_state_exam,
        additional_notes, diagnosis,
        health_percentage, health_status,
        is_completed, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
    `;

    const result = await executeQuery(insertRecordQuery, [
      student_id,
      medical_officer_id,
      weight || null,
      height || null,
      visual_acuity_le || null,
      visual_acuity_re || null,
      blood_group || null,
      past_medical_history || null,
      current_chronic_illness || null,
      long_standing_medication || null,
      known_allergies || null,
      respiratory_breast_exam || null,
      cardiovascular_exam || null,
      mental_state_exam || null,
      additional_notes || null,
      diagnosis || null,
      health_percentage || 0,
      health_status || null,
    ]);

    // Update student record with medical report ID, password, and status
    const updateStudentQuery = `
      UPDATE students
      SET
        medical_report_id = ?,
        password = ?,
        report_status = 'completed',
        health_percentage = ?,
        health_status = ?
      WHERE id = ?
    `;

    await executeQuery(updateStudentQuery, [
      reportId,
      hashedPassword,
      health_percentage || 0,
      health_status || null,
      student_id,
    ]);

    // Create log entry
    try {
      const logQuery = `
        INSERT INTO system_logs (action, initiator, status, role)
        VALUES ('Create Medical Report', ?, 'success', 'medical_officer')
      `;
      const officer = await executeQuery('SELECT email FROM users WHERE id = ?', [
        medical_officer_id,
      ]);
      if (officer && officer.length > 0) {
        await executeQuery(logQuery, [officer[0].email]);
      }
    } catch (logError) {
      console.error('Failed to create log entry:', logError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Medical report created successfully',
        data: {
          medical_report_id: reportId,
          student_password: studentPassword,
          record_id: result.insertId,
        },
      } as ApiResponse,
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create medical report error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to create medical report',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// GET - Retrieve medical reports
async function getMedicalReportsHandler(request: NextRequest, user: JwtPayload) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('student_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT
        mr.*,
        s.name as student_name,
        s.matriculation_number,
        s.program,
        s.faculty,
        u.full_name as medical_officer_name,
        u.email as medical_officer_email
      FROM medical_records mr
      JOIN students s ON mr.student_id = s.id
      JOIN users u ON mr.medical_officer_id = u.id
    `;

    const params: any[] = [];

    if (studentId) {
      query += ' WHERE mr.student_id = ?';
      params.push(studentId);
    }

    query += ' ORDER BY mr.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const records = await executeQuery(query, params);

    return NextResponse.json(
      {
        success: true,
        data: records,
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Get medical reports error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve medical reports',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

export const POST = withAuth(createMedicalReportHandler, [
  'super_admin',
  'medical_officer',
]);
export const GET = withAuth(getMedicalReportsHandler, [
  'super_admin',
  'medical_officer',
]);
