-- Medical System Schema Updates
-- Run this after the base schema.sql

USE student_medical_system;

-- Add new fields to students table
ALTER TABLE students
ADD COLUMN IF NOT EXISTS appid VARCHAR(50) NULL COMMENT 'Application ID (3-5 digits)',
ADD COLUMN IF NOT EXISTS campus VARCHAR(100) NULL COMMENT 'Campus location',
ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20) NULL COMMENT 'Academic year (e.g., 2024/2025)',
ADD COLUMN IF NOT EXISTS password VARCHAR(255) NULL COMMENT 'Student login password',
ADD COLUMN IF NOT EXISTS medical_report_id VARCHAR(50) NULL UNIQUE COMMENT 'Unique medical report ID',
ADD COLUMN IF NOT EXISTS report_status ENUM('pending', 'assigned', 'completed') DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS health_percentage INT DEFAULT 0 COMMENT 'Health status percentage',
ADD COLUMN IF NOT EXISTS health_status ENUM('healthy', 'moderately_healthy', 'perfectly_ok') NULL,
ADD INDEX idx_appid (appid),
ADD INDEX idx_campus (campus),
ADD INDEX idx_report_status (report_status),
ADD INDEX idx_medical_report_id (medical_report_id);

-- Add designation and campus fields to users table for admin management
ALTER TABLE users
ADD COLUMN IF NOT EXISTS designation VARCHAR(100) NULL COMMENT 'Job designation',
ADD COLUMN IF NOT EXISTS campus VARCHAR(100) NULL COMMENT 'Assigned campus',
ADD COLUMN IF NOT EXISTS status ENUM('activated', 'invited', 'deactivated') DEFAULT 'activated';

-- Create system logs table
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

-- Create medical report template table (for Oxford standard form)
CREATE TABLE IF NOT EXISTS medical_report_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  template_data JSON NOT NULL COMMENT 'Template structure and fields',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Oxford standard medical report template
INSERT INTO medical_report_templates (name, description, template_data, is_active) VALUES
('Oxford University Medical Report', 'Standard medical examination form based on Oxford University template',
'{
  "sections": [
    {
      "title": "Basic Information",
      "fields": ["weight", "height", "blood_group"]
    },
    {
      "title": "Visual Acuity",
      "fields": ["visual_acuity_le", "visual_acuity_re"]
    },
    {
      "title": "Medical History",
      "fields": ["past_medical_history", "current_chronic_illness", "long_standing_medication", "known_allergies"]
    },
    {
      "title": "Physical Examination",
      "fields": ["respiratory_breast_exam", "cardiovascular_exam", "mental_state_exam"]
    },
    {
      "title": "Additional Notes",
      "fields": ["additional_notes"]
    }
  ]
}',
TRUE);

-- Update medical_records table to include health assessment
ALTER TABLE medical_records
ADD COLUMN IF NOT EXISTS health_percentage INT DEFAULT 0 COMMENT 'Overall health percentage',
ADD COLUMN IF NOT EXISTS health_status ENUM('healthy', 'moderately_healthy', 'perfectly_ok') NULL,
ADD COLUMN IF NOT EXISTS diagnosis TEXT NULL COMMENT 'Medical officer diagnosis';

-- Create view for student accounts with status
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

-- Create view for generated medical report IDs
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
