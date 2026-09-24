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
  role?: string;
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
    name: userName || 'Student 1',
    email: 'student1@capstonex.com',
    role: role || 'Student',
    bio: ''
  });

  // Load from localStorage on mount
  useEffect(() => {
    // 1. Try to get actual logged-in auth user
    const authUserStr = localStorage.getItem('user');
    let realName = userName || 'Student 1';
    let realEmail = 'student1@capstonex.com';
    let realRole = role || 'Student';

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
    <div className="app-atmosphere surface-noise min-h-screen w-full overflow-hidden flex">
      {isEntering && <AppLoader compact label={`Opening ${title}`} />}

      <div className="fixed -left-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-cardinal/15 blur-[120px] pointer-events-none z-0" aria-hidden="true" />
      <div className="fixed -bottom-64 right-[-8rem] h-[36rem] w-[36rem] rounded-full bg-blue-500/10 blur-[140px] pointer-events-none z-0" aria-hidden="true" />
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
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

      {/* Main App-in-App Canvas */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-[284px] p-2 sm:p-3 lg:py-3 lg:pr-3 transition-all duration-300 z-10 w-full max-w-[100vw]">
        <div className="workspace-canvas flex-1 flex flex-col rounded-[22px] sm:rounded-[28px] border border-white/70 overflow-hidden relative isolate">
          
          <Topbar 
            title={title} 
            onMenuToggle={() => setSidebarOpen(true)} 
            userProfile={userProfile}
            setUserProfile={setUserProfile}
          />

          <main id="main-content" className="dashboard-grid flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 xl:p-10 w-full" role="main">
            <div key={pathname} className="page-reveal max-w-[1460px] mx-auto w-full min-h-full">
              <UserProfileContext.Provider value={{ userProfile, setUserProfile }}>
                {children}
              </UserProfileContext.Provider>
            </div>
          </main>
          
        </div>
      </div>
    </div>
  );
}
