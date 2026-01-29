'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

interface SystemLog {
  id: number;
  action: string;
  initiator: string;
  status: 'success' | 'failure';
  role: string;
  created_at: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('initiator');
  const [searching, setSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(20);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/logs?limit=1000', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      // For demo purposes, use mock data if API fails
      setLogs([
        {
          id: 1,
          action: 'Login Admin',
          initiator: 'mat@ebkustsl.edu.sl',
          status: 'success',
          role: 'admin',
          created_at: '2026-01-28 20:23:49',
        },
        {
          id: 2,
          action: 'Create Student',
          initiator: 'mat@ebkustsl.edu.sl',
          status: 'success',
          role: 'admin',
          created_at: '2026-01-28 14:17:52',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    if (!searchTerm) {
      setFilteredLogs(logs);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = logs.filter((log) => {
      if (filterType === 'initiator') {
        return log.initiator.toLowerCase().includes(term);
      } else if (filterType === 'action') {
        return log.action.toLowerCase().includes(term);
      } else if (filterType === 'status') {
        return log.status.toLowerCase().includes(term);
      }
      return false;
    });
    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setSearching(true);
    filterLogs();
    setSearching(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredLogs(logs);
    setCurrentPage(1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  // Pagination
  const indexOfLastLog = currentPage * rowsPerPage;
  const indexOfFirstLog = indexOfLastLog - rowsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);

  return (
    <DashboardLayout role="super_admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
          >
            <span>🔄</span>
            Refresh
          </button>
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
                placeholder={`Search ${filterType}...`}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-800 placeholder-gray-500"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold shadow-sm whitespace-nowrap"
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
            <option value="initiator">Initiator</option>
            <option value="action">Action</option>
            <option value="status">Status</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                  Action
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                  Initiator
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                  Role
                </th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">
                  Date
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
              ) : currentLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No logs found
                  </td>
                </tr>
              ) : (
                currentLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm text-blue-600">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600">
                      {log.initiator}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          log.status === 'success'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.role}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {formatDate(log.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {!loading && filteredLogs.length > 0 && (
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
      </div>
    </DashboardLayout>
  );
}
