'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { ProfileDropdown } from './ProfileDropdown';

// Helper: determine if a hex color is light or dark
function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  role: 'super_admin' | 'medical_officer';
  showSidebar?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  role,
  showSidebar = true,
}) => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themeColors, setThemeColors] = useState({
    primary_color: '#16a34a',
    sidebar_color: '#000000',
    background_color: '#f0f0f0',
    accent_color: '#22c55e',
    button_color: '#16a34a',
    text_color: '#1f2937',
    bar_color: '#ffffff',
  });

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Check role authorization
    if (parsedUser.role !== role) {
      router.push('/login');
    }

    // Load theme
    fetchTheme();
  }, [router, role]);

  const fetchTheme = async () => {
    try {
      const res = await fetch('/api/theme');
      const data = await res.json();
      if (data.success && data.data) {
        const t = {
          primary_color: data.data.primary_color || '#16a34a',
          sidebar_color: data.data.sidebar_color || '#000000',
          background_color: data.data.background_color || '#f0f0f0',
          accent_color: data.data.accent_color || '#22c55e',
          button_color: data.data.button_color || '#16a34a',
          text_color: data.data.text_color || '#1f2937',
          bar_color: data.data.bar_color || '#ffffff',
        };
        setThemeColors(t);
        // Apply CSS variables
        document.documentElement.style.setProperty('--background', t.background_color);
        document.documentElement.style.setProperty('--theme-primary', t.primary_color);
        document.documentElement.style.setProperty('--theme-sidebar', t.sidebar_color);
        document.documentElement.style.setProperty('--theme-accent', t.accent_color);
        document.documentElement.style.setProperty('--theme-button', t.button_color);
        document.documentElement.style.setProperty('--theme-text', t.text_color);
        document.documentElement.style.setProperty('--theme-bar', t.bar_color);
      }
    } catch {
      // Use defaults
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black-50 flex items-center justify-center">
        <div className="text-black-800 text-xl font-medium">Loading...</div>
      </div>
    );
  }

  // Smart text contrast for the top bar
  const barIsLight = isLightColor(themeColors.bar_color);
  const barTextColor = barIsLight ? '#1f2937' : '#ffffff';
  const barIconColor = barIsLight ? '#374151' : '#d1d5db';

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: themeColors.background_color, color: themeColors.text_color }}>
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          role={role}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sidebarColor={themeColors.sidebar_color}
          primaryColor={themeColors.primary_color}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 w-full">
        {/* Header */}
        <header className="border-b border-black-200 sticky top-0 z-30 shadow-sm" style={{ backgroundColor: themeColors.bar_color }}>
          <div className="px-4 sm:px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4 flex-1">
                {/* Menu Button - always visible */}
                {showSidebar && (
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="transition-colors p-2 rounded-lg"
                    style={{ color: barIconColor }}
                    aria-label="Toggle menu"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {sidebarOpen ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      )}
                    </svg>
                  </button>
                )}
                {title && (
                  <div>
                    <h1 className="text-lg sm:text-xl font-semibold truncate" style={{ color: barTextColor }}>{title}</h1>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <ProfileDropdown user={user} />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="px-4 sm:px-6 py-4 text-center text-xs text-black-400 border-t border-black-200">
          &copy; EBKUSTSL 2026. All rights reserved.
        </footer>
      </div>
    </div>
  );
};
