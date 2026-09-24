'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { UserProfile } from '../ui/SettingsModal';
import AppLoader from '../ui/AppLoader';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role?: 'student' | 'mentor' | 'admin';
  title?: string;
  userName?: string;
}

export const UserProfileContext = createContext<{
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
} | null>(null);

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) throw new Error('useUserProfile must be used within DashboardLayout');
  return context;
};

export default function DashboardLayout({ children, role = 'student', title = 'Dashboard', userName = '' }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: userName || 'Workspace member',
    email: '',
    role,
    bio: ''
  });

  // Load from localStorage on mount
  useEffect(() => {
    // 1. Try to get actual logged-in auth user
    const authUserStr = localStorage.getItem('user');
    let realName = userName || 'Workspace member';
    let realEmail = '';
    let realRole = role;

    if (authUserStr) {
      try {
        const authUser = JSON.parse(authUserStr);
        if (authUser.name) realName = authUser.name;
        if (authUser.email) realEmail = authUser.email;
        if (authUser.role) realRole = authUser.role;
      } catch (e) {
        console.error('Failed to parse auth user');
      }
    }

    // 2. Try to get cached profile (bio, etc)
    const saved = localStorage.getItem(`capstonex_user_profile_${role}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserProfile({ ...parsed, name: realName, email: realEmail, role: realRole });
        return;
      } catch (e) {
        console.error('Failed to parse saved profile');
      }
    }

    setUserProfile({ name: realName, email: realEmail, role: realRole, bio: '' });
  }, [role, userName]);

  useEffect(() => {
    let cancelled = false;
    setIsAuthorized(false);
    api.get('/auth/profile').then(({ data }) => {
      if (cancelled) return;
      if (!['student', 'mentor', 'admin'].includes(data.user?.role)) throw new Error('Invalid role');
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user.role !== role) { router.replace(`/${data.user.role}`); return; }
      setIsAuthorized(true);
    }).catch(() => {
      if (!cancelled) router.replace('/login');
    });
    return () => { cancelled = true; };
  }, [pathname, role, router]);

  // Save to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(`capstonex_user_profile_${role}`, JSON.stringify(userProfile));
  }, [userProfile, role]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsEntering(false), 520);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!isAuthorized) return <AppLoader label="Verifying workspace access" />;

  return (
    <div className="min-h-screen w-full overflow-hidden flex bg-cx-bg text-cx-text font-body selection:bg-brand-200 selection:text-brand-900">
      {isEntering && <AppLoader compact label={`Opening ${title}`} />}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-cx-bg-overlay backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Floating Sidebar (Navigation) */}
      <Sidebar
        role={role}
        userName={userProfile.name}
        userRole={userProfile.role}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 z-10 w-full max-w-[100vw] lg:pl-[280px]">
        <Topbar 
          title={title} 
          role={role}
          onMenuToggle={() => setSidebarOpen(true)} 
          userProfile={userProfile}
          setUserProfile={setUserProfile}
        />

        <main id="main-content" className="flex-1 overflow-y-auto w-full focus:outline-none" role="main" tabIndex={-1}>
          <div key={pathname} className="page-reveal max-w-7xl mx-auto w-full min-h-full p-4 sm:p-6 lg:p-8 xl:p-10">
            <UserProfileContext.Provider value={{ userProfile, setUserProfile }}>
              {children}
            </UserProfileContext.Provider>
          </div>
        </main>
      </div>
    </div>
  );
}
