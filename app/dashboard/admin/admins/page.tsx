'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/frontend/components/dashboard/DashboardLayout';
import { Modal } from '@/frontend/components/ui/Modal';

interface Admin {
  id: number;
  full_name: string;
  email: string;
  designation: string;
  campus: string;
  role: string;
  status: 'activated' | 'invited' | 'deactivated';
}

const CAMPUSES = ['Magburaka Campus', 'Makeni Campus', 'Portloko Campus', 'University Secretariat'];
const ROLES = [ 'ICT Director','Super Admin', 'University Medical Officer', 'Registrar', 'Deputy Registrar', 'ICT Director', 'Medical Staff'];
const DESIGNATIONS = ['Medical Officer', 'Admin', 'Dr', 'Vice-Chancellor and Principal', 'Deputy Registrar', 'Medical'];

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Email');
  const [searching, setSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    email: '',
    full_name: '',
    password: '',
    designation: '',
    campus: '',
    role: '',
  });
  const [inviteResult, setInviteResult] = useState<{ show: boolean; success: boolean; email: string; password: string; message: string }>({ show: false, success: false, email: '', password: '', message: '' });
  const [inviting, setInviting] = useState(false);

  // Reset password state
  const [resetTarget, setResetTarget] = useState<Admin | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState<{ show: boolean; success: boolean; message: string }>({ show: false, success: false, message: '' });

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    filterAdmins();
  }, [admins, searchTerm]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users?role=all&limit=1000', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setAdmins(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      // Mock data for demo
      setAdmins([
        {
          id: 1,
          full_name: 'Larry Hindowa Magoiby',
          email: 'lhmagioby@ebkustsl.edu.sl',
          designation: 'ICT Officer',
          campus: 'Magburaka Campus',
          role: 'REGISTRY',
          status: 'activated',
        },
        {
          id: 2,
          full_name: 'Patricia Hawa Tucker',
          email: 'phtucker@ebkustsl.edu.sl',
          designation: 'Software Systems Administrator',
          campus: 'University Secretariat',
          role: 'SUPER ADMIN',
          status: 'activated',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterAdmins = () => {
    if (!searchTerm) {
      setFilteredAdmins(admins);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = admins.filter((admin) => {
      if (filterType === 'Email') {
        return admin.email.toLowerCase().includes(term);
      } else if (filterType === 'Full name') {
        return admin.full_name.toLowerCase().includes(term);
      } else if (filterType === 'Designation') {
        return admin.designation?.toLowerCase().includes(term);
      } else if (filterType === 'Location') {
        return admin.campus?.toLowerCase().includes(term);
      }
      return false;
    });
    setFilteredAdmins(filtered);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setSearching(true);
    filterAdmins();
    setSearching(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredAdmins(admins);
    setCurrentPage(1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(inviteForm),
      });

      const data = await response.json();
      if (data.success) {
        setShowInviteModal(false);
        setInviteResult({
          show: true,
          success: true,
          email: data.data?.email || inviteForm.email,
          password: data.data?.temporary_password || inviteForm.password,
          message: 'Admin account created successfully!',
        });
        setInviteForm({
          email: '',
          full_name: '',
          password: '',
          designation: '',
          campus: '',
          role: '',
        });
        fetchAdmins();
      } else {
        setInviteResult({
          show: true,
          success: false,
          email: '',
          password: '',
          message: data.error || 'Failed to create admin',
        });
      }
    } catch (error) {
      console.error('Failed to invite admin:', error);
      setInviteResult({
        show: true,
        success: false,
        email: '',
        password: '',
        message: 'Failed to create admin. Please try again.',
      });
    } finally {
      setInviting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget || !newPassword) return;
    setResetting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: resetTarget.id, new_password: newPassword }),
      });
      const data = await response.json();
      setResetTarget(null);
      setNewPassword('');
      if (data.success) {
        setResetResult({ show: true, success: true, message: data.message });
      } else {
        setResetResult({ show: true, success: false, message: data.error || 'Failed to reset password' });
      }
    } catch (error) {
      console.error('Failed to reset password:', error);
      setResetTarget(null);
      setNewPassword('');
      setResetResult({ show: true, success: false, message: 'Failed to reset password' });
    } finally {
      setResetting(false);
    }
  };

  // Pagination
  const indexOfLastAdmin = currentPage * rowsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - rowsPerPage;
  const currentAdmins = filteredAdmins.slice(
    indexOfFirstAdmin,
    indexOfLastAdmin
  );
  const totalPages = Math.ceil(filteredAdmins.length / rowsPerPage);

  return (
    <DashboardLayout role="super_admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black-900">System Admins</h1>
          <div className="flex gap-3">
            <button
              onClick={fetchAdmins}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
            >
              <span>🔄</span>
              Refresh
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              <span>+</span>
              Invite new
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
            className="px-4 py-2 bg-white border border-black-300 rounded-lg focus:outline-none focus:border-blue-500 shadow-sm"
          >
            <option value="Email">Email</option>
            <option value="Full name">Full name</option>
            <option value="Designation">Designation</option>
            <option value="Location">Location</option>
          </select>
          <button type="button" className="px-4 py-2 bg-white border border-black-300 rounded-lg hover:bg-black-50 transition shadow-sm">
            🖨️
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-black-300 overflow-hidden">
          <table className="w-full">
            <thead className="bg-black-100 border-b border-black-300">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-black-700">
                  Full name
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-black-700">
                  Email
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-black-700">
                  Designation
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-black-700">
                  Location
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-black-700">
                  Role
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-black-700">
                  Status
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
              ) : currentAdmins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-black-500">
                    No admins found
                  </td>
                </tr>
              ) : (
                currentAdmins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="border-b border-black-200 hover:bg-black-50"
                  >
                    <td className="px-6 py-4 text-sm text-blue-600">
                      {admin.full_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600">
                      {admin.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600">
                      {admin.designation || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-orange-600">
                      {admin.campus || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600 font-semibold">
                      {admin.role}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          admin.status === 'activated'
                            ? 'bg-orange-100 text-orange-700'
                            : admin.status === 'invited'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-black-100 text-black-700'
                        }`}
                      >
                        {admin.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => { setResetTarget(admin); setNewPassword(''); }}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition shadow-sm"
                      >
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {!loading && filteredAdmins.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-black-200 bg-black-50">
              <div className="flex items-center gap-2">
                <span className="text-sm text-black-700">Rows per page</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="text-sm border border-black-300 rounded px-2 py-1"
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>All</option>
                </select>
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
              </div>
            </div>
          )}
        </div>

        {/* Invite Admin Modal */}
        <Modal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          title="Invite Admin"
          size="md"
        >
          <form onSubmit={handleInviteAdmin} className="space-y-4">
            <input
              type="email"
              placeholder="Staff Email"
              value={inviteForm.email}
              onChange={(e) =>
                setInviteForm({ ...inviteForm, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-black-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Full name"
              value={inviteForm.full_name}
              onChange={(e) =>
                setInviteForm({ ...inviteForm, full_name: e.target.value })
              }
              className="w-full px-4 py-2 border border-black-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
            <div>
              <input
                type="text"
                placeholder="Password (min 6 characters)"
                value={inviteForm.password}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, password: e.target.value })
                }
                className="w-full px-4 py-2 border border-black-300 rounded focus:outline-none focus:border-blue-500"
                required
                minLength={6}
              />
              <p className="text-xs text-black-500 mt-1">Set the login password for this admin</p>
            </div>
            <select
              value={inviteForm.designation}
              onChange={(e) =>
                setInviteForm({ ...inviteForm, designation: e.target.value })
              }
              className="w-full px-4 py-2 border border-black-300 rounded focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Designation</option>
              {DESIGNATIONS.map((designation) => (
                <option key={designation} value={designation}>
                  {designation}
                </option>
              ))}
            </select>
            <select
              value={inviteForm.campus}
              onChange={(e) =>
                setInviteForm({ ...inviteForm, campus: e.target.value })
              }
              className="w-full px-4 py-2 border border-black-300 rounded focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Campus</option>
              {CAMPUSES.map((campus) => (
                <option key={campus} value={campus}>
                  {campus}
                </option>
              ))}
            </select>
            <select
              value={inviteForm.role}
              onChange={(e) =>
                setInviteForm({ ...inviteForm, role: e.target.value })
              }
              className="w-full px-4 py-2 border border-black-300 rounded focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Role</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="px-6 py-2 border border-black-300 rounded hover:bg-black-100 transition"
                disabled={inviting}
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={inviting}
                className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:bg-black-300 disabled:cursor-not-allowed"
              >
                {inviting ? 'Creating...' : 'CREATE ADMIN'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Reset Password Modal */}
        <Modal
          isOpen={!!resetTarget}
          onClose={() => !resetting && setResetTarget(null)}
          title="Reset Password"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-black-600">
              Reset password for <span className="font-semibold text-black-900">{resetTarget?.full_name}</span>
              <br />
              <span className="text-black-500">{resetTarget?.email}</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">New Password</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-2 border border-black-300 rounded-lg focus:outline-none focus:border-blue-500 text-black-800"
                disabled={resetting}
                autoFocus
              />
              <p className="text-xs text-black-500 mt-1">Minimum 6 characters</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResetTarget(null)}
                className="px-5 py-2 border border-black-300 rounded-lg hover:bg-black-50 transition"
                disabled={resetting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resetting || newPassword.length < 6}
                className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold disabled:bg-black-300 disabled:cursor-not-allowed"
              >
                {resetting ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Invite Result Popup */}
        {inviteResult.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className={`${inviteResult.success ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'} border rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4`}>
              <div className="text-center mb-4">
                <div className={`w-14 h-14 ${inviteResult.success ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  {inviteResult.success ? (
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
                  {inviteResult.success ? 'Admin Created Successfully' : 'Failed to Create Admin'}
                </h3>
                <p className="text-sm text-black-600 mt-1">{inviteResult.message}</p>
              </div>
              {inviteResult.success && (
                <div className="bg-white border border-black-200 rounded-xl p-4 mb-4 space-y-2">
                  <div>
                    <span className="text-xs text-black-500 font-medium">Email</span>
                    <p className="text-sm font-semibold text-black-900">{inviteResult.email}</p>
                  </div>
                  <div>
                    <span className="text-xs text-black-500 font-medium">Password</span>
                    <p className="text-sm font-semibold text-black-900">{inviteResult.password}</p>
                  </div>
                  <p className="text-xs text-orange-600 mt-2">Save these credentials - the password cannot be viewed again.</p>
                </div>
              )}
              <button
                onClick={() => setInviteResult({ show: false, success: false, email: '', password: '', message: '' })}
                className={`w-full mt-1 px-6 py-3 ${inviteResult.success ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-xl font-semibold transition shadow-sm`}
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Reset Result Popup */}
        {resetResult.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className={`${resetResult.success ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'} border rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4`}>
              <div className="text-center mb-4">
                <div className={`w-14 h-14 ${resetResult.success ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  {resetResult.success ? (
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
                  {resetResult.success ? 'Password Reset Successful' : 'Password Reset Failed'}
                </h3>
                <p className="text-sm text-black-600 mt-1">{resetResult.message}</p>
              </div>
              <button
                onClick={() => setResetResult({ show: false, success: false, message: '' })}
                className={`w-full mt-3 px-6 py-3 ${resetResult.success ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-xl font-semibold transition shadow-sm`}
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
