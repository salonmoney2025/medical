'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  const [student, setStudent] = useState<StudentData | null>(null);
  const [report, setReport] = useState<MedicalReport | null>(null);
  const [loading, setLoading] = useState(true);

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

  const getHealthStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'perfectly_ok':
        return 'text-green-600 bg-green-100';
      case 'healthy':
        return 'text-blue-600 bg-blue-100';
      case 'moderately_healthy':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatHealthStatus = (status: string) => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'N/A';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your medical report...</p>
        </div>
      </div>
    );
  }

  if (!student || !report) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-100">
      {/* Header - Hidden when printing */}
      <header className="bg-white shadow-sm print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Medical Report Portal
            </h1>
            <p className="text-sm text-gray-600">Ernest Bai Koroma University</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              🖨️ Print Report
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
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
          <div className="hidden print:block text-center mb-8 border-b-2 border-gray-300 pb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              ERNEST BAI KOROMA UNIVERSITY OF SCIENCE AND TECHNOLOGY
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Student Medical Report
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Office of the Registrar
            </p>
          </div>

          {/* Student Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-2">
              Student Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-semibold text-gray-900">{student.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Medical Report ID</p>
                <p className="font-semibold text-blue-600">
                  {student.medical_report_id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Program</p>
                <p className="font-semibold text-gray-900">{student.program}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Faculty</p>
                <p className="font-semibold text-gray-900">{student.faculty}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-semibold text-gray-900">{student.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Campus</p>
                <p className="font-semibold text-gray-900">{student.campus}</p>
              </div>
            </div>
          </div>

          {/* Health Status */}
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Health Status
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Overall Health</p>
                <span
                  className={`inline-block px-4 py-2 rounded-full font-semibold text-lg ${getHealthStatusColor(
                    student.health_status
                  )}`}
                >
                  {formatHealthStatus(student.health_status)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-2">Health Percentage</p>
                <div className="text-4xl font-bold text-blue-600">
                  {student.health_percentage}%
                </div>
              </div>
            </div>
          </div>

          {/* Medical Report Details */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-2">
              Medical Examination Report
            </h2>

            {/* Basic Measurements */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Basic Measurements
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="font-semibold">{report.weight || 'N/A'} kg</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Height</p>
                  <p className="font-semibold">{report.height || 'N/A'} cm</p>
                </div>
              </div>
            </div>

            {/* Visual Acuity */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Visual Acuity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Left Eye (LE)</p>
                  <p className="font-semibold">{report.visual_acuity_le || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Right Eye (RE)</p>
                  <p className="font-semibold">{report.visual_acuity_re || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Blood Group */}
            <div className="mb-6 bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600 mb-1">Blood Group</p>
              <p className="font-semibold text-lg">{report.blood_group || 'N/A'}</p>
            </div>

            {/* Medical History */}
            {report.past_medical_history && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Past Medical History
                </h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">
                  {report.past_medical_history}
                </p>
              </div>
            )}

            {/* Medications */}
            {report.long_standing_medication && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Long Standing Medication
                </h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">
                  {report.long_standing_medication}
                </p>
              </div>
            )}

            {/* Allergies */}
            {report.known_allergies && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Known Allergies
                </h3>
                <p className="text-gray-700 bg-red-50 p-3 rounded border border-red-200">
                  {report.known_allergies}
                </p>
              </div>
            )}

            {/* Diagnosis */}
            {report.diagnosis && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Diagnosis</h3>
                <p className="text-gray-700 bg-blue-50 p-3 rounded border border-blue-200">
                  {report.diagnosis}
                </p>
              </div>
            )}

            {/* Additional Notes */}
            {report.additional_notes && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Additional Notes
                </h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">
                  {report.additional_notes}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-300 pt-6 mt-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-gray-600">Medical Officer</p>
                <p className="font-semibold text-gray-900">
                  {report.medical_officer_name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Report Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(report.completed_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Print Instructions */}
          <div className="hidden print:block mt-8 text-center text-xs text-gray-500">
            <p>
              This is an official medical report from Ernest Bai Koroma
              University of Science and Technology
            </p>
            <p className="mt-1">
              Report ID: {student.medical_report_id} | Generated on:{' '}
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
