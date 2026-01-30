'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

interface SidebarProps {
  role: 'super_admin' | 'medical_officer';
  isOpen: boolean;
  onClose: () => void;
  sidebarColor?: string;
  primaryColor?: string;
}

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

// SVG icon components for medical theme
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
  </svg>
);

const IdCardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const StudentsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);

const AdminsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const LogsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const MedicalFormIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const RecordsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

// Stethoscope decorative icon
const StethoscopeIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, onClose, sidebarColor = '#000000', primaryColor = '#16a34a' }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load user info from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUserName(parsed.full_name || '');
        setUserRole(parsed.role || '');
      } catch {}
    }

    // Fetch profile image
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) return; // 2MB limit

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setProfileImage(base64);

      // Upload to backend
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await fetch('/api/users/profile-image', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ profile_image: base64 }),
          });
        } catch {}
      }
    };
    reader.readAsDataURL(file);
  };

  const superAdminMenuItems: MenuItem[] = [
    { name: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard/admin' },
    { name: 'Generated IDs', icon: <IdCardIcon />, path: '/dashboard/admin/generated-ids' },
    { name: 'Accounts', icon: <UserIcon />, path: '/dashboard/admin/accounts' },
    { name: 'Students', icon: <StudentsIcon />, path: '/dashboard/admin/students' },
    { name: 'Admins', icon: <AdminsIcon />, path: '/dashboard/admin/admins' },
    { name: 'Logs', icon: <LogsIcon />, path: '/dashboard/admin/logs' },
    { name: 'Settings', icon: <SettingsIcon />, path: '/dashboard/admin/settings' },
  ];

  const medicalOfficerMenuItems: MenuItem[] = [
    { name: 'Medical Form', icon: <MedicalFormIcon />, path: '/dashboard/medical-officer' },
    { name: 'My Records', icon: <RecordsIcon />, path: '/dashboard/medical-officer/records' },
  ];

  const menuItems = role === 'super_admin' ? superAdminMenuItems : medicalOfficerMenuItems;

  const isActive = (path: string) => pathname === path;

  const handleNavigate = (path: string) => {
    router.push(path);
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

  const roleLabel = userRole === 'super_admin' ? 'Super Admin' : 'Medical Officer';

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
          fixed top-0 left-0 h-screen z-50
          w-64 flex flex-col shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        style={{
          background: `linear-gradient(180deg, ${sidebarColor} 0%, #0f2027 50%, #0a1a1f 100%)`,
        }}
      >
        {/* Logo/Brand Header */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, #0ea5e9)` }}
              >
                <StethoscopeIcon />
              </div>
              <div>
                <h2 className="font-bold text-sm text-white tracking-wide">EBKUST</h2>
                <p className="text-[10px] font-medium tracking-widest" style={{ color: `${primaryColor}cc` }}>MEDICAL SYSTEM</p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white transition p-1"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Divider with gradient accent */}
        <div className="mx-5 h-px" style={{ background: `linear-gradient(90deg, transparent, ${primaryColor}66, transparent)` }} />

        {/* Profile Section */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-3">
            {/* Profile Image */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-full overflow-hidden border-2 shadow-lg flex items-center justify-center transition-all hover:border-opacity-100 focus:outline-none"
                style={{ borderColor: `${primaryColor}88` }}
                title="Click to change profile photo"
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, #0ea5e9)` }}
                  >
                    {userName.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </button>
              {/* Camera overlay on hover */}
              <div
                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{userName || 'User'}</p>
              <p className="text-xs font-medium truncate" style={{ color: `${primaryColor}cc` }}>{roleLabel}</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px" style={{ background: `linear-gradient(90deg, transparent, ${primaryColor}44, transparent)` }} />

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 px-3 mb-2">Navigation</p>
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                type="button"
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-left transition-all duration-200 ${
                  active
                    ? 'shadow-md'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
                style={
                  active
                    ? {
                        background: `linear-gradient(90deg, ${primaryColor}33, transparent)`,
                        color: primaryColor,
                        borderLeft: `3px solid ${primaryColor}`,
                      }
                    : { borderLeft: '3px solid transparent' }
                }
              >
                <span className={active ? '' : 'text-gray-400'}>{item.icon}</span>
                <span className="font-semibold text-[13px]">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t" style={{ borderColor: `${primaryColor}22` }}>
          <div className="flex items-center gap-2 text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-[10px] uppercase font-semibold tracking-widest">Student Medical Records</p>
          </div>
        </div>
      </aside>
    </>
  );
};
