'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/frontend/components/ui/Button';

export default function StudentLoginPage() {
  const router = useRouter();
  const [appid, setAppid] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!appid || !password) {
      setError('Please enter both APPID and password');
      return;
    }

    if (appid.length < 3 || appid.length > 5) {
      setError('APPID must be 3-5 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/student/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appid, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store student data
        localStorage.setItem('student_token', data.token);
        localStorage.setItem('student_data', JSON.stringify(data.student));
        // Redirect to student report page
        router.push('/student/report');
      } else {
        setError(data.error || 'Invalid APPID or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-full p-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
              <span className="text-4xl">🏛️</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            ERKUST - SL
          </h1>
          <p className="text-blue-200">Student Medical Report Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Student Login
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application ID (APPID)
              </label>
              <input
                type="text"
                value={appid}
                onChange={(e) => setAppid(e.target.value)}
                placeholder="Enter your APPID (3-5 digits)"
                maxLength={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: 25673
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Password provided by the medical officer
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-lg"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Having trouble logging in?
              <br />
              Contact the medical office for assistance.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-blue-200 text-sm">
          <p>© 2026 Ernest Bai Koroma University of Science and Technology</p>
          <p className="mt-1">Medical Report System</p>
        </div>
      </div>
    </div>
  );
}
