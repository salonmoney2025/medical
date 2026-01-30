'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/frontend/components/dashboard/DashboardLayout';

interface GeneratedReport {
  id: number;
  report_id: string;
  appid: string;
  full_name: string;
  program: string;
  campus: string;
  status: 'assigned' | 'pending';
}

export default function GeneratedIDsPage() {
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ID/MAT');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(20);
  const [revokeTarget, setRevokeTarget] = useState<GeneratedReport | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [revokeResult, setRevokeResult] = useState<{ show: boolean; success: boolean; message: string }>({ show: false, success: false, message: '' });

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm]);

  const fetchReports = async () => {
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
        // Transform students to generated reports format
        const reportsData = data.data
          .filter((s: any) => s.medical_report_id)
          .map((s: any) => ({
            id: s.id,
            report_id: s.medical_report_id || s.matriculation_number,
            appid: s.appid || s.matriculation_number,
            full_name: s.name,
            program: s.program,
            campus: s.campus || 'N/A',
            status: s.report_status || 'pending',
          }));
        setReports(reportsData);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    if (!searchTerm) {
      setFilteredReports(reports);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = reports.filter((report) => {
      if (filterType === 'ID/MAT') {
        return (
          report.report_id.toLowerCase().includes(term) ||
          report.appid.toLowerCase().includes(term)
        );
      } else if (filterType === 'APPID') {
        return report.appid.toLowerCase().includes(term);
      } else if (filterType === 'Full name') {
        return report.full_name.toLowerCase().includes(term);
      } else if (filterType === 'Program') {
        return report.program.toLowerCase().includes(term);
      } else if (filterType === 'Campus') {
        return report.campus.toLowerCase().includes(term);
      }
      return false;
    });
    setFilteredReports(filtered);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setSearching(true);
    filterReports();
    setSearching(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredReports(reports);
    setCurrentPage(1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAssign = async (reportId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/students/${reportId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        fetchReports();
      }
    } catch (error) {
      console.error('Failed to assign report:', error);
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
      setRevokeTarget(null);
      if (data.success) {
        setRevokeResult({ show: true, success: true, message: `Medical Report ID revoked for ${revokeTarget.full_name}` });
        fetchReports();
      } else {
        setRevokeResult({ show: true, success: false, message: data.error || 'Failed to revoke' });
      }
    } catch (error) {
      console.error('Failed to revoke report:', error);
      setRevokeTarget(null);
      setRevokeResult({ show: true, success: false, message: 'Failed to revoke medical report ID' });
    } finally {
      setRevoking(false);
    }
  };

  // Pagination
  const indexOfLastReport = currentPage * rowsPerPage;
  const indexOfFirstReport = indexOfLastReport - rowsPerPage;
  const currentReports = filteredReports.slice(
    indexOfFirstReport,
    indexOfLastReport
  );
  const totalPages = Math.ceil(filteredReports.length / rowsPerPage);

  return (
    <DashboardLayout role="super_admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black-900">
            List of Generated IDs
          </h1>
          <div className="flex gap-3">
            <button
              onClick={fetchReports}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
            >
              <span>🔄</span>
              Refresh
            </button>
            <button className="px-4 py-2 bg-white border border-black-300 rounded hover:bg-black-50 transition">
              📥
            </button>
            <button className="px-4 py-2 bg-white border border-black-300 rounded hover:bg-black-50 transition">
              🖨️
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
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
                placeholder={`Search ${filterType.toLowerCase()}...`}
                className="w-full pl-10 pr-4 py-2 bg-white border border-black-300 rounded-lg focus:outline-none focus:border-blue-500 text-black-800 placeholder-black-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-5 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-semibold shadow-sm whitespace-nowrap"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
            {searchTerm && (
              <button
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
            className="px-4 py-2 bg-white border border-black-300 rounded-lg focus:outline-none focus:border-blue-500 shadow-sm"
          >
            <option value="ID/MAT">ID/MAT</option>
            <option value="APPID">APPID</option>
            <option value="Full name">Full name</option>
            <option value="Program">Program</option>
            <option value="Campus">Campus</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-black-300 overflow-hidden">
          <table className="w-full">
            <thead className="bg-black-100 border-b border-black-300">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-black-700">
                  ID/MAT
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-black-700">
                  APPID
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-black-700">
                  Full name
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-black-700">
                  Program
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-black-700">
                  Campus
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-black-700">
                  Mode
                </th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-black-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-black-500">
                    Loading...
                  </td>
                </tr>
              ) : currentReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-black-500">
                    No generated reports found
                  </td>
                </tr>
              ) : (
                currentReports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-black-200 hover:bg-black-50"
                  >
                    <td className="px-6 py-4 text-sm text-black-900">
                      {report.report_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-black-900">
                      {report.appid}
                    </td>
                    <td className="px-6 py-4 text-sm text-black-900">
                      {report.full_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600">
                      {report.program}
                    </td>
                    <td className="px-6 py-4 text-sm text-black-900">
                      {report.campus}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded text-sm font-semibold ${
                          report.status === 'assigned'
                            ? 'bg-yellow-400 text-black-900'
                            : 'bg-black-200 text-black-700'
                        }`}
                      >
                        {report.status === 'assigned' ? 'Assigned' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {report.status !== 'assigned' && (
                          <button
                            onClick={() => handleAssign(report.id)}
                            className="px-3 py-1 bg-yellow-400 text-black-900 rounded text-sm font-semibold hover:bg-yellow-500 transition"
                          >
                            Assigned
                          </button>
                        )}
                        <button
                          onClick={() => setRevokeTarget(report)}
                          className="px-3 py-1 bg-pink-200 text-pink-700 rounded text-sm font-semibold hover:bg-pink-300 transition"
                        >
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {!loading && filteredReports.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-black-200 bg-black-50">
              <div className="flex items-center gap-2">
                <span className="text-sm text-black-700">Rows per page</span>
                <span className="text-sm font-semibold text-black-900">
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
                        : 'bg-black-200 text-black-700 hover:bg-black-300'
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

        {/* Revoke Confirmation Modal */}
        {revokeTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white border border-black-300 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-black-900">Revoke Medical Report ID</h3>
                <p className="text-sm text-black-600 mt-2">
                  Are you sure you want to revoke the medical report ID for <span className="font-semibold text-black-900">{revokeTarget.full_name}</span>?
                </p>
                <p className="text-xs text-black-500 mt-1">
                  Report ID: <span className="font-mono font-semibold">{revokeTarget.report_id}</span>
                </p>
                <p className="text-xs text-red-500 mt-2">This action will remove the assigned ID and password.</p>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setRevokeTarget(null)}
                  disabled={revoking}
                  className="flex-1 px-4 py-3 border border-black-300 rounded-xl font-semibold hover:bg-black-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevoke}
                  disabled={revoking}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition disabled:bg-black-300"
                >
                  {revoking ? 'Revoking...' : 'Revoke'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Revoke Result Popup */}
        {revokeResult.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className={`${revokeResult.success ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'} border rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4`}>
              <div className="text-center mb-4">
                <div className={`w-14 h-14 ${revokeResult.success ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  {revokeResult.success ? (
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-bold text-black-900">
                  {revokeResult.success ? 'Revoked Successfully' : 'Revoke Failed'}
                </h3>
                <p className="text-sm text-black-600 mt-1">{revokeResult.message}</p>
              </div>
              <button
                onClick={() => setRevokeResult({ show: false, success: false, message: '' })}
                className={`w-full mt-3 px-6 py-3 ${revokeResult.success ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-xl font-semibold transition shadow-sm`}
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
