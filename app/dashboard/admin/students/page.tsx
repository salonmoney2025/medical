'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/frontend/components/dashboard/DashboardLayout';
import { Modal } from '@/frontend/components/ui/Modal';

interface Student {
  id: number;
  appid: string;
  name: string;
  matriculation_number: string;
  program: string;
  faculty: string;
  campus: string;
  academic_year: string;
}

const CAMPUSES = ['Magburaka Campus', 'Makeni Campus', 'Portloko Campus'];
const ACADEMIC_YEARS = ['2025/2026', '2024/2025', '2023/2024'];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('APPID');
  const [searching, setSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(20);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBatchUpload, setShowBatchUpload] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<{ show: boolean; success: boolean; message: string }>({ show: false, success: false, message: '' });

  // Enroll form state
  const [enrollForm, setEnrollForm] = useState({
    appid: '',
    name: '',
    program: '',
    academic_year: '',
    campus: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm]);

  const fetchStudents = async () => {
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
        setStudents(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!searchTerm) {
      setFilteredStudents(students);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = students.filter((student) => {
      if (filterType === 'APPID') {
        return student.appid?.toLowerCase().includes(term);
      } else if (filterType === 'Full name') {
        return student.name.toLowerCase().includes(term);
      } else if (filterType === 'Program') {
        return student.program.toLowerCase().includes(term);
      } else if (filterType === 'Campus') {
        return student.campus?.toLowerCase().includes(term);
      }
      return (
        student.appid?.toLowerCase().includes(term) ||
        student.name.toLowerCase().includes(term) ||
        student.program.toLowerCase().includes(term) ||
        student.campus?.toLowerCase().includes(term)
      );
    });
    setFilteredStudents(filtered);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setSearching(true);
    filterStudents();
    setSearching(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredStudents(students);
    setCurrentPage(1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...enrollForm,
          matriculation_number: enrollForm.appid, // Use APPID as matriculation number for now
          faculty: 'Medical Sciences', // Default faculty
          department: 'Medical', // Default department
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowEnrollModal(false);
        setEnrollForm({
          appid: '',
          name: '',
          program: '',
          academic_year: '',
          campus: '',
        });
        fetchStudents();
      }
    } catch (error) {
      console.error('Failed to enroll student:', error);
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/students/${selectedStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(selectedStudent),
      });

      const data = await response.json();
      if (data.success) {
        setShowEditModal(false);
        setSelectedStudent(null);
        fetchStudents();
      }
    } catch (error) {
      console.error('Failed to update student:', error);
    }
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handleDeleteStudent = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/students/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setDeleteTarget(null);
      if (data.success) {
        setDeleteResult({ show: true, success: true, message: `Student "${deleteTarget.name}" deleted successfully` });
        fetchStudents();
      } else {
        setDeleteResult({ show: true, success: false, message: data.error || 'Failed to delete student' });
      }
    } catch (error) {
      console.error('Failed to delete student:', error);
      setDeleteTarget(null);
      setDeleteResult({ show: true, success: false, message: 'Failed to delete student' });
    } finally {
      setDeleting(false);
    }
  };

  // Pagination
  const indexOfLastStudent = currentPage * rowsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - rowsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );
  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);

  return (
    <DashboardLayout role="super_admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">List of Students</h1>
          <div className="flex gap-3">
            <button
              onClick={fetchStudents}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
            >
              <span>🔄</span>
              Refresh
            </button>
            <div className="relative">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                onClick={() => setShowEnrollModal(true)}
              >
                <span>+</span>
                Add new
              </button>
            </div>
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
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-800 placeholder-gray-500"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold shadow-sm whitespace-nowrap"
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
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 shadow-sm"
          >
            <option value="APPID">APPID</option>
            <option value="Full name">Full name</option>
            <option value="Program">Program</option>
            <option value="Campus">Campus</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-300">
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
                  Campus
                </th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : currentStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                currentStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {student.appid || student.matriculation_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {student.program}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {student.campus || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(student)}
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(student)}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition shadow-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {!loading && filteredStudents.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Rows per page</span>
                <span className="text-sm font-semibold text-gray-900">
                  {rowsPerPage}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded ${
                      currentPage === i + 1
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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

        {/* Enroll New Student Modal */}
        <Modal
          isOpen={showEnrollModal}
          onClose={() => setShowEnrollModal(false)}
          title="Enroll new student"
          size="md"
        >
          <form onSubmit={handleEnrollStudent} className="space-y-4">
            <input
              type="text"
              placeholder="Application ID"
              value={enrollForm.appid}
              onChange={(e) =>
                setEnrollForm({ ...enrollForm, appid: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Full name"
              value={enrollForm.name}
              onChange={(e) =>
                setEnrollForm({ ...enrollForm, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Program"
              value={enrollForm.program}
              onChange={(e) =>
                setEnrollForm({ ...enrollForm, program: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
            <select
              value={enrollForm.academic_year}
              onChange={(e) =>
                setEnrollForm({ ...enrollForm, academic_year: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Academic year</option>
              {ACADEMIC_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={enrollForm.campus}
              onChange={(e) =>
                setEnrollForm({ ...enrollForm, campus: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Campus</option>
              {CAMPUSES.map((campus) => (
                <option key={campus} value={campus}>
                  {campus}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                ENROLL
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Student Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Student Details"
          size="md"
        >
          {selectedStudent && (
            <form onSubmit={handleEditStudent} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Full name
                </label>
                <input
                  type="text"
                  value={selectedStudent.name}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Program
                </label>
                <input
                  type="text"
                  value={selectedStudent.program}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      program: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Academic year
                </label>
                <input
                  type="text"
                  value={selectedStudent.academic_year || ''}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      academic_year: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Campus
                </label>
                <input
                  type="text"
                  value={selectedStudent.campus || ''}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      campus: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  UPDATE
                </button>
              </div>
            </form>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white border border-gray-300 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Delete Student</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteTarget.name}</span>?
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  APPID: <span className="font-mono font-semibold">{deleteTarget.appid}</span>
                </p>
                <p className="text-xs text-red-500 mt-2">This action cannot be undone.</p>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteStudent}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition disabled:bg-gray-300"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Result Popup */}
        {deleteResult.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className={`${deleteResult.success ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'} border rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4`}>
              <div className="text-center mb-4">
                <div className={`w-14 h-14 ${deleteResult.success ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  {deleteResult.success ? (
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {deleteResult.success ? 'Student Deleted' : 'Delete Failed'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{deleteResult.message}</p>
              </div>
              <button
                onClick={() => setDeleteResult({ show: false, success: false, message: '' })}
                className={`w-full mt-3 px-6 py-3 ${deleteResult.success ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-xl font-semibold transition shadow-sm`}
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
