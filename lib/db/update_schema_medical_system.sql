-- Update students table for Medical Report System
-- Note: Columns may already exist, so we'll add them one by one

-- Add appid column (Application ID)
ALTER TABLE students ADD COLUMN appid VARCHAR(20) AFTER id;

-- Add email column
ALTER TABLE students ADD COLUMN email VARCHAR(255) AFTER name;

-- Add campus column
ALTER TABLE students ADD COLUMN campus VARCHAR(100) AFTER program;

-- Add academic_year column
ALTER TABLE students ADD COLUMN academic_year VARCHAR(20) AFTER department;

-- Add medical_report_id column
ALTER TABLE students ADD COLUMN medical_report_id VARCHAR(20) AFTER academic_year;

-- Add password column (for student login)
ALTER TABLE students ADD COLUMN password VARCHAR(255) AFTER medical_report_id;

-- Add report_status column
ALTER TABLE students ADD COLUMN report_status ENUM('pending', 'assigned', 'completed') DEFAULT 'pending' AFTER password;

-- Add health_percentage column
ALTER TABLE students ADD COLUMN health_percentage INT DEFAULT NULL AFTER report_status;

-- Add health_status column
ALTER TABLE students ADD COLUMN health_status VARCHAR(50) DEFAULT NULL AFTER health_percentage;

-- Add indexes for better performance
CREATE INDEX idx_students_appid ON students(appid);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_campus ON students(campus);
CREATE INDEX idx_students_medical_report_id ON students(medical_report_id);
CREATE INDEX idx_students_report_status ON students(report_status);

-- Make appid unique
ALTER TABLE students ADD UNIQUE INDEX unique_appid (appid);

SELECT 'Schema updated successfully!' as message;
