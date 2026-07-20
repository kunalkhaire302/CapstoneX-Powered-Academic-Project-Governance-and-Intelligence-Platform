'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { UserProfile } from '../ui/SettingsModal';

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

  // Save to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(`capstonex_user_profile_${role}`, JSON.stringify(userProfile));
  }, [userProfile, role]);

  return (
    <div className="min-h-screen w-full overflow-hidden bg-transparent flex">
      {/* Dynamic Background Orb */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cardinal/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse-glow z-0" aria-hidden="true" />
      
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
      <div className="flex-1 flex flex-col min-h-screen lg:pl-[280px] p-2 sm:p-4 lg:py-4 lg:pr-4 transition-all duration-300 z-10 w-full max-w-[100vw]">
        <div className="flex-1 flex flex-col bg-white rounded-2xl sm:rounded-[32px] shadow-glass-panel border border-white/60 overflow-hidden relative isolate">
          
          <Topbar 
            title={title} 
            onMenuToggle={() => setSidebarOpen(true)} 
            userProfile={userProfile}
            setUserProfile={setUserProfile}
          />

          <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full bg-slate-50/50" role="main">
            <div className="max-w-[1400px] mx-auto animate-fade-in w-full h-full">
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
