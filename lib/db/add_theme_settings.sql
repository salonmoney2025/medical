-- Theme Settings Table
-- Allows super admin to configure the system's look and feel

USE student_medical_system;

CREATE TABLE IF NOT EXISTS theme_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value VARCHAR(255) NOT NULL,
  updated_by INT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default theme values
INSERT INTO theme_settings (setting_key, setting_value) VALUES
  ('primary_color', '#16a34a'),
  ('sidebar_color', '#000000'),
  ('background_color', '#f0f0f0'),
  ('accent_color', '#22c55e')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
