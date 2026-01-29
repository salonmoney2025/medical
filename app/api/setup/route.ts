import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, getPool } from '@/backend/database/connection';
import { hashPassword } from '@/backend/server/auth/password';
import mysql from 'mysql2/promise';

// POST - One-time setup: create database, tables, and super admin account
export async function POST(request: NextRequest) {
  try {
    // For local development with individual DB vars, try to create the database
    // For cloud providers using DATABASE_URL, the database already exists
    if (!process.env.DATABASE_URL) {
      const dbName = process.env.DB_NAME || 'student_medical_system';
      try {
        const tempConnection = await mysql.createConnection({
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '3306', 10),
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
        });
        await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await tempConnection.end();
      } catch (dbCreateError) {
        console.log('Database may already exist, continuing...', dbCreateError);
      }
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      // Create users table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          role ENUM('super_admin', 'medical_officer') NOT NULL DEFAULT 'medical_officer',
          is_active BOOLEAN DEFAULT TRUE,
          designation VARCHAR(255) DEFAULT NULL,
          campus VARCHAR(255) DEFAULT NULL,
          status VARCHAR(50) DEFAULT 'activated',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Create students table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS students (
          id INT AUTO_INCREMENT PRIMARY KEY,
          appid VARCHAR(50) DEFAULT NULL,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) DEFAULT NULL,
          matriculation_number VARCHAR(100) DEFAULT NULL,
          program VARCHAR(255) DEFAULT NULL,
          faculty VARCHAR(255) DEFAULT NULL,
          department VARCHAR(255) DEFAULT NULL,
          campus VARCHAR(255) DEFAULT NULL,
          academic_year VARCHAR(50) DEFAULT NULL,
          password VARCHAR(255) DEFAULT NULL,
          medical_report_id VARCHAR(50) DEFAULT NULL,
          report_status ENUM('pending', 'assigned', 'completed') DEFAULT 'pending',
          health_percentage INT DEFAULT NULL,
          health_status VARCHAR(100) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_appid (appid),
          INDEX idx_matriculation (matriculation_number),
          INDEX idx_medical_report_id (medical_report_id),
          INDEX idx_name (name),
          INDEX idx_campus (campus),
          INDEX idx_report_status (report_status)
        )
      `);

      // Create medical_records table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS medical_records (
          id INT AUTO_INCREMENT PRIMARY KEY,
          student_id INT NOT NULL,
          medical_officer_id INT NOT NULL,
          weight DECIMAL(5,2) DEFAULT NULL,
          height DECIMAL(5,2) DEFAULT NULL,
          visual_acuity_le VARCHAR(50) DEFAULT NULL,
          visual_acuity_re VARCHAR(50) DEFAULT NULL,
          blood_group VARCHAR(10) DEFAULT NULL,
          past_medical_history TEXT DEFAULT NULL,
          current_chronic_illness TEXT DEFAULT NULL,
          long_standing_medication TEXT DEFAULT NULL,
          known_allergies TEXT DEFAULT NULL,
          respiratory_breast_exam TEXT DEFAULT NULL,
          cardiovascular_exam TEXT DEFAULT NULL,
          mental_state_exam TEXT DEFAULT NULL,
          additional_notes TEXT DEFAULT NULL,
          diagnosis TEXT DEFAULT NULL,
          health_percentage INT DEFAULT NULL,
          health_status VARCHAR(100) DEFAULT NULL,
          is_completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          completed_at TIMESTAMP NULL DEFAULT NULL,
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
          FOREIGN KEY (medical_officer_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_student_id (student_id),
          INDEX idx_officer_id (medical_officer_id)
        )
      `);

      // Create system_logs table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS system_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          action VARCHAR(255) NOT NULL,
          initiator VARCHAR(255) DEFAULT NULL,
          status VARCHAR(50) DEFAULT 'success',
          role VARCHAR(50) DEFAULT NULL,
          ip_address VARCHAR(50) DEFAULT NULL,
          user_agent TEXT DEFAULT NULL,
          details TEXT DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_action (action),
          INDEX idx_initiator (initiator),
          INDEX idx_created_at (created_at)
        )
      `);

      // Create theme_settings table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS theme_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          setting_key VARCHAR(100) UNIQUE NOT NULL,
          setting_value VARCHAR(255) NOT NULL,
          updated_by INT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
        )
      `);

      // Insert default theme settings
      try {
        await connection.query(`
          INSERT INTO theme_settings (setting_key, setting_value) VALUES
            ('primary_color', '#16a34a'),
            ('sidebar_color', '#000000'),
            ('background_color', '#f0f0f0'),
            ('accent_color', '#22c55e')
          ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
        `);
      } catch (e) {
        // Ignore if already exists
      }

      // Ensure users table has all required columns (for pre-existing tables)
      const userColumns = [
        { name: 'designation', definition: 'VARCHAR(255) DEFAULT NULL' },
        { name: 'campus', definition: 'VARCHAR(255) DEFAULT NULL' },
        { name: 'status', definition: "VARCHAR(50) DEFAULT 'activated'" },
        { name: 'is_active', definition: 'BOOLEAN DEFAULT TRUE' },
      ];
      for (const col of userColumns) {
        try {
          await connection.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.definition}`);
        } catch (e: any) {
          // Column already exists - ignore error code 1060
          if (e.errno !== 1060) console.log(`Note: ${col.name}:`, e.message);
        }
      }

      // Ensure students table has all required columns
      const studentColumns = [
        { name: 'appid', definition: 'VARCHAR(50) DEFAULT NULL' },
        { name: 'name', definition: 'VARCHAR(255) DEFAULT NULL' },
        { name: 'email', definition: 'VARCHAR(255) DEFAULT NULL' },
        { name: 'campus', definition: 'VARCHAR(255) DEFAULT NULL' },
        { name: 'academic_year', definition: 'VARCHAR(50) DEFAULT NULL' },
        { name: 'password', definition: 'VARCHAR(255) DEFAULT NULL' },
        { name: 'medical_report_id', definition: 'VARCHAR(50) DEFAULT NULL' },
        { name: 'report_status', definition: "VARCHAR(50) DEFAULT 'pending'" },
        { name: 'health_percentage', definition: 'INT DEFAULT NULL' },
        { name: 'health_status', definition: 'VARCHAR(100) DEFAULT NULL' },
      ];
      for (const col of studentColumns) {
        try {
          await connection.query(`ALTER TABLE students ADD COLUMN ${col.name} ${col.definition}`);
        } catch (e: any) {
          if (e.errno !== 1060) console.log(`Note: ${col.name}:`, e.message);
        }
      }

      // If students table has 'full_name' but not 'name' data, copy it
      try {
        const [cols]: any = await connection.query(`SHOW COLUMNS FROM students LIKE 'full_name'`);
        if (cols.length > 0) {
          // full_name column exists, copy data to name if name is empty
          await connection.query(`UPDATE students SET name = full_name WHERE name IS NULL OR name = ''`);
        }
      } catch (e) {
        // Ignore
      }

      // Ensure system_logs table has all required columns
      const logColumns = [
        { name: 'ip_address', definition: 'VARCHAR(50) DEFAULT NULL' },
        { name: 'user_agent', definition: 'TEXT DEFAULT NULL' },
        { name: 'details', definition: 'TEXT DEFAULT NULL' },
      ];
      for (const col of logColumns) {
        try {
          await connection.query(`ALTER TABLE system_logs ADD COLUMN ${col.name} ${col.definition}`);
        } catch (e: any) {
          if (e.errno !== 1060) console.log(`Note: ${col.name}:`, e.message);
        }
      }

      connection.release();
    } catch (tableError) {
      connection.release();
      throw tableError;
    }

    // Create super admin account
    const hashedPassword = await hashPassword('Admin@123');

    // Check if a super admin already exists
    const existing = await executeQuery(
      'SELECT id FROM users WHERE role = ?',
      ['super_admin']
    );

    if (existing && existing.length > 0) {
      // Update existing super admin with new credentials
      await executeQuery(
        `UPDATE users SET email = ?, password = ?, full_name = ? WHERE role = ?`,
        ['superadmin@ebkustsl.edu.sl', hashedPassword, 'Super Administrator', 'super_admin']
      );
    } else {
      // Create new super admin
      await executeQuery(
        `INSERT INTO users (email, password, full_name, role, designation, campus, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['superadmin@ebkustsl.edu.sl', hashedPassword, 'Super Administrator', 'super_admin', 'System Administrator', 'University Secretariat', 'activated']
      );
    }

    // Log the setup action
    try {
      await executeQuery(
        `INSERT INTO system_logs (action, initiator, status, role, details) VALUES (?, ?, ?, ?, ?)`,
        ['System Setup', 'system', 'success', 'super_admin', 'Database tables created and super admin account initialized']
      );
    } catch (logError) {
      // Non-critical, continue even if logging fails
      console.error('Failed to create setup log:', logError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Database setup completed successfully. All tables created and super admin account initialized.',
        credentials: {
          email: 'superadmin@ebkustsl.edu.sl',
          password: 'Admin@123',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Setup failed. Make sure the database is running and accessible.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET - Check setup status
export async function GET(request: NextRequest) {
  try {
    // Check if tables exist
    const tables: Record<string, boolean> = {};

    const tableNames = ['users', 'students', 'medical_records', 'system_logs', 'theme_settings'];
    for (const tableName of tableNames) {
      try {
        await executeQuery(`SELECT 1 FROM ${tableName} LIMIT 1`);
        tables[tableName] = true;
      } catch {
        tables[tableName] = false;
      }
    }

    // Check if super admin exists
    let superAdminExists = false;
    try {
      const result = await executeQuery('SELECT id FROM users WHERE role = ?', ['super_admin']);
      superAdminExists = result && result.length > 0;
    } catch {
      superAdminExists = false;
    }

    // Get counts
    const counts: Record<string, number> = {};
    for (const tableName of tableNames) {
      if (tables[tableName]) {
        try {
          const result = await executeQuery(`SELECT COUNT(*) as count FROM ${tableName}`);
          counts[tableName] = result[0]?.count || 0;
        } catch {
          counts[tableName] = 0;
        }
      } else {
        counts[tableName] = 0;
      }
    }

    const allTablesExist = Object.values(tables).every(Boolean);

    return NextResponse.json({
      success: true,
      data: {
        setupComplete: allTablesExist && superAdminExists,
        tables,
        counts,
        superAdminExists,
      },
    });
  } catch (error) {
    console.error('Setup check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check setup status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
