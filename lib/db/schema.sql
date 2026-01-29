-- Student Medical Records Management System Database Schema

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS student_medical_system;
USE student_medical_system;

-- Users table (Super Admin and Medical Officers)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'medical_officer') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  matriculation_number VARCHAR(100) UNIQUE NOT NULL,
  program VARCHAR(255) NOT NULL,
  faculty VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_matriculation (matriculation_number),
  INDEX idx_faculty (faculty),
  INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Medical Questions table (configurable by Super Admin)
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

-- Medical Records table (main examination records)
CREATE TABLE IF NOT EXISTS medical_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  medical_officer_id INT NOT NULL,

  -- Basic measurements
  weight DECIMAL(5,2) NULL COMMENT 'Weight in kg',
  height DECIMAL(5,2) NULL COMMENT 'Height in cm',

  -- Visual Acuity
  visual_acuity_le VARCHAR(50) NULL COMMENT 'Left Eye',
  visual_acuity_re VARCHAR(50) NULL COMMENT 'Right Eye',

  -- Blood group
  blood_group VARCHAR(10) NULL,

  -- Medical history fields
  past_medical_history TEXT NULL,
  current_chronic_illness TEXT NULL,
  long_standing_medication TEXT NULL,
  known_allergies TEXT NULL,

  -- Examination fields
  respiratory_breast_exam TEXT NULL,
  cardiovascular_exam TEXT NULL,
  mental_state_exam TEXT NULL,

  -- Additional notes
  additional_notes TEXT NULL,

  -- Record metadata
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

-- Medical Answers table (for custom questions)
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

-- Insert default medical questions
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

-- NOTE: Do NOT insert the super admin here.
-- Use the /api/setup endpoint after starting the app to create the admin account
-- with a properly hashed password.

-- Create view for complete medical records with student info
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
