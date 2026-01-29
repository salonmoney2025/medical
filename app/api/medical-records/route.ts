import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/connection';
import { withAuth } from '@/lib/auth/middleware';
import { JwtPayload } from '@/lib/auth/jwt';
import { ApiResponse, MedicalRecord, CreateMedicalRecordDto } from '@/types';

// GET medical records
async function getMedicalRecordsHandler(request: NextRequest, user: JwtPayload) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('student_id');
    const matriculationNumber = searchParams.get('matriculation_number');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query: string;
    let params: any[];

    if (studentId) {
      // Get records for specific student
      query = `
        SELECT mr.*, s.name as student_name, s.matriculation_number,
               s.appid, s.program, s.faculty, s.department,
               u.full_name as medical_officer_name
        FROM medical_records mr
        JOIN students s ON mr.student_id = s.id
        JOIN users u ON mr.medical_officer_id = u.id
        WHERE mr.student_id = ?
        ORDER BY mr.created_at DESC
      `;
      params = [studentId];
    } else if (matriculationNumber) {
      // Get records by matriculation number
      query = `
        SELECT mr.*, s.name as student_name, s.matriculation_number,
               s.appid, s.program, s.faculty, s.department,
               u.full_name as medical_officer_name
        FROM medical_records mr
        JOIN students s ON mr.student_id = s.id
        JOIN users u ON mr.medical_officer_id = u.id
        WHERE s.matriculation_number = ?
        ORDER BY mr.created_at DESC
      `;
      params = [matriculationNumber];
    } else {
      // Get all records (with pagination)
      query = `
        SELECT mr.*, s.name as student_name, s.matriculation_number,
               s.appid, s.program, s.faculty, s.department,
               u.full_name as medical_officer_name
        FROM medical_records mr
        JOIN students s ON mr.student_id = s.id
        JOIN users u ON mr.medical_officer_id = u.id
        ORDER BY mr.created_at DESC
        LIMIT ? OFFSET ?
      `;
      params = [limit, offset];
    }

    const records = await executeQuery(query, params);

    // Gather stats separately so a stats failure doesn't block records
    let total = 0;
    let completed = 0;
    let pending = 0;
    let totalStudents = 0;

    try {
      const countResult = await executeQuery('SELECT COUNT(*) as total FROM medical_records');
      total = countResult[0]?.total || 0;

      const completedResult = await executeQuery('SELECT COUNT(*) as completed FROM medical_records WHERE is_completed = 1');
      completed = completedResult[0]?.completed || 0;

      const pendingResult = await executeQuery('SELECT COUNT(*) as pending FROM medical_records WHERE is_completed = 0 OR is_completed IS NULL');
      pending = pendingResult[0]?.pending || 0;

      const totalStudentsResult = await executeQuery('SELECT COUNT(*) as total_students FROM students');
      totalStudents = totalStudentsResult[0]?.total_students || 0;
    } catch (statsError) {
      console.error('Stats query error (non-blocking):', statsError);
    }

    return NextResponse.json(
      {
        success: true,
        data: records,
        stats: {
          total_students: totalStudents,
          total_records: total,
          completed,
          pending,
        },
        pagination: {
          total,
          limit,
          offset,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get medical records error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to retrieve medical records',
      },
      { status: 500 }
    );
  }
}

// POST - Create new medical record
async function createMedicalRecordHandler(request: NextRequest, user: JwtPayload) {
  try {
    const body: CreateMedicalRecordDto = await request.json();

    // Validate required fields
    if (!body.student_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Student ID is required',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Check if student exists
    const studentQuery = 'SELECT id FROM students WHERE id = ?';
    const studentResult = await executeQuery(studentQuery, [body.student_id]);

    if (!studentResult || studentResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Student not found',
        } as ApiResponse,
        { status: 404 }
      );
    }

    // Use authenticated user's ID as medical officer
    const medicalOfficerId = user.userId;

    // Insert medical record
    const insertQuery = `
      INSERT INTO medical_records (
        student_id, medical_officer_id, weight, height,
        visual_acuity_le, visual_acuity_re, blood_group,
        past_medical_history, current_chronic_illness,
        long_standing_medication, known_allergies,
        respiratory_breast_exam, cardiovascular_exam,
        mental_state_exam, additional_notes, is_completed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(insertQuery, [
      body.student_id,
      medicalOfficerId,
      body.weight || null,
      body.height || null,
      body.visual_acuity_le || null,
      body.visual_acuity_re || null,
      body.blood_group || null,
      body.past_medical_history || null,
      body.current_chronic_illness || null,
      body.long_standing_medication || null,
      body.known_allergies || null,
      body.respiratory_breast_exam || null,
      body.cardiovascular_exam || null,
      body.mental_state_exam || null,
      body.additional_notes || null,
      true, // Mark as completed upon submission
    ]);

    // Update completed_at timestamp
    const updateQuery = 'UPDATE medical_records SET completed_at = NOW() WHERE id = ?';
    await executeQuery(updateQuery, [result.insertId]);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: result.insertId,
          student_id: body.student_id,
          medical_officer_id: medicalOfficerId,
        },
        message: 'Medical record created successfully',
      } as ApiResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error('Create medical record error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create medical record',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// Export routes with authentication
export const GET = withAuth(getMedicalRecordsHandler, ['super_admin', 'medical_officer']);
export const POST = withAuth(createMedicalRecordHandler, ['medical_officer', 'super_admin']);
