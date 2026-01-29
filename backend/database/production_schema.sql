-- Student Medical Records Management System
-- Complete Production Schema (run this on your cloud MySQL database)
-- Compatible with: Aiven MySQL, PlanetScale, Railway, TiDB, AWS RDS, etc.

-- Create database (skip if your provider created it already)
-- CREATE DATABASE IF NOT EXISTS student_medical_system;
-- USE student_medical_system;

-- ============================================================
-- USERS TABLE (Super Admin and Medical Officers)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'medical_officer') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  designation VARCHAR(100) NULL,
  campus VARCHAR(100) NULL,
  status ENUM('activated', 'invited', 'deactivated') DEFAULT 'activated',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- STUDENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appid VARCHAR(50) NULL UNIQUE COMMENT 'Application ID (3-5 digits)',
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  matriculation_number VARCHAR(100) UNIQUE NOT NULL,
  program VARCHAR(255) NOT NULL,
  campus VARCHAR(100) NULL,
  faculty VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  academic_year VARCHAR(20) NULL,
  medical_report_id VARCHAR(50) NULL UNIQUE COMMENT 'Unique medical report ID',
  password VARCHAR(255) NULL COMMENT 'Student login password',
  report_status ENUM('pending', 'assigned', 'completed') DEFAULT 'pending',
  health_percentage INT DEFAULT NULL,
  health_status VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_matriculation (matriculation_number),
  INDEX idx_faculty (faculty),
  INDEX idx_department (department),
  INDEX idx_appid (appid),
  INDEX idx_email (email),
  INDEX idx_campus (campus),
  INDEX idx_medical_report_id (medical_report_id),
  INDEX idx_report_status (report_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- MEDICAL QUESTIONS TABLE (configurable by Super Admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS medical_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_text TEXT NOT NULL,
  field_type ENUM('text', 'textarea', 'dropdown', 'checkbox', 'number') NOT NULL,
  is_required BOOLEAN DEFAULT FALSE,
  options JSON DEFAULT NULL,
  display_order INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_display_order (display_order),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- MEDICAL RECORDS TABLE (main examination records)
-- ============================================================
CREATE TABLE IF NOT EXISTS medical_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  medical_officer_id INT NOT NULL,
  weight DECIMAL(5,2) NULL COMMENT 'Weight in kg',
  height DECIMAL(5,2) NULL COMMENT 'Height in cm',
  visual_acuity_le VARCHAR(50) NULL COMMENT 'Left Eye',
  visual_acuity_re VARCHAR(50) NULL COMMENT 'Right Eye',
  blood_group VARCHAR(10) NULL,
  past_medical_history TEXT NULL,
  current_chronic_illness TEXT NULL,
  long_standing_medication TEXT NULL,
  known_allergies TEXT NULL,
  respiratory_breast_exam TEXT NULL,
  cardiovascular_exam TEXT NULL,
  mental_state_exam TEXT NULL,
  diagnosis TEXT NULL,
  health_percentage INT DEFAULT 0,
  health_status ENUM('healthy', 'moderately_healthy', 'perfectly_ok') NULL,
  additional_notes TEXT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (medical_officer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_student (student_id),
  INDEX idx_medical_officer (medical_officer_id),
  INDEX idx_created_at (created_at),
  INDEX idx_is_completed (is_completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- MEDICAL ANSWERS TABLE (for custom questions)
-- ============================================================
CREATE TABLE IF NOT EXISTS medical_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  record_id INT NOT NULL,
  question_id INT NOT NULL,
  answer_text TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES medical_questions(id) ON DELETE CASCADE,
  INDEX idx_record (record_id),
  INDEX idx_question (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SYSTEM LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS system_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(255) NOT NULL,
  initiator VARCHAR(255) NOT NULL COMMENT 'Email of user who performed action',
  status ENUM('success', 'failure') NOT NULL,
  role VARCHAR(50) NOT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  details TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_action (action),
  INDEX idx_initiator (initiator),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- THEME SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS theme_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value VARCHAR(255) NOT NULL,
  updated_by INT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- MEDICAL REPORT TEMPLATES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS medical_report_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  template_data JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DEFAULT DATA
-- ============================================================

-- Default medical questions
INSERT INTO medical_questions (question_text, field_type, is_required, options, display_order) VALUES
('Weight (kg)', 'number', TRUE, NULL, 1),
('Height (cm)', 'number', TRUE, NULL, 2),
('Visual Acuity - Left Eye (LE)', 'text', TRUE, NULL, 3),
('Visual Acuity - Right Eye (RE)', 'text', TRUE, NULL, 4),
('Blood Group', 'dropdown', FALSE, '["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"]', 5),
('Past Medical History / Current and present chronic illness', 'textarea', FALSE, NULL, 6),
('Long Standing Medication', 'textarea', FALSE, NULL, 7),
('Any Known Allergy', 'textarea', FALSE, NULL, 8),
('Respiratory and Breast Examination (if required)', 'textarea', FALSE, NULL, 9),
('Cardiovascular Examination (Hypertensive or any indication)', 'textarea', FALSE, NULL, 10),
('Mental State Examination', 'textarea', FALSE, NULL, 11);

-- Default theme settings
INSERT INTO theme_settings (setting_key, setting_value) VALUES
  ('primary_color', '#16a34a'),
  ('sidebar_color', '#000000'),
  ('background_color', '#f0f0f0'),
  ('accent_color', '#22c55e')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Oxford standard medical report template
INSERT INTO medical_report_templates (name, description, template_data, is_active) VALUES
('Oxford University Medical Report', 'Standard medical examination form based on Oxford University template',
'{
  "sections": [
    {"title": "Basic Information", "fields": ["weight", "height", "blood_group"]},
    {"title": "Visual Acuity", "fields": ["visual_acuity_le", "visual_acuity_re"]},
    {"title": "Medical History", "fields": ["past_medical_history", "current_chronic_illness", "long_standing_medication", "known_allergies"]},
    {"title": "Physical Examination", "fields": ["respiratory_breast_exam", "cardiovascular_exam", "mental_state_exam"]},
    {"title": "Additional Notes", "fields": ["additional_notes"]}
  ]
}',
TRUE);

-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW medical_records_view AS
SELECT
  mr.*,
  s.name as student_name,
  s.matriculation_number,
  s.program,
  s.faculty,
  s.department,
  u.full_name as medical_officer_name,
  u.email as medical_officer_email
FROM medical_records mr
JOIN students s ON mr.student_id = s.id
JOIN users u ON mr.medical_officer_id = u.id;

CREATE OR REPLACE VIEW student_accounts_view AS
SELECT
  s.id,
  s.appid,
  s.name,
  s.matriculation_number,
  s.program,
  s.faculty,
  s.campus,
  s.academic_year,
  s.report_status,
  s.medical_report_id,
  s.password IS NOT NULL as has_password,
  mr.id as medical_record_id,
  mr.is_completed as report_completed,
  mr.completed_at as report_completion_date
FROM students s
LEFT JOIN medical_records mr ON s.id = mr.student_id
ORDER BY s.created_at DESC;

CREATE OR REPLACE VIEW generated_reports_view AS
SELECT
  s.medical_report_id as id_mat,
  s.appid,
  s.name as full_name,
  s.program,
  s.campus,
  s.report_status as mode,
  s.created_at,
  s.updated_at
FROM students s
WHERE s.medical_report_id IS NOT NULL
ORDER BY s.created_at DESC;
