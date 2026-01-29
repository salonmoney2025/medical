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

const VISUAL_ACUITY_PRESETS = ['20/20', '20/25', '20/30', '20/40', '20/50', '20/60', '20/80', '20/100', '20/200', '20/400'] as const;

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
  placeholder = 'e.g., 20/20',
  error,
}: VisualAcuityInputProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, e.target.value);
  }, [name, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow navigation keys and common input characters
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Backspace', 'Delete', 'Tab'].includes(e.key)) {
      return;
    }
    // Only allow digits, slash, and common input patterns
    const allowedPattern = /^[0-9/]$/;
    if (!allowedPattern.test(e.key)) {
      e.preventDefault();
    }
  }, []);

  return (
    <div className="w-full">
      <label className="block text-black text-sm font-medium mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          list={`${name}-presets`}
          className={`w-full px-4 py-2 bg-secondary-mediumGray text-black placeholder-black-400 border rounded focus:outline-none focus:border-primary-gold transition ${
            error ? 'border-red-500' : 'border-secondary-lightGray'
          }`}
          placeholder={placeholder}
          value={value || ''}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
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

    // Visual acuity format validation (e.g., 20/20, 20/40)
    const acuityPattern = /^\d{2}\/\d{2,3}$/;
    if (formData.visual_acuity_le && !acuityPattern.test(formData.visual_acuity_le)) {
      errors.visual_acuity_le = 'Use format: 20/20, 20/40, etc.';
      isValid = false;
    }

    if (formData.visual_acuity_re && !acuityPattern.test(formData.visual_acuity_re)) {
      errors.visual_acuity_re = 'Use format: 20/20, 20/40, etc.';
      isValid = false;
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

    // Validate Student ID format (numeric)
    if (!/^\d+$/.test(searchTerm)) {
      toast('Student ID must be a number', 'error');
      return;
    }

    setLoading(true);
    setStudent(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/students?student_id=${encodeURIComponent(searchTerm)}`,
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
        toast(
          `Medical report submitted! Report ID: ${data.data.medical_report_id}. Password: ${data.data.student_password}`,
          'success'
        );
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
                placeholder="Enter Student ID (e.g., 1, 2, 3...)"
                value={matriculationNumber}
                onChange={(e) => setMatriculationNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-2 bg-secondary-mediumGray text-black placeholder-gray-400 border border-secondary-lightGray rounded focus:outline-none focus:border-primary-gold transition"
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
                        className="w-full px-4 py-2 bg-secondary-mediumGray text-black border border-secondary-lightGray rounded focus:outline-none focus:border-primary-gold transition"
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
                        className="w-full px-4 py-2 bg-secondary-mediumGray text-black border border-secondary-lightGray rounded-lg focus:outline-none focus:border-primary-gold transition"
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
                        className="w-full px-4 py-2 bg-secondary-mediumGray text-black placeholder-gray-400 border border-secondary-lightGray rounded-lg focus:outline-none focus:border-primary-gold transition resize-y min-h-[120px]"
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
                      className="w-full px-4 py-2 bg-secondary-mediumGray text-black placeholder-gray-400 border border-secondary-lightGray rounded-lg focus:outline-none focus:border-primary-gold transition resize-y min-h-[80px]"
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
      </div>
    </DashboardLayout>
  );
}
