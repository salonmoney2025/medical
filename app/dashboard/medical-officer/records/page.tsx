'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/frontend/components/dashboard/DashboardLayout';
import { Modal } from '@/frontend/components/ui/Modal';
import { useToast } from '@/frontend/components/ui/Toast';

interface MedicalRecord {
  id: number;
  student_id: number;
  student_name: string;
  matriculation_number: string;
  appid: string;
  program: string;
  faculty: string;
  medical_officer_name: string;
  weight: number | null;
  height: number | null;
  blood_group: string | null;
  diagnosis: string | null;
  health_percentage: number | null;
  health_status: string | null;
  is_completed: boolean;
  created_at: string;
  completed_at: string | null;
  medical_report_id: string | null;
  student_password: string | null;
}

interface RecordStats {
  total_students: number;
  total_records: number;
  completed: number;
  pending: number;
}

export default function MedicalOfficerRecordsPage() {
  const toast = useToast();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Name');
  const [healthStatusFilter, setHealthStatusFilter] = useState('All');
  const [searching, setSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(20);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [editForm, setEditForm] = useState({ diagnosis: '', health_status: '', health_percentage: '', weight: '', height: '', blood_group: '', additional_notes: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<MedicalRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [stats, setStats] = useState<RecordStats>({
    total_students: 0,
    total_records: 0,
    completed: 0,
    pending: 0,
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, filterType, healthStatusFilter]);

  const fetchRecords = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/medical-records?limit=1000', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setRecords(data.data || []);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        setFetchError(data.error || 'Failed to load records');
        console.error('API error:', data.error);
      }
    } catch (error) {
      setFetchError('Network error - could not reach the server');
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = records;

    // Apply health status filter
    if (healthStatusFilter !== 'All') {
      filtered = filtered.filter((record) => record.health_status === healthStatusFilter);
    }

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((record) => {
        switch (filterType) {
          case 'Name':
            return record.student_name?.toLowerCase().includes(term);
          case 'Diagnosis':
            return record.diagnosis?.toLowerCase().includes(term);
          default:
            return false;
        }
      });
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setSearching(true);
    filterRecords();
    setSearching(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredRecords(records);
    setCurrentPage(1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPlaceholder = () => {
    switch (filterType) {
      case 'Name': return 'Search by student name...';
      case 'Diagnosis': return 'Search by diagnosis...';
      default: return 'Search...';
    }
  };

  const handleStartEdit = (record: MedicalRecord) => {
    setEditingRecord(record);
    setEditForm({
      diagnosis: record.diagnosis || '',
      health_status: record.health_status || '',
      health_percentage: record.health_percentage?.toString() || '',
      weight: record.weight?.toString() || '',
      height: record.height?.toString() || '',
      blood_group: record.blood_group || '',
      additional_notes: '',
    });
    setSelectedRecord(null);
  };

  const handleEditSave = async () => {
    if (!editingRecord) return;
    setEditSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/medical-records', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editingRecord.id,
          diagnosis: editForm.diagnosis || undefined,
          health_status: editForm.health_status || undefined,
          health_percentage: editForm.health_percentage ? Number(editForm.health_percentage) : undefined,
          weight: editForm.weight ? Number(editForm.weight) : undefined,
          height: editForm.height ? Number(editForm.height) : undefined,
          blood_group: editForm.blood_group || undefined,
          additional_notes: editForm.additional_notes || undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Record updated successfully');
        setEditingRecord(null);
        fetchRecords();
      } else {
        toast.error(data.error || 'Failed to update record');
      }
    } catch {
      toast.error('Network error while updating record');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/medical-records?id=${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Record deleted successfully');
        setDeleteConfirm(null);
        setSelectedRecord(null);
        fetchRecords();
      } else {
        toast.error(data.error || 'Failed to delete record');
      }
    } catch {
      toast.error('Network error while deleting record');
    } finally {
      setDeleting(false);
    }
  };

  // Pagination
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);

  return (
    <DashboardLayout title="My Records" role="medical_officer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center print:hidden">
          <h1 className="text-2xl font-bold text-black-900">Medical Records</h1>
          <div className="flex gap-3">
            <button
              onClick={fetchRecords}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
            >
              <span>🔄</span>
              Refresh
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
            >
              <span>🖨️</span>
              Print Records
            </button>
          </div>
        </div>

        {/* Print Header - only visible when printing */}
        <div className="hidden print:block text-center mb-6 border-b-2 border-black-300 pb-4">
          <h1 className="text-xl font-bold">ERNEST BAI KOROMA UNIVERSITY OF SCIENCE AND TECHNOLOGY</h1>
          <p className="text-sm mt-1 italic">The only institution where technology lives</p>
          <p className="text-sm mt-1 font-semibold">Office of the Registrar &mdash; Medical Records Report</p>
          <p className="text-xs mt-2">
            {healthStatusFilter !== 'All' ? `Health Status: ${healthStatusFilter.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}` : 'All Records'}
            {' | '}Total: {filteredRecords.length} records
            {' | '}Printed: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Error Banner */}
        {fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Error loading records</p>
            <p className="text-sm mt-1">{fetchError}</p>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 print:hidden">
          <div className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black-400">
                🔍
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={getPlaceholder()}
                className="w-full pl-10 pr-4 py-2 bg-white border border-black-300 rounded-lg focus:outline-none focus:border-green-500 text-black-900 placeholder-black-500"
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
                className="px-4 py-2 bg-black-200 text-black-700 rounded-lg hover:bg-black-300 transition font-medium whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            title="Filter type"
            className="px-4 py-2 bg-white border border-black-300 rounded-lg focus:outline-none focus:border-green-500 shadow-sm text-black-900"
          >
            <option value="Name">Student Name</option>
            <option value="Diagnosis">Diagnosis</option>
          </select>
          <select
            value={healthStatusFilter}
            onChange={(e) => setHealthStatusFilter(e.target.value)}
            title="Health status filter"
            className="px-4 py-2 bg-white border border-black-300 rounded-lg focus:outline-none focus:border-green-500 shadow-sm text-black-900"
          >
            <option value="All">All Health Status</option>
            <option value="perfectly_ok">Perfectly Healthy</option>
            <option value="moderately_healthy">Moderately Healthy</option>
            <option value="healthy">Healthy</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
          <div className="bg-white rounded-lg border border-black-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-black-500">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total_students}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-black-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-black-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-black-500">Total Records</p>
                <p className="text-2xl font-bold text-black-900">{stats.total_records}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-black-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-black-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-black-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-black-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table (screen - paginated) */}
        <div className="bg-white rounded-lg border border-black-200 overflow-hidden shadow-sm print:hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black-50 border-b border-black-200">
                <tr>
                  <th className="text-left px-2 py-3 text-sm font-semibold text-black-700">Student Name</th>
                  <th className="text-left px-2 py-3 text-sm font-semibold text-black-700">Mat.Number</th>
                  <th className="text-left px-2 py-3 text-sm font-semibold text-black-700">Program</th>
                  <th className="text-left px-2 py-3 text-sm font-semibold text-black-700">Diagnosis</th>
                  <th className="text-left px-2 py-3 text-sm font-semibold text-black-700">Health %</th>
                  <th className="text-left px-2 py-3 text-sm font-semibold text-black-700">Status</th>
                  <th className="text-left px-2 py-3 text-sm font-semibold text-black-700">Date</th>
                  <th className="text-right px-2 py-3 text-sm font-semibold textblacktext-blacky-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-black-500">Loading...</td>
                  </tr>
                ) : currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-black-500">No records found</td>
                  </tr>
                ) : (
                  currentRecords.map((record) => (
                    <tr key={record.id} className="border-b border-black-200 hover:bg-black-50 transition">
                      <td className="px-6 py-4 text-sm text-black-900 font-medium">{record.student_name}</td>
                      <td className="px-6 py-4 text-sm text-black-600">{record.matriculation_number || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-black-600">{record.program}</td>
                      <td className="px-6 py-4 text-sm text-black-600 max-w-xs truncate">{record.diagnosis || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">
                        {record.health_percentage != null ? (
                          <span className={`font-semibold ${
                            record.health_percentage >= 80 ? 'text-green-600' :
                            record.health_percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {record.health_percentage}%
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          record.is_completed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {record.is_completed ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-black-500">{formatDate(record.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition shadow-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleStartEdit(record)}
                            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition shadow-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(record)}
                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition shadow-sm"
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
          </div>

        {/* Print-only table (all filtered records) */}
        <div className="hidden print:block">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-black-400">
                <th className="text-left px-3 py-2 text-xs font-bold text-black-800">Student Name</th>
                <th className="text-left px-3 py-2 text-xs font-bold text-black-800">Mat. Number</th>
                <th className="text-left px-3 py-2 text-xs font-bold text-black-800">Program</th>
                <th className="text-left px-3 py-2 text-xs font-bold text-black-800">Diagnosis</th>
                <th className="text-left px-3 py-2 text-xs font-bold text-black-800">Health %</th>
                <th className="text-left px-3 py-2 text-xs font-bold text-black-800">Status</th>
                <th className="text-left px-3 py-2 text-xs font-bold text-black-800">Report ID</th>
                <th className="text-left px-3 py-2 text-xs font-bold text-black-800">Password</th>
                <th className="text-left px-3 py-2 text-xs font-bold text-black-800">Login Link</th>
                <th className="text-left px-3 py-2 text-xs font-bold text-black-800">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id} className="border-b border-black-200">
                  <td className="px-3 py-1.5 text-xs text-black-900">{record.student_name}</td>
                  <td className="px-3 py-1.5 text-xs text-black-700">{record.matriculation_number || 'N/A'}</td>
                  <td className="px-3 py-1.5 text-xs text-black-700">{record.program}</td>
                  <td className="px-3 py-1.5 text-xs text-black-700">{record.diagnosis || 'N/A'}</td>
                  <td className="px-3 py-1.5 text-xs text-black-900 font-semibold">{record.health_percentage != null ? `${record.health_percentage}%` : 'N/A'}</td>
                  <td className="px-3 py-1.5 text-xs text-black-700">{record.is_completed ? 'Completed' : 'Pending'}</td>
                  <td className="px-3 py-1.5 text-xs text-black-700 font-mono">{record.medical_report_id || 'N/A'}</td>
                  <td className="px-3 py-1.5 text-xs text-black-700 font-mono">{record.student_password || 'N/A'}</td>
                  <td className="px-3 py-1.5 text-xs text-blue-700">/student/login</td>
                  <td className="px-3 py-1.5 text-xs text-black-600">{formatDate(record.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-6 text-center text-xs text-black-500 border-t border-black-300 pt-4">
            <p>This is an official document from Ernest Bai Koroma University of Science and Technology</p>
            <p className="mt-1 font-semibold">EBK &mdash; The only institution where technology lives</p>
            <p className="mt-1">&copy; EBKUSTSL 2026. All rights reserved.</p>
          </div>
        </div>

          {/* Pagination */}
          {!loading && filteredRecords.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-black-200 bg-black-50 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-sm text-black-700">Rows per page:</span>
                <span className="text-sm font-semibold text-black-900">{rowsPerPage}</span>
              </div>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg transition ${
                      currentPage === i + 1
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-white border border-black-300 text-black-700 hover:bg-black-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                {totalPages > 5 && (
                  <>
                    <span className="text-black-500">...</span>
                    <span className="text-sm text-black-700">{totalPages}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Record Detail Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 print:hidden">
            <div className="bg-white border border-black-200 rounded-2xl shadow-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-black-900">Medical Record Details</h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-black-400 hover:text-black-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Student Info */}
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <h4 className="text-sm font-semibold text-green-800 mb-2">Student Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-black-500">Name</p>
                      <p className="font-medium text-black-900">{selectedRecord.student_name}</p>
                    </div>
                    <div>
                      <p className="text-black-500">Mat. Number</p>
                      <p className="font-medium text-black-900">{selectedRecord.matriculation_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-black-500">App Number</p>
                      <p className="font-medium text-black-900">{selectedRecord.appid || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-black-500">Program</p>
                      <p className="font-medium text-black-900">{selectedRecord.program}</p>
                    </div>
                    <div>
                      <p className="text-black-500">Faculty</p>
                      <p className="font-medium text-black-900">{selectedRecord.faculty || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Examination Data */}
                <div className="bg-black-50 rounded-xl p-4 border border-black-200">
                  <h4 className="text-sm font-semibold text-black-800 mb-2">Examination Data</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-black-500">Weight</p>
                      <p className="font-medium text-black-900">{selectedRecord.weight ? `${selectedRecord.weight} kg` : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-black-500">Height</p>
                      <p className="font-medium text-black-900">{selectedRecord.height ? `${selectedRecord.height} cm` : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-black-500">Blood Group</p>
                      <p className="font-medium text-black-900">{selectedRecord.blood_group || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-black-500">Health %</p>
                      <p className={`font-bold ${
                        (selectedRecord.health_percentage || 0) >= 80 ? 'text-green-600' :
                        (selectedRecord.health_percentage || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {selectedRecord.health_percentage != null ? `${selectedRecord.health_percentage}%` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Diagnosis */}
                {selectedRecord.diagnosis && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-800 mb-1">Diagnosis</h4>
                    <p className="text-sm text-black-900">{selectedRecord.diagnosis}</p>
                  </div>
                )}

                {/* Health Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-black-500">Health Status</p>
                    <p className="font-semibold text-black-900 capitalize">{selectedRecord.health_status?.replace('_', ' ') || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-black-500">Examined by</p>
                    <p className="font-semibold text-black-900">{selectedRecord.medical_officer_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-black-500">Date</p>
                    <p className="font-semibold text-black-900">{formatDate(selectedRecord.completed_at || selectedRecord.created_at)}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="flex-1 px-6 py-3 bg-black-200 text-black-700 rounded-xl font-semibold hover:bg-black-300 transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleStartEdit(selectedRecord)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => { setDeleteConfirm(selectedRecord); }}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Edit Record Modal */}
        <Modal
          isOpen={!!editingRecord}
          onClose={() => setEditingRecord(null)}
          title={`Edit Record — ${editingRecord?.student_name || ''}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black-700 mb-1">Diagnosis</label>
                <input
                  type="text"
                  value={editForm.diagnosis}
                  onChange={(e) => setEditForm({ ...editForm, diagnosis: e.target.value })}
                  className="w-full px-3 py-2 border border-black-300 rounded-lg focus:outline-none focus:border-green-500 text-black-900"
                  placeholder="Enter diagnosis"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black-700 mb-1">Health Status</label>
                <select
                  title="Health Status"
                  value={editForm.health_status}
                  onChange={(e) => setEditForm({ ...editForm, health_status: e.target.value })}
                  className="w-full px-3 py-2 border border-black-300 rounded-lg focus:outline-none focus:border-green-500 text-black-900"
                >
                  <option value="">Select status</option>
                  <option value="perfectly_ok">Perfectly Healthy</option>
                  <option value="moderately_healthy">Moderately Healthy</option>
                  <option value="healthy">Healthy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black-700 mb-1">Health %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.health_percentage}
                  onChange={(e) => setEditForm({ ...editForm, health_percentage: e.target.value })}
                  className="w-full px-3 py-2 border border-black-300 rounded-lg focus:outline-none focus:border-green-500 text-black-900"
                  placeholder="0-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black-700 mb-1">Blood Group</label>
                <select
                  title="Blood Group"
                  value={editForm.blood_group}
                  onChange={(e) => setEditForm({ ...editForm, blood_group: e.target.value })}
                  className="w-full px-3 py-2 border border-black-300 rounded-lg focus:outline-none focus:border-green-500 text-black-900"
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editForm.weight}
                  onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                  className="w-full px-3 py-2 border border-black-300 rounded-lg focus:outline-none focus:border-green-500 text-black-900"
                  placeholder="Weight in kg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editForm.height}
                  onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                  className="w-full px-3 py-2 border border-black-300 rounded-lg focus:outline-none focus:border-green-500 text-black-900"
                  placeholder="Height in cm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Additional Notes</label>
              <textarea
                value={editForm.additional_notes}
                onChange={(e) => setEditForm({ ...editForm, additional_notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-black-300 rounded-lg focus:outline-none focus:border-green-500 text-black-900"
                placeholder="Any additional notes..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="px-6 py-2.5 border border-black-300 rounded-lg hover:bg-black-100 transition font-medium text-black-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditSave}
                disabled={editSaving}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-black-400 shadow-sm"
              >
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Dialog */}
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Medical Record"
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                Are you sure you want to delete the medical record for{' '}
                <span className="font-bold">{deleteConfirm?.student_name}</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-6 py-2.5 border border-black-300 rounded-lg hover:bg-black-100 transition font-medium text-black-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-black-400 shadow-sm"
              >
                {deleting ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
