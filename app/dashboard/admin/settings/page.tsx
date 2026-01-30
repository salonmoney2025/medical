'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/frontend/components/dashboard/DashboardLayout';

const PRESET_THEMES = [
  {
    name: 'Default Green',
    primary_color: '#16a34a',
    sidebar_color: '#000000',
    background_color: '#f0f0f0',
    accent_color: '#22c55e',
  },
  {
    name: 'Ocean Blue',
    primary_color: '#2563eb',
    sidebar_color: '#0f172a',
    background_color: '#f0f4f8',
    accent_color: '#3b82f6',
  },
  {
    name: 'Royal Purple',
    primary_color: '#7c3aed',
    sidebar_color: '#1e1b4b',
    background_color: '#f5f3ff',
    accent_color: '#8b5cf6',
  },
  {
    name: 'Warm Gold',
    primary_color: '#d97706',
    sidebar_color: '#1c1917',
    background_color: '#fffbeb',
    accent_color: '#f59e0b',
  },
  {
    name: 'Rose',
    primary_color: '#e11d48',
    sidebar_color: '#1a1a2e',
    background_color: '#fff1f2',
    accent_color: '#f43f5e',
  },
  {
    name: 'Teal',
    primary_color: '#0d9488',
    sidebar_color: '#042f2e',
    background_color: '#f0fdfa',
    accent_color: '#14b8a6',
  },
];

interface ThemeSettings {
  primary_color: string;
  sidebar_color: string;
  background_color: string;
  accent_color: string;
  alert_duration: string;
}

export default function SettingsPage() {
  const [theme, setTheme] = useState<ThemeSettings>({
    primary_color: '#16a34a',
    sidebar_color: '#000000',
    background_color: '#f0f0f0',
    accent_color: '#22c55e',
    alert_duration: '20000',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const res = await fetch('/api/theme');
      const data = await res.json();
      if (data.success && data.data) {
        setTheme({
          primary_color: data.data.primary_color || '#16a34a',
          sidebar_color: data.data.sidebar_color || '#000000',
          background_color: data.data.background_color || '#f0f0f0',
          accent_color: data.data.accent_color || '#22c55e',
          alert_duration: data.data.alert_duration || '20000',
        });
      }
    } catch {
      // Use defaults
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(theme),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Theme saved successfully! Refresh any open pages to see changes.');
        // Apply immediately to current page
        applyTheme(theme);
      } else {
        setError(data.error || 'Failed to save theme');
      }
    } catch {
      setError('Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  const applyTheme = (t: ThemeSettings) => {
    document.documentElement.style.setProperty('--background', t.background_color);
    document.documentElement.style.setProperty('--theme-primary', t.primary_color);
    document.documentElement.style.setProperty('--theme-sidebar', t.sidebar_color);
    document.documentElement.style.setProperty('--theme-accent', t.accent_color);
  };

  const applyPreset = (preset: typeof PRESET_THEMES[number]) => {
    const newTheme: ThemeSettings = {
      primary_color: preset.primary_color,
      sidebar_color: preset.sidebar_color,
      background_color: preset.background_color,
      accent_color: preset.accent_color,
      alert_duration: theme.alert_duration,
    };
    setTheme(newTheme);
    applyTheme(newTheme);
    setMessage('');
    setError('');
  };

  const handleColorChange = (key: keyof ThemeSettings, value: string) => {
    const newTheme = { ...theme, [key]: value };
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  if (loading) {
    return (
      <DashboardLayout title="Settings" role="super_admin">
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500 text-lg">Loading settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings" role="super_admin">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-500 mt-1">Customize the look and feel of the entire application.</p>
        </div>

        {/* Preset Themes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Presets</h2>
          <p className="text-sm text-gray-500 mb-4">Select a preset theme to apply instantly.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PRESET_THEMES.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className={`relative rounded-xl border-2 p-4 transition-all hover:scale-[1.02] ${
                  theme.primary_color === preset.primary_color &&
                  theme.sidebar_color === preset.sidebar_color
                    ? 'border-gray-900 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-6 h-6 rounded-full border border-gray-200"
                    style={{ backgroundColor: preset.primary_color }}
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-gray-200"
                    style={{ backgroundColor: preset.sidebar_color }}
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-gray-200"
                    style={{ backgroundColor: preset.accent_color }}
                  />
                </div>
                <p className="text-sm font-medium text-gray-900">{preset.name}</p>
                {/* Preview bar */}
                <div className="mt-2 h-2 rounded-full" style={{ backgroundColor: preset.primary_color }} />
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Custom Colors</h2>
          <p className="text-sm text-gray-500 mb-6">Fine-tune individual colors for your brand.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <p className="text-xs text-gray-400 mb-2">Buttons, links, active states</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.primary_color}
                  onChange={(e) => handleColorChange('primary_color', e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={theme.primary_color}
                  onChange={(e) => handleColorChange('primary_color', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 font-mono"
                />
              </div>
            </div>

            {/* Sidebar Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sidebar Color
              </label>
              <p className="text-xs text-gray-400 mb-2">Navigation sidebar background</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.sidebar_color}
                  onChange={(e) => handleColorChange('sidebar_color', e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={theme.sidebar_color}
                  onChange={(e) => handleColorChange('sidebar_color', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 font-mono"
                />
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <p className="text-xs text-gray-400 mb-2">Page background behind cards</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.background_color}
                  onChange={(e) => handleColorChange('background_color', e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={theme.background_color}
                  onChange={(e) => handleColorChange('background_color', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 font-mono"
                />
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accent Color
              </label>
              <p className="text-xs text-gray-400 mb-2">Highlights and secondary actions</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.accent_color}
                  onChange={(e) => handleColorChange('accent_color', e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={theme.accent_color}
                  onChange={(e) => handleColorChange('accent_color', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h2>
          <div
            className="rounded-xl p-6 border"
            style={{ backgroundColor: theme.background_color, borderColor: '#e5e7eb' }}
          >
            <div className="flex gap-4">
              {/* Mini sidebar preview */}
              <div
                className="w-16 rounded-lg p-2 flex flex-col gap-2"
                style={{ backgroundColor: theme.sidebar_color }}
              >
                <div className="w-full h-3 rounded" style={{ backgroundColor: theme.primary_color }} />
                <div className="w-full h-3 rounded bg-gray-600" />
                <div className="w-full h-3 rounded bg-gray-600" />
              </div>
              {/* Mini content preview */}
              <div className="flex-1 space-y-3">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="h-3 w-32 rounded mb-2" style={{ backgroundColor: theme.primary_color }} />
                  <div className="h-2 w-full rounded bg-gray-200" />
                  <div className="h-2 w-3/4 rounded bg-gray-200 mt-1" />
                </div>
                <div className="flex gap-3">
                  <div
                    className="px-4 py-2 rounded-lg text-white text-xs font-medium"
                    style={{ backgroundColor: theme.primary_color }}
                  >
                    Primary Button
                  </div>
                  <div
                    className="px-4 py-2 rounded-lg text-white text-xs font-medium"
                    style={{ backgroundColor: theme.accent_color }}
                  >
                    Accent Button
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Duration */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alert Duration</h2>
          <p className="text-sm text-gray-500 mb-4">Configure how long toast notifications remain visible before fading out.</p>
          <div className="flex items-center gap-4">
            <select
              value={theme.alert_duration}
              onChange={(e) => setTheme({ ...theme, alert_duration: e.target.value })}
              title="Alert duration"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-gray-900"
            >
              <option value="5000">5 seconds</option>
              <option value="10000">10 seconds</option>
              <option value="15000">15 seconds</option>
              <option value="20000">20 seconds (Default)</option>
              <option value="30000">30 seconds</option>
            </select>
            <span className="text-sm text-gray-500">Currently: {parseInt(theme.alert_duration) / 1000}s</span>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-4 pb-8">
          <button
            onClick={fetchTheme}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 shadow-sm"
          >
            {saving ? 'Saving...' : 'Save Theme'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
