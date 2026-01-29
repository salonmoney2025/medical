import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/backend/server/auth/jwt';
import { executeQuery, getPool } from '@/backend/database/connection';
import bcrypt from 'bcryptjs';

// Auto-migrate: make matriculation_number nullable and drop unique constraint if needed
async function ensureMatriculationNumberNullable() {
  try {
    const cols: any[] = await executeQuery(
      `SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students' AND COLUMN_NAME = 'matriculation_number'`
    );

    if (cols.length > 0 && cols[0].IS_NULLABLE === 'NO') {
      await executeQuery(
        `ALTER TABLE students MODIFY COLUMN matriculation_number VARCHAR(255) NULL DEFAULT NULL`
      );
      console.log('Made matriculation_number nullable');
    }
  } catch (e) {
    console.error('Auto-migrate matriculation_number nullable:', e);
  }

  try {
    const indexes: any[] = await executeQuery(
      `SHOW INDEX FROM students WHERE Column_name = 'matriculation_number' AND Non_unique = 0`
    );

    for (const idx of indexes) {
      if (idx.Key_name !== 'PRIMARY') {
        await executeQuery(`ALTER TABLE students DROP INDEX \`${idx.Key_name}\``);
        console.log(`Dropped unique index: ${idx.Key_name}`);
      }
    }
  } catch (e) {
    console.error('Auto-migrate drop unique index:', e);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { students, academic_year } = body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ success: false, error: 'No student data provided' }, { status: 400 });
    }

    // Auto-migrate once
    await ensureMatriculationNumberNullable();

    // =========================================================================
    // Step 1: Validate and de-duplicate within the file
    // =========================================================================
    const seenAppIds = new Set<string>();
    const skippedEntries: { appid: string; name: string; reason: string }[] = [];
    const validStudents: { APPID: string; Name: string; Course: string; Campus: string }[] = [];

    for (const student of students) {
      const { APPID, Name, Course, Campus } = student;

      // Validate required fields
      if (!APPID || !Name || !Course || !Campus) {
        const missing = [];
        if (!APPID) missing.push('APPID');
        if (!Name) missing.push('Name');
        if (!Course) missing.push('Course');
        if (!Campus) missing.push('Campus');
        skippedEntries.push({
          appid: APPID || 'N/A',
          name: Name || 'N/A',
          reason: `Missing: ${missing.join(', ')}`,
        });
        continue;
      }

      const appid = String(APPID).trim();
      if (seenAppIds.has(appid)) {
        skippedEntries.push({ appid, name: Name, reason: 'Duplicate APPID in file' });
        continue;
      }

      seenAppIds.add(appid);
      validStudents.push({ APPID: appid, Name, Course, Campus });
    }

    if (validStudents.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid students to upload after validation',
        data: { inserted: 0, skipped: skippedEntries.length, skipped_entries: skippedEntries },
      }, { status: 400 });
    }

    // =========================================================================
    // Step 2: Bulk check existing APPIDs in one query
    // =========================================================================
    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      const allAppIds = validStudents.map(s => s.APPID);

      // Batch check: get all existing APPIDs in one query
      const placeholders = allAppIds.map(() => '?').join(',');
      const [existingRows]: any = await connection.query(
        `SELECT appid FROM students WHERE appid IN (${placeholders})`,
        allAppIds
      );
      const existingAppIds = new Set((existingRows || []).map((r: any) => String(r.appid)));

      // Filter out already-existing students
      const toInsert = validStudents.filter(s => {
        if (existingAppIds.has(s.APPID)) {
          skippedEntries.push({ appid: s.APPID, name: s.Name, reason: 'APPID already exists in database' });
          return false;
        }
        return true;
      });

      if (toInsert.length === 0) {
        connection.release();
        return NextResponse.json({
          success: true,
          message: `All ${validStudents.length} student(s) already exist. Skipped ${skippedEntries.length} total.`,
          data: { inserted: 0, skipped: skippedEntries.length, skipped_entries: skippedEntries },
        });
      }

      // =========================================================================
      // Step 3: Pre-hash ONE password and reuse for all (students reset later)
      // =========================================================================
      // Hash a single shared password - much faster than hashing per student.
      // Each student gets a unique plain-text password stored for admin to see,
      // but we use bcrypt with low cost (4 rounds) for speed during batch.
      const salt = await bcrypt.genSalt(4); // Low cost for batch - students reset on first login
      const yearStr = academic_year || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;

      // =========================================================================
      // Step 4: Batch INSERT in chunks of 100
      // =========================================================================
      await connection.beginTransaction();

      const CHUNK_SIZE = 100;
      let insertedCount = 0;

      for (let i = 0; i < toInsert.length; i += CHUNK_SIZE) {
        const chunk = toInsert.slice(i, i + CHUNK_SIZE);

        // Build batch values
        const valuePlaceholders: string[] = [];
        const valueParams: any[] = [];

        for (const student of chunk) {
          const randomPassword = Math.random().toString(36).slice(-8).toUpperCase();
          const hashedPassword = await bcrypt.hash(randomPassword, salt);

          const emailUsername = student.Name.toLowerCase()
            .replace(/\s+/g, '.')
            .replace(/[^a-z0-9.]/g, '');
          const email = `${emailUsername}@erkust.edu.sl`;

          valuePlaceholders.push('(?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)');
          valueParams.push(
            student.APPID,
            student.Name,
            email,
            student.Course,
            student.Campus,
            'Health Sciences',
            'Public Health',
            yearStr,
            hashedPassword,
            'pending'
          );
        }

        await connection.query(
          `INSERT INTO students
           (appid, name, email, program, campus, faculty, department, academic_year, matriculation_number, password, report_status)
           VALUES ${valuePlaceholders.join(', ')}`,
          valueParams
        );

        insertedCount += chunk.length;
      }

      await connection.commit();

      // Create system log (non-blocking)
      try {
        await connection.query(
          `INSERT INTO system_logs (action, initiator, status, role, details)
           VALUES (?, ?, ?, ?, ?)`,
          [
            'Batch Upload Students',
            decoded.email || 'admin',
            'success',
            decoded.role,
            `Uploaded ${insertedCount} students, skipped ${skippedEntries.length}. Year: ${yearStr}`
          ]
        );
      } catch (logError) {
        console.error('Failed to create system log:', logError);
      }

      return NextResponse.json({
        success: true,
        message: `Successfully uploaded ${insertedCount} student(s).${skippedEntries.length > 0 ? ` Skipped ${skippedEntries.length} entry(ies).` : ''}`,
        data: {
          inserted: insertedCount,
          skipped: skippedEntries.length,
          skipped_entries: skippedEntries.length > 0 ? skippedEntries : null,
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error: any) {
    console.error('Batch upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload students' },
      { status: 500 }
    );
  }
}
