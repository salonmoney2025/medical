-- Add email field to students table
ALTER TABLE students
ADD COLUMN email VARCHAR(255) DEFAULT NULL AFTER full_name;

-- Add index for email lookups
CREATE INDEX idx_students_email ON students(email);
