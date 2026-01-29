'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface SidebarProps {
  role: 'super_admin' | 'medical_officer';
  isOpen: boolean;
  onClose: () => void;
  sidebarColor?: string;
  primaryColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, onClose, sidebarColor = '#000000', primaryColor = '#16a34a' }) => {
  const pathname = usePathname();
  const router = useRouter();

  const superAdminMenuItems = [
    { name: 'Dashboard', icon: '📊', path: '/dashboard/admin' },
    { name: 'Generated IDs', icon: '🆔', path: '/dashboard/admin/generated-ids' },
    { name: 'Accounts', icon: '👤', path: '/dashboard/admin/accounts' },
    { name: 'Students', icon: '👨‍🎓', path: '/dashboard/admin/students' },
    { name: 'Admins', icon: '👨‍💼', path: '/dashboard/admin/admins' },
    { name: 'Logs', icon: '📝', path: '/dashboard/admin/logs' },
    { name: 'Settings', icon: '⚙️', path: '/dashboard/admin/settings' },
  ];

  const medicalOfficerMenuItems = [
    { name: 'Medical Form', icon: '📋', path: '/dashboard/medical-officer' },
    { name: 'My Records', icon: '📊', path: '/dashboard/medical-officer/records' },
  ];

  const menuItems = role === 'super_admin' ? superAdminMenuItems : medicalOfficerMenuItems;

  const isActive = (path: string) => pathname === path;

  const handleNavigate = (path: string) => {
    router.push(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen border-r border-gray-700 z-50
          w-64 flex flex-col shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        style={{ backgroundColor: sidebarColor }}
      >
        {/* Logo/Brand */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg" style={{ backgroundColor: primaryColor }}>
                <span className="text-2xl">🏛️</span>
              </div>
              <div>
                <h2 className="font-bold text-sm" style={{ color: primaryColor }}>ERKUST...SL</h2>
                <p className="text-xs text-gray-400">MEDICAL SYSTEM</p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-all duration-200 ${
                isActive(item.path)
                  ? 'shadow-md border-l-4'
                  : 'text-gray-300 hover:bg-white/10 border-l-4 border-transparent'
              }`}
              style={
                isActive(item.path)
                  ? { backgroundColor: `${primaryColor}33`, color: primaryColor, borderLeftColor: primaryColor }
                  : undefined
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Footer/Account Info */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <p className="text-xs text-gray-400 text-center uppercase font-semibold">
            {role === 'super_admin' ? 'SUPER ADMIN ACCOUNT' : 'MEDICAL OFFICER'}
          </p>
        </div>
      </aside>
    </>
  );
};
