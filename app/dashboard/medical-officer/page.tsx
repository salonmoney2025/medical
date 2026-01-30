'use client';

import { useState, useCallback, useMemo } from 'react';
import { DashboardLayout } from '@/frontend/components/dashboard/DashboardLayout';
import { Card } from '@/frontend/components/ui/Card';
import { Input } from '@/frontend/components/ui/Input';
import { Button } from '@/frontend/components/ui/Button';
import { useToast } from '@/frontend/components/ui/Toast';
import { Student, MedicalFormData } from '@/backend/server/types';

// ============================================================================
// Constants & Configuration
// ============================================================================

const VISUAL_ACUITY_PRESETS = ['6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60', '20/20', '20/40', '20/200'] as const;

const BLOOD_GROUPS = [
  { value: '', label: 'SELECT BLOOD GROUP' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
  { value: 'Unknown', label: 'Unknown' },
] as const;

const HEALTH_STATUSES = [
  { value: '', label: 'Select Status' },
  { value: 'healthy', label: 'Healthy' },
  { value: 'moderately_healthy', label: 'Moderately Healthy' },
  { value: 'perfectly_ok', label: 'Perfectly OK' },
] as const;

// ============================================================================
// Type Definitions
// ============================================================================

interface FormErrors {
  weight?: string;
  height?: string;
  visual_acuity_le?: string;
  visual_acuity_re?: string;
  health_percentage?: string;
  health_status?: string;
  diagnosis?: string;
}

// ============================================================================
// Reusable Form Components
// ============================================================================

/**
 * NumericInputField - Reusable component for number inputs with validation
 */
interface NumericInputFieldProps {
  label: string;
  name: keyof Pick<MedicalFormData, 'weight' | 'height' | 'health_percentage'>;
  value: string | number | undefined;
  onChange: (name: string, value: string) => void;
  min?: number;
  max?: number;
  step?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

function NumericInputField({
  label,
  name,
  value,
  onChange,
  min,
  max,
  step = '0.01',
  placeholder,
  required,
  error,
}: NumericInputFieldProps) {
  return (
    <Input
      type="number"
      step={step}
      label={label}
      placeholder={placeholder}
      value={value || ''}
      onChange={(e) => onChange(name, e.target.value)}
      min={min}
      max={max}
      required={required}
      error={error}
      aria-describedby={error ? `${name}-error` : undefined}
    />
  );
}

/**
 * VisualAcuityInput - Specialized input for visual acuity with preset options
 */
interface VisualAcuityInputProps {
  label: string;
  name: 'visual_acuity_le' | 'visual_acuity_re';
  value: string | undefined;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  error?: string;
}

function VisualAcuityInput({
  label,
  name,
  value,
  onChange,
  placeholder = 'e.g., 6/6, 20/20',
  error,
}: VisualAcuityInputProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, e.target.value);
  }, [name, onChange]);

  return (
    <div className="w-full">
      <label className="block text-black text-sm font-medium mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          list={`${name}-presets`}
          className={`w-full px-4 py-2 bg-secondary-mediumblack text-black placeholder-black-400 border rounded focus:outline-none focus:border-primary-gold transition ${
            error ? 'border-red-500' : 'border-secondary-lightblack'
          }`}
          placeholder={placeholder}
          value={value || ''}
          onChange={handleChange}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        <datalist id={`${name}-presets`}>
          {VISUAL_ACUITY_PRESETS.map((preset) => (
            <option key={preset} value={preset} />
          ))}
        </datalist>
      </div>
      {error && <p className="mt-1 text-sm text-red-400" id={`${name}-error`}>{error}</p>}
    </div>
  );
}

/**
 * FormRow - Container for grouping form fields in a row
 */
interface FormRowProps {
  children: React.ReactNode;
  className?: string;
}

function FormRow({ children, className = 'grid grid-cols-2 gap-4' }: FormRowProps) {
  return <div className={className}>{children}</div>;
}

/**
 * FormSection - Container for grouping related form fields
 */
interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-black mb-2">{title}</h3>
      {description && <p className="text-sm text-black mb-4">{description}</p>}
      {children}
    </div>
  );
}

export default function MedicalOfficerDashboard() {
  const { toast } = useToast();
  const [matriculationNumber, setMatriculationNumber] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MedicalFormData>({});
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [successData, setSuccessData] = useState<{ medical_report_id: string; student_password: string; appid: string } | null>(null);

  // ============================================================================
  // Form Validation
  // ============================================================================

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // Weight validation (typically 30-300 kg)
    if (formData.weight !== undefined && formData.weight !== null) {
      const weight = Number(formData.weight);
      if (isNaN(weight) || weight < 20 || weight > 300) {
        errors.weight = 'Weight must be between 20-300 kg';
        isValid = false;
      }
    }

    // Height validation (typically 100-250 cm)
    if (formData.height !== undefined && formData.height !== null) {
      const height = Number(formData.height);
      if (isNaN(height) || height < 50 || height > 250) {
        errors.height = 'Height must be between 50-250 cm';
        isValid = false;
      }
    }

    // Health percentage validation
    if (formData.health_percentage !== undefined && formData.health_percentage !== '') {
      const healthPercentage = Number(formData.health_percentage);
      if (isNaN(healthPercentage) || healthPercentage < 0 || healthPercentage > 100) {
        errors.health_percentage = 'Health percentage must be between 0-100';
        isValid = false;
      }
    }

    // Health status validation
    if (!formData.health_status) {
      errors.health_status = 'Please select a health status';
      isValid = false;
    }

    // Diagnosis validation (required field)
    if (!formData.diagnosis?.trim()) {
      errors.diagnosis = 'Diagnosis is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  }, [formData]);

  // Memoized form change handler for performance
  const handleFormChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear related error when field is modified
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      if (field in newErrors) {
        delete newErrors[field as keyof FormErrors];
      }
      return newErrors;
    });
  }, []);

  const handleSearch = async () => {
    const searchTerm = matriculationNumber.trim();
    if (!searchTerm) {
      toast('Please enter a Student ID', 'error');
      return;
    }

    setLoading(true);
    setStudent(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/students?appid=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setStudent(data.data[0]);
        setFormData({});
        setFormErrors({});
        toast('Student found successfully', 'success');
      } else {
        toast('Student not found. Please check the Student ID and try again.', 'error');
      }
    } catch (err) {
      toast('Failed to search for student', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      toast('Please fix the form errors before submitting', 'error');
      const firstErrorElement = document.querySelector('[aria-invalid="true"]');
      firstErrorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/medical-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          student_id: student?.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessData({
          medical_report_id: data.data.medical_report_id,
          student_password: data.data.student_password,
          appid: student?.appid || matriculationNumber,
        });
        setStudent(null);
        setMatriculationNumber('');
        setFormData({});
        setFormErrors({});
      } else {
        toast(data.error || 'Failed to submit medical record', 'error');
      }
    } catch (err) {
      toast('An error occurred while submitting', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Memoized clear form handler
  const handleClearForm = useCallback(() => {
    setStudent(null);
    setMatriculationNumber('');
    setFormData({});
    setFormErrors({});
  }, []);

  return (
    <DashboardLayout title="EBKUSTSL MEDICAL OFFICER DASHBOARD" role="medical_officer">
      <div className="space-y-6">
        {/* Search Section */}
        <Card title="Search Student">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter Student APPID"
                value={matriculationNumber}
                onChange={(e) => setMatriculationNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-2 bg-secondary-mediumblack text-black placeholder-black-400 border border-secondary-lightblack rounded focus:outline-none focus:border-primary-gold transition"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </Card>

        {/* Student Information */}
        {student && (
          <>
            <Card title="STUDENT INFORMATION">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-black text-sm">NAME</p>
                  <p className="text-black font-medium">{student.name}</p>
                </div>
                <div>
                  <p className="text-black text-sm">MATRICULATION NUMBER</p>
                  <p className="text-black font-medium">{student.matriculation_number}</p>
                </div>
                <div>
                  <p className="text-black text-sm">COURSE</p>
                  <p className="text-black">{student.program}</p>
                </div>
                <div>
                  <p className="text-black text-sm">FACULTY</p>
                  <p className="text-black">{student.faculty}</p>
                </div>
                <div>
                  <p className="text-black text-sm">DEPARTMENT</p>
                  <p className="text-black">{student.department}</p>
                </div>
              </div>
            </Card>

            {/* Medical Examination Form - Improved with reusable components */}
            <Card title="Medical Examination Form">
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Physical Measurements Section */}
                <FormSection title="Physical Measurements" description="Basic health metrics for the student">
                  <FormRow>
                    <NumericInputField
                      label="Weight (kg)"
                      name="weight"
                      value={formData.weight}
                      onChange={handleFormChange}
                      min={20}
                      max={300}
                      step="0.1"
                      placeholder="e.g., 70.5"
                      error={formErrors.weight}
                    />
                    <NumericInputField
                      label="Height (cm)"
                      name="height"
                      value={formData.height}
                      onChange={handleFormChange}
                      min={50}
                      max={250}
                      step="0.1"
                      placeholder="e.g., 175"
                      error={formErrors.height}
                    />
                  </FormRow>
                </FormSection>

                {/* Visual Acuity Section */}
                <FormSection title="Visual Acuity" description="Visual examination results for both eyes">
                  <FormRow>
                    <VisualAcuityInput
                      label="Visual Acuity - Left Eye (LE)"
                      name="visual_acuity_le"
                      value={formData.visual_acuity_le}
                      onChange={handleFormChange}
                      error={formErrors.visual_acuity_le}
                    />
                    <VisualAcuityInput
                      label="Visual Acuity - Right Eye (RE)"
                      name="visual_acuity_re"
                      value={formData.visual_acuity_re}
                      onChange={handleFormChange}
                      error={formErrors.visual_acuity_re}
                    />
                  </FormRow>
                </FormSection>

                {/* Blood Group Section */}
                <FormSection title="Blood Group" description="Blood type information for medical records">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-black text-sm font-medium mb-2">
                        Blood Group
                      </label>
                      <select
                        value={formData.blood_group || ''}
                        onChange={(e) => handleFormChange('blood_group', e.target.value)}
                        className="w-full px-4 py-2 bg-secondary-mediumblack text-black border border-secondary-lightblack rounded focus:outline-none focus:border-primary-gold transition"
                      >
                        {BLOOD_GROUPS.map((bg) => (
                          <option key={bg.value} value={bg.value}>
                            {bg.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </FormSection>

                {/* Health Status Section */}
                <FormSection title="Health Assessment" description="Overall health evaluation and diagnosis">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-black text-sm font-medium mb-2">
                        Health Status
                      </label>
                      <select
                        value={formData.health_status || ''}
                        onChange={(e) => handleFormChange('health_status', e.target.value)}
                        className="w-full px-4 py-2 bg-secondary-mediumblack text-black border border-secondary-lightblack rounded-lg focus:outline-none focus:border-primary-gold transition"
                      >
                        {HEALTH_STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      {formErrors.health_status && (
                        <p className="mt-1 text-sm text-red-400">{formErrors.health_status}</p>
                      )}
                    </div>

                    {/* Health Percentage */}
                    <NumericInputField
                      label="Health Percentage (%)"
                      name="health_percentage"
                      value={formData.health_percentage}
                      onChange={handleFormChange}
                      min={0}
                      max={100}
                      step="1"
                      placeholder="e.g., 95"
                      error={formErrors.health_percentage}
                    />

                    {/* Diagnosis Section */}
                    <div>
                      <label className="block text-black text-sm font-medium mb-2">
                        Medical Diagnosis
                      </label>
                      <textarea
                        value={formData.diagnosis || ''}
                        onChange={(e) => handleFormChange('diagnosis', e.target.value)}
                        placeholder="Enter detailed medical diagnosis..."
                        className="w-full px-4 py-2 bg-secondary-mediumblack text-black placeholder-black-400 border border-secondary-lightblack rounded-lg focus:outline-none focus:border-primary-gold transition resize-y min-h-[120px]"
                        aria-invalid={!!formErrors.diagnosis}
                      />
                      {formErrors.diagnosis && (
                        <p className="mt-1 text-sm text-red-400">{formErrors.diagnosis}</p>
                      )}
                    </div>
                  </div>
                </FormSection>

                {/* Recommendations */}
                <FormSection title="Recommendations" description="Additional medical recommendations or notes (optional)">
                  <div>
                    <label className="block text-black text-sm font-medium mb-2">
                      Recommendations
                    </label>
                    <textarea
                      value={formData.recommendations || ''}
                      onChange={(e) => handleFormChange('recommendations', e.target.value)}
                      placeholder="Enter any recommendations or follow-up instructions..."
                      className="w-full px-4 py-2 bg-secondary-mediumblack text-black placeholder-black-400 border border-secondary-lightblack rounded-lg focus:outline-none focus:border-primary-gold transition resize-y min-h-[80px]"
                    />
                  </div>
                </FormSection>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Medical Report'}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleClearForm}
                    disabled={loading}
                    variant="secondary"
                    className="flex-1 bg-red-500 hover:bg-red-600"
                  >
                    Clear Form
                  </Button>
                </div>
              </form>
            </Card>
          </>
        )}

        {/* Success Credentials Modal */}
        {successData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-green-50 border border-green-300 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-black-900">Medical Report Submitted</h3>
                <p className="text-sm text-black-600 mt-1">Student account has been generated successfully.</p>
              </div>
              <div className="bg-white border border-black-200 rounded-xl p-4 mb-4 space-y-3">
                <div>
                  <span className="text-xs text-black-500 font-medium">Medical Report ID</span>
                  <p className="text-sm font-bold text-green-700">{successData.medical_report_id}</p>
                </div>
                <div>
                  <span className="text-xs text-black-500 font-medium">Student APPID (Login Username)</span>
                  <p className="text-sm font-bold text-black-900">{successData.appid}</p>
                </div>
                <div>
                  <span className="text-xs text-black-500 font-medium">Student Password</span>
                  <p className="text-sm font-bold text-black-900">{successData.student_password}</p>
                </div>
                <div className="border-t border-black-100 pt-2">
                  <p className="text-xs text-orange-600">Save these credentials. The student can login at /student/login with their APPID and password.</p>
                </div>
              </div>
              <button
                onClick={() => setSuccessData(null)}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
