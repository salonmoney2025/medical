'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/frontend/components/ui/Modal';

interface ProfileDropdownProps {
  user: {
    email: string;
    full_name: string;
    role: string;
  };
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Fetch profile image on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/users/profile-image', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data?.profile_image) {
            setProfileImage(data.data.profile_image);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!passwordForm.old_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.new_password.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    if (passwordForm.old_password === passwordForm.new_password) {
      setPasswordError('New password must be different from old password');
      return;
    }

    setPasswordLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/change-password', {
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
        setPasswordSuccess('Password changed successfully!');
        setPasswordForm({
          old_password: '',
          new_password: '',
          confirm_password: '',
        });
        setTimeout(() => {
          setShowChangePasswordModal(false);
          setPasswordSuccess('');
        }, 2000);
      } else {
        setPasswordError(data.error || 'Failed to change password');
      }
    } catch (error) {
      setPasswordError('An error occurred while changing password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const roleLabel = user.role === 'super_admin' ? 'Super Admin' : 'Medical Officer';

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Profile Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-black-100 transition"
        >
          {/* Profile avatar */}
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-black-200 shadow-sm flex items-center justify-center">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-semibold text-black-800 leading-tight">{user.full_name}</p>
            <p className="text-[11px] text-black-500 leading-tight">{roleLabel}</p>
          </div>
          <svg
            className="w-4 h-4 text-black-400 hidden sm:block"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-black-200 py-2 z-50">
            {/* Signed in as */}
            <div className="px-4 py-3 border-b border-black-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-black-200 shrink-0">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-black-900 truncate">{user.full_name}</p>
                  <p className="text-xs text-black-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowChangePasswordModal(true);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-black-700 hover:bg-black-50 transition flex items-center gap-3"
              >
                <svg className="w-4 h-4 text-black-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Change Password
              </button>
            </div>

            <div className="border-t border-black-100 my-1" />

            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log Out
            </button>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showChangePasswordModal}
        onClose={() => {
          setShowChangePasswordModal(false);
          setPasswordError('');
          setPasswordSuccess('');
          setPasswordForm({
            old_password: '',
            new_password: '',
            confirm_password: '',
          });
        }}
        title="Change password"
        size="md"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black-700 mb-2">
              Old password
            </label>
            <input
              type="password"
              value={passwordForm.old_password}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, old_password: e.target.value })
              }
              className="w-full px-4 py-2 border border-black-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Enter your current password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black-700 mb-2">
              New password
            </label>
            <input
              type="password"
              value={passwordForm.new_password}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, new_password: e.target.value })
              }
              className="w-full px-4 py-2 border border-black-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Enter new password (min 8 characters)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black-700 mb-2">
              Confirm new password
            </label>
            <input
              type="password"
              value={passwordForm.confirm_password}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
              }
              className="w-full px-4 py-2 border border-black-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Confirm your new password"
              required
            />
          </div>

          {passwordError && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded">
              {passwordSuccess}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowChangePasswordModal(false);
                setPasswordError('');
                setPasswordSuccess('');
                setPasswordForm({
                  old_password: '',
                  new_password: '',
                  confirm_password: '',
                });
              }}
              className="px-6 py-2 border border-black-300 rounded hover:bg-black-100 transition"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:bg-black-400"
            >
              {passwordLoading ? 'CHANGING...' : 'CHANGE'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
