'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/frontend/components/dashboard/DashboardLayout';

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
}

interface RecordStats {
  total_students: number;
  total_records: number;
  completed: number;
  pending: number;
}

export default function MedicalOfficerRecordsPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
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
        <div className="hidden print:block text-center mb-6 border-b-2 border-gray-300 pb-4">
          <h1 className="text-xl font-bold">ERNEST BAI KOROMA UNIVERSITY OF SCIENCE AND TECHNOLOGY</h1>
          <p className="text-sm mt-1">Office of the Registrar - Medical Records Report</p>
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
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={getPlaceholder()}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 placeholder-gray-500"
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
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 shadow-sm text-gray-900"
          >
            <option value="Name">Student Name</option>
            <option value="Diagnosis">Diagnosis</option>
          </select>
          <select
            value={healthStatusFilter}
            onChange={(e) => setHealthStatusFilter(e.target.value)}
            title="Health status filter"
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 shadow-sm text-gray-900"
          >
            <option value="All">All Health Status</option>
            <option value="perfectly_ok">Perfectly Healthy</option>
            <option value="moderately_healthy">Moderately Healthy</option>
            <option value="healthy">Healthy</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total_students}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_records}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table (screen - paginated) */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm print:hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Student Name</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Mat. Number</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Program</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Diagnosis</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Health %</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">Loading...</td>
                  </tr>
                ) : currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">No records found</td>
                  </tr>
                ) : (
                  currentRecords.map((record) => (
                    <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{record.student_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.matriculation_number || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.program}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{record.diagnosis || 'N/A'}</td>
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
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(record.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition shadow-sm"
                        >
                          View Details
                        </button>
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
              <tr className="border-b-2 border-gray-400">
                <th className="text-left px-3 py-2 text-xs font-bold text-gray-800">Student Name</th>
                <th className="text-left px-3 py-2 text-xs font-bold text-gray-800">Mat. Number</th>
                <th className="text-left px-3 py-2 text-xs font-bold text-gray-800">Program</th>
                <th className="text-left px-3 py-2 text-xs font-bold text-gray-800">Diagnosis</th>
                <th className="text-left px-3 py-2 text-xs font-bold text-gray-800">Health %</th>
                <th className="text-left px-3 py-2 text-xs font-bold text-gray-800">Status</th>
                <th className="text-left px-3 py-2 text-xs font-bold text-gray-800">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id} className="border-b border-gray-200">
                  <td className="px-3 py-1.5 text-xs text-gray-900">{record.student_name}</td>
                  <td className="px-3 py-1.5 text-xs text-gray-700">{record.matriculation_number || 'N/A'}</td>
                  <td className="px-3 py-1.5 text-xs text-gray-700">{record.program}</td>
                  <td className="px-3 py-1.5 text-xs text-gray-700">{record.diagnosis || 'N/A'}</td>
                  <td className="px-3 py-1.5 text-xs text-gray-900 font-semibold">{record.health_percentage != null ? `${record.health_percentage}%` : 'N/A'}</td>
                  <td className="px-3 py-1.5 text-xs text-gray-700">{record.is_completed ? 'Completed' : 'Pending'}</td>
                  <td className="px-3 py-1.5 text-xs text-gray-600">{formatDate(record.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

          {/* Pagination */}
          {!loading && filteredRecords.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Rows per page:</span>
                <span className="text-sm font-semibold text-gray-900">{rowsPerPage}</span>
              </div>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg transition ${
                      currentPage === i + 1
                        ? 'bg-green-500 text-white shadow-md'
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

        {/* Record Detail Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 print:hidden">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Medical Record Details</h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600 transition"
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
                      <p className="text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">{selectedRecord.student_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Mat. Number</p>
                      <p className="font-medium text-gray-900">{selectedRecord.matriculation_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">App Number</p>
                      <p className="font-medium text-gray-900">{selectedRecord.appid || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Program</p>
                      <p className="font-medium text-gray-900">{selectedRecord.program}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Faculty</p>
                      <p className="font-medium text-gray-900">{selectedRecord.faculty || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Examination Data */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Examination Data</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Weight</p>
                      <p className="font-medium text-gray-900">{selectedRecord.weight ? `${selectedRecord.weight} kg` : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Height</p>
                      <p className="font-medium text-gray-900">{selectedRecord.height ? `${selectedRecord.height} cm` : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Blood Group</p>
                      <p className="font-medium text-gray-900">{selectedRecord.blood_group || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Health %</p>
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
                    <p className="text-sm text-gray-900">{selectedRecord.diagnosis}</p>
                  </div>
                )}

                {/* Health Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Health Status</p>
                    <p className="font-semibold text-gray-900 capitalize">{selectedRecord.health_status?.replace('_', ' ') || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Examined by</p>
                    <p className="font-semibold text-gray-900">{selectedRecord.medical_officer_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedRecord.completed_at || selectedRecord.created_at)}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="w-full mt-5 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
