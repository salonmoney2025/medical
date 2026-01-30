'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/frontend/components/dashboard/DashboardLayout';
import { StatCard } from '@/frontend/components/dashboard/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalStudentsUploaded: number;
  matriculationIdAssigned: number;
  matriculationIdPending: number;
  campusData: Array<{
    campus: string;
    count: number;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Failed to load statistics');
      }
    } catch (err) {
      setError('An error occurred while loading statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get user name
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.full_name);
    }

    // Set greeting
    setGreeting(getGreeting());

    // Fetch dashboard stats
    fetchStats();
  }, []);

  const handleRefresh = () => {
    fetchStats();
  };

  if (loading) {
    return (
      <DashboardLayout role="super_admin">
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-800 text-xl">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="super_admin">
      <div className="space-y-6">
        {/* Greeting Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-gray-600 text-sm">{greeting},</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{userName}!</h1>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 transition-colors shadow-sm"
          >
            <span className="text-lg">🔄</span>
            <span className="font-medium">Refresh</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="TOTAL NUMBER OF STUDENT RECORDS UPLOADED"
                value={stats.totalStudentsUploaded}
                actionText="VIEW DETAILS"
                onActionClick={() => {}}
              />
              <StatCard
                title="TOTAL NUMBER OF STUDENT INVESTIGATED"
                value={stats.matriculationIdAssigned}
                variant="primary"
                actionText="VIEW DETAILS"
                onActionClick={() => {}}
              />
              <StatCard
                title="PENDING STUDENT INVESTIGATION"
                value={stats.matriculationIdPending}
                variant="warning"
                actionText="VIEW DETAILS"
                onActionClick={() => {}}
              />
            </div>

            {/* Data by Campus Chart */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">DATA BY CAMPUS.</h2>
              {stats.campusData && stats.campusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={stats.campusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="campus"
                      stroke="#6B7280"
                      tick={{ fill: '#374151', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis
                      stroke="#000000"
                      tick={{ fill: '#374151', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        color: '#1F2937',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      cursor={{ fill: '#F3F4F6' }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#FFB700"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No campus data available
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
