// User Types
export type UserRole = 'super_admin' | 'medical_officer';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: Omit<User, 'password'>;
  token?: string;
  message?: string;
}

// Student Types
export interface Student {
  id: number;
  appid?: string;
  name: string;
  email?: string;
  matriculation_number: string;
  program: string;
  campus?: string;
  faculty: string;
  department: string;
  academic_year?: string;
  medical_report_id?: string;
  password?: string;
  report_status?: 'pending' | 'assigned' | 'completed';
  health_percentage?: number;
  health_status?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateStudentDto {
  name: string;
  matriculation_number: string;
  program: string;
  faculty: string;
  department: string;
}

export interface StudentUploadData {
  name: string;
  matriculation_number: string;
  program: string;
  faculty: string;
  department: string;
}

export interface ExcelUploadResult {
  success: boolean;
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    matriculation_number: string;
    error: string;
  }>;
}

// Medical Question Types
export type QuestionFieldType = 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'number';

export interface MedicalQuestion {
  id: number;
  question_text: string;
  field_type: QuestionFieldType;
  is_required: boolean;
  options: string[] | null;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateQuestionDto {
  question_text: string;
  field_type: QuestionFieldType;
  is_required: boolean;
  options?: string[];
  display_order: number;
}

export interface UpdateQuestionDto extends Partial<CreateQuestionDto> {
  id: number;
}

// Medical Record Types
export interface MedicalRecord {
  id: number;
  student_id: number;
  medical_officer_id: number;

  // Basic measurements
  weight: number | null;
  height: number | null;

  // Visual Acuity
  visual_acuity_le: string | null;
  visual_acuity_re: string | null;

  // Blood group
  blood_group: string | null;

  // Medical history
  past_medical_history: string | null;
  current_chronic_illness: string | null;
  long_standing_medication: string | null;
  known_allergies: string | null;

  // Examinations
  respiratory_breast_exam: string | null;
  cardiovascular_exam: string | null;
  mental_state_exam: string | null;

  // Additional notes
  additional_notes: string | null;

  // Metadata
  is_completed: boolean;
  created_at: Date;
  updated_at: Date;
  completed_at: Date | null;
}

export interface MedicalRecordWithStudent extends MedicalRecord {
  student_name: string;
  matriculation_number: string;
  program: string;
  faculty: string;
  department: string;
  medical_officer_name: string;
  medical_officer_email: string;
}

export interface CreateMedicalRecordDto {
  student_id: number;
  medical_officer_id: number;
  weight?: number;
  height?: number;
  visual_acuity_le?: string;
  visual_acuity_re?: string;
  blood_group?: string;
  past_medical_history?: string;
  current_chronic_illness?: string;
  long_standing_medication?: string;
  known_allergies?: string;
  respiratory_breast_exam?: string;
  cardiovascular_exam?: string;
  mental_state_exam?: string;
  additional_notes?: string;
}

export interface UpdateMedicalRecordDto extends Partial<CreateMedicalRecordDto> {
  id: number;
  is_completed?: boolean;
}

// Medical Answer Types (for custom questions)
export interface MedicalAnswer {
  id: number;
  record_id: number;
  question_id: number;
  answer_text: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAnswerDto {
  record_id: number;
  question_id: number;
  answer_text: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Search Types
export interface StudentSearchResult {
  found: boolean;
  student?: Student;
  medical_records?: MedicalRecord[];
  message?: string;
}

// Dashboard Stats Types
export interface DashboardStats {
  total_students: number;
  total_medical_officers: number;
  total_records: number;
  completed_records: number;
  pending_records: number;
  records_today: number;
}

// Form Types
export interface MedicalFormData {
  [key: string]: any;
  weight?: number;
  height?: number;
  visual_acuity_le?: string;
  visual_acuity_re?: string;
  blood_group?: string;
  past_medical_history?: string;
  current_chronic_illness?: string;
  long_standing_medication?: string;
  known_allergies?: string;
  respiratory_breast_exam?: string;
  cardiovascular_exam?: string;
  mental_state_exam?: string;
  additional_notes?: string;
}
