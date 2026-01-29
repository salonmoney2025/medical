'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/frontend/components/dashboard/DashboardLayout';
import { Modal } from '@/frontend/components/ui/Modal';
import { useToast } from '@/frontend/components/ui/Toast';
import * as XLSX from 'xlsx';

interface StudentAccount {
  id: number;
  appid: string;
  name: string;
  program: string;
  campus: string;
  email: string;
  report_status: 'pending' | 'assigned' | 'completed';
  medical_report_id: string | null;
  password: string | null;
}

export default function AccountsPage() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<StudentAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<StudentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('APPID');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(20);
  const [showPassword, setShowPassword] = useState<{ [key: number]: boolean }>({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [academicYear, setAcademicYear] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [assignResult, setAssignResult] = useState<{
    show: boolean;
    reportId: string;
    password: string;
    studentName: string;
  }>({ show: false, reportId: '', password: '', studentName: '' });

  // Student password reset state
  const [resetStudent, setResetStudent] = useState<StudentAccount | null>(null);
  const [studentNewPassword, setStudentNewPassword] = useState('');
  const [resettingStudent, setResettingStudent] = useState(false);

  // Revoke state
  const [revokeTarget, setRevokeTarget] = useState<StudentAccount | null>(null);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const [searching, setSearching] = useState(false);

  useEffect(() => {
    filterAccounts();
  }, [accounts, searchTerm]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/students?limit=1000', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setAccounts(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    if (!searchTerm) {
      setFilteredAccounts(accounts);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = accounts.filter((account) => {
      if (filterType === 'APPID') {
        return account.appid?.toLowerCase().includes(term);
      } else if (filterType === 'Full name') {
        return account.name.toLowerCase().includes(term);
      } else if (filterType === 'Program') {
        return account.program.toLowerCase().includes(term);
      }
      return false;
    });
    setFilteredAccounts(filtered);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setSearching(true);
    filterAccounts();
    setSearching(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredAccounts(accounts);
    setCurrentPage(1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAssignId = async (accountId: number) => {
    try {
      const account = accounts.find((a) => a.id === accountId);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/students/${accountId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setAssignResult({
          show: true,
          reportId: data.data.medical_report_id,
          password: data.data.password,
          studentName: account?.name || 'Student',
        });
        fetchAccounts();
      }
    } catch (error) {
      console.error('Failed to assign ID:', error);
      toast('Failed to assign ID', 'error');
    }
  };

  const togglePasswordVisibility = (accountId: number) => {
    setShowPassword((prev) => ({
      ...prev,
      [accountId]: !prev[accountId],
    }));
  };

  const handleResetStudentPassword = async () => {
    if (!resetStudent || !studentNewPassword) return;
    setResettingStudent(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/students/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ student_id: resetStudent.id, new_password: studentNewPassword }),
      });
      const data = await response.json();
      setResetStudent(null);
      setStudentNewPassword('');
      if (data.success) {
        toast('Password reset successfully', 'success');
        fetchAccounts();
      } else {
        toast(data.error || 'Failed to reset password', 'error');
      }
    } catch (error) {
      console.error('Failed to reset student password:', error);
      setResetStudent(null);
      setStudentNewPassword('');
      toast('Failed to reset password', 'error');
    } finally {
      setResettingStudent(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/students/${revokeTarget.id}/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const targetName = revokeTarget.name;
      setRevokeTarget(null);
      if (data.success) {
        toast(`Medical Report ID revoked for ${targetName}`, 'success');
        fetchAccounts();
      } else {
        toast(data.error || 'Failed to revoke', 'error');
      }
    } catch (error) {
      console.error('Failed to revoke:', error);
      setRevokeTarget(null);
      toast('Failed to revoke medical report ID', 'error');
    } finally {
      setRevoking(false);
    }
  };

  const handleExportToExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/students/export', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        // Create worksheet from data
        const ws = XLSX.utils.json_to_sheet(data.data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Students');

        // Generate and download file
        XLSX.writeFile(wb, `students_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      }
    } catch (error) {
      console.error('Failed to export:', error);
      toast('Failed to export students. Please try again.', 'error');
    }
  };

  const handleDownloadTemplate = () => {
    // Create template data
    const templateData = [
      { APPID: '19565', Name: 'KALIE LANSANA MARAH', Course: 'Bachelor of Science with Honours in Public Health', Campus: 'Makeni Campus' },
      { APPID: '19601', Name: 'UNISA LUGBU', Course: 'Bachelor of Science with Honours in Public Health', Campus: 'Makeni Campus' },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'student_upload_template.csv', { bookType: 'csv' });
  };

  const handleFileUpload = async () => {
    if (!uploadFile) {
      toast('Please select a file to upload', 'warning');
      return;
    }

    if (!academicYear) {
      toast('Please select the academic year', 'warning');
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          let parsedStudents: any[] = [];

          if (uploadFile.name.endsWith('.csv')) {
            // Parse CSV
            const text = data as string;
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());

            for (let i = 1; i < lines.length; i++) {
              if (!lines[i].trim()) continue;
              const values = lines[i].split(',').map(v => v.trim());
              const student: any = {};
              headers.forEach((header, index) => {
                student[header] = values[index];
              });
              if (student.APPID && student.Name) {
                parsedStudents.push(student);
              }
            }
          } else {
            // Parse Excel
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            parsedStudents = XLSX.utils.sheet_to_json(worksheet);
          }

          // Upload to API
          const token = localStorage.getItem('token');
          const response = await fetch('/api/students/batch-upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              students: parsedStudents,
              academic_year: academicYear,
            }),
          });

          const result = await response.json();
          if (result.success) {
            toast(`Uploaded ${result.data.inserted} student(s)${result.data.skipped > 0 ? `, skipped ${result.data.skipped}` : ''}`, 'success');
            setShowUploadModal(false);
            setUploadFile(null);
            setAcademicYear('');
            fetchAccounts();
          } else {
            toast(`Upload failed: ${result.error}`, 'error');
          }
        } catch (error: any) {
          console.error('File parsing error:', error);
          toast(`Failed to parse file: ${error.message}`, 'error');
        } finally {
          setUploading(false);
        }
      };

      if (uploadFile.name.endsWith('.csv')) {
        reader.readAsText(uploadFile);
      } else {
        reader.readAsBinaryString(uploadFile);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast('Failed to upload file. Please try again.', 'error');
      setUploading(false);
    }
  };

  // Pagination
  const indexOfLastAccount = currentPage * rowsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - rowsPerPage;
  const currentAccounts = filteredAccounts.slice(
    indexOfFirstAccount,
    indexOfLastAccount
  );
  const totalPages = Math.ceil(filteredAccounts.length / rowsPerPage);

  return (
    <DashboardLayout role="super_admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">List of Accounts</h1>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-sm"
            >
              <span>📥</span>
              Export Excel
            </button>
            <button
              onClick={fetchAccounts}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm"
            >
              <span>🔄</span>
              Refresh
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition shadow-sm"
            >
              <span>📤</span>
              Upload IDs
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={`Search ${filterType.toLowerCase()}...`}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500 text-gray-800 placeholder-gray-500 shadow-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="px-5 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-semibold shadow-sm whitespace-nowrap"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            title="Filter type"
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500 shadow-sm"
          >
            <option value="APPID">APPID</option>
            <option value="Full name">Full name</option>
            <option value="Program">Program</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                    APPID
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                    Full name
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                    Program
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                    Password
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : currentAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No accounts found
                    </td>
                  </tr>
                ) : (
                  currentAccounts.map((account) => (
                    <tr
                      key={account.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {account.appid || account.medical_report_id || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {account.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {account.program}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            account.report_status === 'completed' || account.medical_report_id
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {account.medical_report_id ? 'Assigned' : 'Not Assigned'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {account.password ? (
                          <button
                            onClick={() => togglePasswordVisibility(account.id)}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-xs font-semibold"
                          >
                            {showPassword[account.id] ? 'HIDE' : 'SHOW'}
                          </button>
                        ) : (
                          <span className="text-gray-400">No password</span>
                        )}
                        {showPassword[account.id] && account.password && (
                          <div className="mt-2 text-xs font-mono bg-gray-50 p-2 rounded border border-gray-300">
                            <span className="text-gray-900 select-all">
                              {account.password}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!account.medical_report_id ? (
                            <button
                              onClick={() => handleAssignId(account.id)}
                              className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-semibold hover:bg-yellow-600 transition shadow-sm"
                            >
                              Assign ID
                            </button>
                          ) : (
                            <>
                              <button className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-semibold cursor-not-allowed">
                                Already Assigned
                              </button>
                              <button
                                onClick={() => setRevokeTarget(account)}
                                className="px-3 py-2 bg-pink-200 text-pink-700 rounded-lg text-sm font-semibold hover:bg-pink-300 transition shadow-sm"
                              >
                                Revoke
                              </button>
                            </>
                          )}
                          {account.password && (
                            <button
                              onClick={() => { setResetStudent(account); setStudentNewPassword(''); }}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition shadow-sm"
                            >
                              Reset Password
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredAccounts.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Rows per page:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {rowsPerPage}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg transition ${
                      currentPage === i + 1
                        ? 'bg-yellow-500 text-white shadow-md'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                {totalPages > 5 && (
                  <>
                    <span className="text-gray-500">...</span>
                    <span className="text-sm text-gray-700">{totalPages}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Upload IDs Modal */}
        <Modal
          isOpen={showUploadModal}
          onClose={() => !uploading && setShowUploadModal(false)}
          title="Batch Upload Student Data"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500 bg-white"
                disabled={uploading}
              >
                <option value="">Select Academic Year</option>
                {Array.from({ length: 10 }, (_, i) => {
                  const startYear = new Date().getFullYear() - 3 + i;
                  return (
                    <option key={startYear} value={`${startYear}/${startYear + 1}`}>
                      {startYear}/{startYear + 1}
                    </option>
                  );
                })}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select the academic year students applied
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File (CSV or Excel)
              </label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                disabled={uploading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Required columns: APPID, Name, Course, Campus
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Don't have a file?{' '}
                <button
                  onClick={handleDownloadTemplate}
                  className="text-yellow-600 hover:underline font-semibold"
                >
                  Download template (CSV)
                </button>
              </p>
            </div>

            {uploading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">Uploading students, please wait...</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                disabled={uploading}
              >
                CANCEL
              </button>
              <button
                onClick={handleFileUpload}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={uploading || !uploadFile}
              >
                {uploading ? 'UPLOADING...' : 'UPLOAD'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Student Reset Password Modal */}
        <Modal
          isOpen={!!resetStudent}
          onClose={() => !resettingStudent && setResetStudent(null)}
          title="Reset Student Password"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Reset password for <span className="font-semibold text-gray-900">{resetStudent?.name}</span>
              <br />
              <span className="text-gray-500">APPID: {resetStudent?.appid}</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="text"
                value={studentNewPassword}
                onChange={(e) => setStudentNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500 text-gray-800"
                disabled={resettingStudent}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResetStudent(null)}
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                disabled={resettingStudent}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetStudentPassword}
                disabled={resettingStudent || studentNewPassword.length < 6}
                className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {resettingStudent ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Revoke Confirmation Modal */}
        {revokeTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white border border-gray-300 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Revoke Medical Report ID</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Are you sure you want to revoke the ID for <span className="font-semibold text-gray-900">{revokeTarget.name}</span>?
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Report ID: <span className="font-mono font-semibold">{revokeTarget.medical_report_id}</span>
                </p>
                <p className="text-xs text-red-500 mt-2">This will remove the assigned ID and password.</p>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setRevokeTarget(null)}
                  disabled={revoking}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevoke}
                  disabled={revoking}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition disabled:bg-gray-300"
                >
                  {revoking ? 'Revoking...' : 'Revoke'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Success Popup */}
        {assignResult.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-green-50 border border-green-300 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">ID Assigned Successfully</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Medical Report ID has been assigned to <span className="font-semibold">{assignResult.studentName}</span>
                </p>
              </div>

              <div className="space-y-3 bg-white rounded-xl p-4 border border-green-200">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Report ID</p>
                  <p className="text-lg font-bold text-gray-900 select-all">{assignResult.reportId}</p>
                </div>
                <div className="border-t border-green-100 pt-3">
                  <p className="text-xs font-medium text-gray-500 uppercase">Password</p>
                  <p className="text-lg font-bold text-gray-900 font-mono select-all">{assignResult.password}</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center mt-3">Please save this information securely.</p>

              <button
                onClick={() => setAssignResult({ show: false, reportId: '', password: '', studentName: '' })}
                className="w-full mt-5 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition shadow-sm"
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
