'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

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

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Profile Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700 transition"
        >
          <div className="w-8 h-8 bg-primary-gold rounded-full flex items-center justify-center">
            <span className="text-secondary-black font-semibold text-sm">
              {user.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm text-white font-medium uppercase">
              {user.role === 'super_admin' ? 'SUPER ADMIN' : 'MEDICAL OFFICER'}
            </p>
            <p className="text-xs text-primary-gold">{user.full_name}</p>
          </div>
          <svg
            className="w-4 h-4 text-gray-400"
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
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
            {/* Signed in as */}
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-xs text-gray-500">Signed in as</p>
              <p className="text-sm text-gray-900 font-medium truncate">
                {user.email}
              </p>
            </div>

            {/* Menu Items */}
            <button
              onClick={() => {
                setIsOpen(false);
                // Navigate to profile page if it exists
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition flex items-center gap-2"
            >
              <span>👤</span>
              My Profile
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                setShowChangePasswordModal(true);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition flex items-center gap-2"
            >
              <span>🔒</span>
              Change Password
            </button>

            <div className="border-t border-gray-200 my-1"></div>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
            >
              <span>🚪</span>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Old password
            </label>
            <input
              type="password"
              value={passwordForm.old_password}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, old_password: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Enter your current password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New password
            </label>
            <input
              type="password"
              value={passwordForm.new_password}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, new_password: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Enter new password (min 8 characters)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm new password
            </label>
            <input
              type="password"
              value={passwordForm.confirm_password}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
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
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:bg-gray-400"
            >
              {passwordLoading ? 'CHANGING...' : 'CHANGE'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
