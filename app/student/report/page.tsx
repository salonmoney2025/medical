'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/frontend/components/ui/Toast';

interface StudentData {
  id: number;
  name: string;
  appid: string;
  program: string;
  faculty: string;
  department: string;
  campus: string;
  medical_report_id: string;
  health_percentage: number;
  health_status: string;
}

interface MedicalReport {
  weight: number;
  height: number;
  visual_acuity_le: string;
  visual_acuity_re: string;
  blood_group: string;
  past_medical_history: string;
  long_standing_medication: string;
  known_allergies: string;
  diagnosis: string;
  additional_notes: string;
  completed_at: string;
  medical_officer_name: string;
}

export default function StudentReportPage() {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [report, setReport] = useState<MedicalReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    checkAuthAndFetchReport();
  }, []);

  const checkAuthAndFetchReport = async () => {
    // Check if student is logged in
    const token = localStorage.getItem('student_token');
    const studentDataStr = localStorage.getItem('student_data');

    if (!token || !studentDataStr) {
      router.push('/student/login');
      return;
    }

    try {
      const studentData = JSON.parse(studentDataStr);
      setStudent(studentData);

      // Fetch medical report
      const response = await fetch(
        `/api/medical-reports?student_id=${studentData.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setReport(data.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_data');
    router.push('/student/login');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setProfileImage(dataUrl);
      // We don't have a student profile image API endpoint yet — just show locally
      toast.success('Profile image updated');
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.old_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      toast.error('All fields are required');
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      const token = localStorage.getItem('student_token');
      const response = await fetch('/api/student/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: passwordForm.old_password,
          new_password: passwordForm.new_password,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Password changed successfully');
        setShowPasswordModal(false);
        setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      } else {
        toast.error(data.error || 'Failed to change password');
      }
    } catch {
      toast.error('Network error while changing password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'perfectly_ok':
        return 'text-green-600 bg-green-100';
      case 'healthy':
        return 'text-blue-600 bg-blue-100';
      case 'moderately_healthy':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-black-600 bg-black-100';
    }
  };

  const formatHealthStatus = (status: string) => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'N/A';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-black-600">Loading your medical report...</p>
        </div>
      </div>
    );
  }

  if (!student || !report) {
    return (
      <div className="min-h-screen bg-black-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">No medical report found</p>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black-100">
      {/* Header - Hidden when printing */}
      <header className="bg-white shadow-sm print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Profile Image */}
            <div
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-black-200 cursor-pointer hover:border-blue-400 transition relative group"
              onClick={() => fileInputRef.current?.click()}
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {student?.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              title="Upload profile image"
              onChange={handleProfileImageChange}
            />
            <div>
              <h1 className="text-xl font-bold text-black-900">
                Medical Report Portal
              </h1>
              <p className="text-sm text-black-600">Ernest Bai Koroma University</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium"
            >
              Print Report
            </button>
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-medium"
            >
              Change Password
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 bg-black-600 text-white rounded hover:bg-black-700 transition text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Report Content */}
      <div className="max-w-5xl mx-auto p-4 print:p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* University Header - Visible when printing */}
          <div className="hidden print:block text-center mb-8 border-b-2 border-black-300 pb-6">
            <h1 className="text-2xl font-bold text-black-900">
              ERNEST BAI KOROMA UNIVERSITY OF SCIENCE AND TECHNOLOGY
            </h1>
            <p className="text-sm text-black-600 mt-2">
              Student Medical Report
            </p>
            <p className="text-xs text-black-500 mt-1">
              Office of the Registrar
            </p>
          </div>

          {/* Student Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-black-900 mb-4 border-b-2 border-blue-600 pb-2">
              Student Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-black-600">Full Name</p>
                <p className="font-semibold text-black-900">{student.name}</p>
              </div>
              <div>
                <p className="text-sm text-black-600">Medical Report ID</p>
                <p className="font-semibold text-blue-600">
                  {student.medical_report_id}
                </p>
              </div>
              <div>
                <p className="text-sm text-black-600">Program</p>
                <p className="font-semibold text-black-900">{student.program}</p>
              </div>
              <div>
                <p className="text-sm text-black-600">Faculty</p>
                <p className="font-semibold text-black-900">{student.faculty}</p>
              </div>
              <div>
                <p className="text-sm text-black-600">Department</p>
                <p className="font-semibold text-black-900">{student.department}</p>
              </div>
              <div>
                <p className="text-sm text-black-600">Campus</p>
                <p className="font-semibold text-black-900">{student.campus}</p>
              </div>
            </div>
          </div>

          {/* Health Status */}
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-black-900 mb-4">
              Health Status
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black-600 mb-2">Overall Health</p>
                <span
                  className={`inline-block px-4 py-2 rounded-full font-semibold text-lg ${getHealthStatusColor(
                    student.health_status
                  )}`}
                >
                  {formatHealthStatus(student.health_status)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-black-600 mb-2">Health Percentage</p>
                <div className="text-4xl font-bold text-blue-600">
                  {student.health_percentage}%
                </div>
              </div>
            </div>
          </div>

          {/* Medical Report Details */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-black-900 mb-4 border-b-2 border-blue-600 pb-2">
              Medical Examination Report
            </h2>

            {/* Basic Measurements */}
            <div className="mb-6">
              <h3 className="font-semibold text-black-900 mb-3">
                Basic Measurements
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black-50 p-3 rounded">
                  <p className="text-sm text-black-600">Weight</p>
                  <p className="font-semibold">{report.weight || 'N/A'} kg</p>
                </div>
                <div className="bg-black-50 p-3 rounded">
                  <p className="text-sm text-black-600">Height</p>
                  <p className="font-semibold">{report.height || 'N/A'} cm</p>
                </div>
              </div>
            </div>

            {/* Visual Acuity */}
            <div className="mb-6">
              <h3 className="font-semibold text-black-900 mb-3">Visual Acuity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black-50 p-3 rounded">
                  <p className="text-sm text-black-600">Left Eye (LE)</p>
                  <p className="font-semibold">{report.visual_acuity_le || 'N/A'}</p>
                </div>
                <div className="bg-black-50 p-3 rounded">
                  <p className="text-sm text-black-600">Right Eye (RE)</p>
                  <p className="font-semibold">{report.visual_acuity_re || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Blood Group */}
            <div className="mb-6 bg-black-50 p-4 rounded">
              <p className="text-sm text-black-600 mb-1">Blood Group</p>
              <p className="font-semibold text-lg">{report.blood_group || 'N/A'}</p>
            </div>

            {/* Medical History */}
            {report.past_medical_history && (
              <div className="mb-6">
                <h3 className="font-semibold text-black-900 mb-2">
                  Past Medical History
                </h3>
                <p className="text-black-700 bg-black-50 p-3 rounded">
                  {report.past_medical_history}
                </p>
              </div>
            )}

            {/* Medications */}
            {report.long_standing_medication && (
              <div className="mb-6">
                <h3 className="font-semibold text-black-900 mb-2">
                  Long Standing Medication
                </h3>
                <p className="text-black-700 bg-black-50 p-3 rounded">
                  {report.long_standing_medication}
                </p>
              </div>
            )}

            {/* Allergies */}
            {report.known_allergies && (
              <div className="mb-6">
                <h3 className="font-semibold text-black-900 mb-2">
                  Known Allergies
                </h3>
                <p className="text-black-700 bg-red-50 p-3 rounded border border-red-200">
                  {report.known_allergies}
                </p>
              </div>
            )}

            {/* Diagnosis */}
            {report.diagnosis && (
              <div className="mb-6">
                <h3 className="font-semibold text-black-900 mb-2">Diagnosis</h3>
                <p className="text-black-700 bg-blue-50 p-3 rounded border border-blue-200">
                  {report.diagnosis}
                </p>
              </div>
            )}

            {/* Additional Notes */}
            {report.additional_notes && (
              <div className="mb-6">
                <h3 className="font-semibold text-black-900 mb-2">
                  Additional Notes
                </h3>
                <p className="text-black-700 bg-black-50 p-3 rounded">
                  {report.additional_notes}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t-2 border-black-300 pt-6 mt-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-black-600">Medical Officer</p>
                <p className="font-semibold text-black-900">
                  {report.medical_officer_name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-black-600">Report Date</p>
                <p className="font-semibold text-black-900">
                  {new Date(report.completed_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Print Footer */}
          <div className="hidden print:block mt-8 text-center text-xs text-black-500 border-t border-black-300 pt-4">
            <p>
              This is an official medical report from Ernest Bai Koroma
              University of Science and Technology
            </p>
            <p className="mt-1 font-semibold">
              EBK &mdash; The only institution where technology lives
            </p>
            <p className="mt-1">
              Report ID: {student.medical_report_id} | Generated on:{' '}
              {new Date().toLocaleDateString()}
            </p>
            <p className="mt-1">&copy; EBKUSTSL 2026. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-4 text-center text-xs text-black-400 print:hidden">
        &copy; EBKUSTSL 2026. All rights reserved.
      </footer>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-black-900">Change Password</h3>
              <button
                type="button"
                title="Close"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
                }}
                className="text-black-400 hover:text-black-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.old_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                  className="w-full px-4 py-2 border border-black-300 rounded-lg focus:outline-none focus:border-blue-500 text-black-900"
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="w-full px-4 py-2 border border-black-300 rounded-lg focus:outline-none focus:border-blue-500 text-black-900"
                  placeholder="Min 8 characters"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  className="w-full px-4 py-2 border border-black-300 rounded-lg focus:outline-none focus:border-blue-500 text-black-900"
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
                  }}
                  className="px-5 py-2 border border-black-300 rounded-lg hover:bg-black-100 transition font-medium text-black-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-black-400"
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
