'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState, useRef } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const roleNavItems: Record<string, NavItem[]> = {
  student: [
    { label: 'Dashboard', href: '/student', icon: <HomeIcon /> },
    { label: 'My Groups', href: '/student/groups', icon: <GroupIcon /> },
    { label: 'Topics', href: '/student/topics', icon: <FileIcon /> },
    { label: 'AI Recommendations', href: '/student/recommendations', icon: <SparklesIcon /> },
    { label: 'Logbook', href: '/student/logbook', icon: <BookIcon /> },
    { label: 'Marks', href: '/student/marks', icon: <ChartIcon /> },
  ],
  mentor: [
    { label: 'Dashboard', href: '/mentor', icon: <HomeIcon /> },
    { label: 'Groups', href: '/mentor/groups', icon: <GroupIcon /> },
    { label: 'Logbook Review', href: '/mentor/logbook-review', icon: <BookIcon /> },
    { label: 'Evaluations', href: '/mentor/evaluations', icon: <CheckIcon /> },
    { label: 'Schedule', href: '/mentor/schedule', icon: <CalendarIcon /> },
    { label: 'Risk Dashboard', href: '/mentor/risk', icon: <AlertIcon /> },
    { label: 'Reports', href: '/mentor/reports', icon: <ChartIcon /> },
  ],
  coordinator: [
    { label: 'Dashboard', href: '/coordinator', icon: <HomeIcon /> },
    { label: 'Groups', href: '/coordinator/groups', icon: <GroupIcon /> },
    { label: 'Topic Approvals', href: '/coordinator/topics', icon: <FileIcon /> },
    { label: 'Evaluations', href: '/coordinator/evaluations', icon: <CheckIcon /> },
    { label: 'Risk Overview', href: '/coordinator/risk', icon: <AlertIcon /> },
    { label: 'AI Analytics', href: '/coordinator/analytics', icon: <SparklesIcon /> },
    { label: 'Reports', href: '/coordinator/reports', icon: <ChartIcon /> },
  ],
  hod: [
    { label: 'Dashboard', href: '/hod', icon: <HomeIcon /> },
    { label: 'Departments', href: '/hod/departments', icon: <GroupIcon /> },
    { label: 'Faculty', href: '/hod/faculty', icon: <GroupIcon /> },
    { label: 'AI Analytics', href: '/hod/analytics', icon: <SparklesIcon /> },
    { label: 'Risk Overview', href: '/hod/risk', icon: <AlertIcon /> },
    { label: 'Accreditation', href: '/hod/accreditation', icon: <FileIcon /> },
    { label: 'Reports', href: '/hod/reports', icon: <ChartIcon /> },
  ],
  accreditation: [
    { label: 'Dashboard', href: '/accreditation', icon: <HomeIcon /> },
    { label: 'Compliance', href: '/accreditation/compliance', icon: <CheckIcon /> },
    { label: 'Department Reports', href: '/accreditation/departments', icon: <GroupIcon /> },
    { label: 'AI Analytics', href: '/accreditation/analytics', icon: <SparklesIcon /> },
    { label: 'Export Data', href: '/accreditation/export', icon: <FileIcon /> },
    { label: 'Reports', href: '/accreditation/reports', icon: <ChartIcon /> },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin', icon: <HomeIcon /> },
    { label: 'Users', href: '/admin/users', icon: <GroupIcon /> },
    { label: 'Audit Log', href: '/admin/audit', icon: <FileIcon /> },
    { label: 'Topic Approvals', href: '/admin/topics', icon: <FileIcon /> },
    { label: 'Risk Dashboard', href: '/admin/risk', icon: <AlertIcon /> },
    { label: 'Teams AI', href: '/admin/teams', icon: <GroupIcon /> },
    { label: 'AI Analytics', href: '/admin/analytics', icon: <SparklesIcon /> },
    { label: 'Model Registry', href: '/admin/models', icon: <ChartIcon /> },
    { label: 'Notifications', href: '/admin/notifications', icon: <BellIcon /> },
  ],
};

interface SidebarProps {
  role?: string;
  userName?: string;
  userRole?: string;
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ role = 'student', userName = '', userRole = '', mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const navItems = roleNavItems[role] || roleNavItems.student;

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (mobileOpen && onClose) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Lock body scroll on mobile when sidebar open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [mobileOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen lg:h-[calc(100vh-2rem)] lg:top-4 lg:left-4 w-[270px] sm:w-[250px] 
        bg-white/5 backdrop-blur-2xl flex flex-col z-40 
        lg:rounded-[32px] lg:border lg:border-white/10 lg:shadow-glass-sidebar
        transition-all duration-500 ease-out lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Close button — mobile only */}
      <button
        onClick={onClose}
        className="lg:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Close navigation menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Logo */}
      <div className="px-6 py-8">
        <Link href="/" className="flex items-center gap-3 group" aria-label="CapstoneX — Go to homepage">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cardinal to-cardinal-600 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300 group-hover:scale-105">
            <img src="/logo.png" alt="" className="w-6 h-6 object-contain brightness-0 invert" aria-hidden="true" />
          </div>
          <div>
            <span className="font-display text-[22px] text-white tracking-tight block leading-none mb-1">CapstoneX</span>
            <span className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em]">Platform</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto px-4 scrollbar-hide" aria-label="Sidebar navigation">
        <div className="mb-4 px-2 flex items-center gap-2">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30" aria-hidden="true">Menu</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>
        <ul className="space-y-1.5 list-none" role="list">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3.5 px-3 py-3 rounded-xl text-[13px] font-semibold transition-all duration-300 group relative overflow-hidden ${
                    isActive
                      ? 'text-white bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {/* Subtle active pill indicator */}
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-cardinal-400 rounded-r-full shadow-glow" aria-hidden="true" />}
                  
                  <span className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${isActive ? 'text-cardinal-400 scale-110 drop-shadow-md' : 'text-white/40 group-hover:text-white/80 group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 mt-auto relative" ref={dropdownRef}>
        <div 
          className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group" 
          role="button" 
          tabIndex={0}
          onClick={() => setUserMenuOpen(!userMenuOpen)}
        >
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center ring-2 ring-white/10 flex-shrink-0 group-hover:ring-white/20 transition-all">
            <span className="text-white font-bold text-sm">{userName?.charAt(0) || 'U'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{userName || 'User'}</p>
            <p className="text-[11px] text-white/50 capitalize font-medium tracking-wide">{userRole || role}</p>
          </div>
          <svg className={`w-4 h-4 text-white/30 group-hover:text-white/60 transition-transform duration-300 flex-shrink-0 ${userMenuOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
          </svg>
        </div>

        {/* Profile Dropdown Menu */}
        {userMenuOpen && (
          <div className="absolute bottom-[calc(100%-1rem)] left-4 mb-2 w-[calc(100%-2rem)] bg-slate-800 rounded-2xl shadow-xl border border-white/10 p-2 z-50 animate-fade-in">
            <div className="space-y-1">
              <button 
                onClick={() => { alert('Settings coming soon!'); setUserMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Settings
              </button>
              <button 
                onClick={() => { alert('Support center coming soon!'); setUserMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Support
              </button>
            </div>
            <div className="mt-2 pt-2 border-t border-white/10">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-cardinal-400 hover:bg-white/5 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4 text-cardinal-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

// Inline SVG icons (Lucide-style)
function HomeIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>; }
function GroupIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>; }
function FileIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>; }
function BookIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>; }
function ChartIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>; }
function CheckIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }
function CalendarIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>; }
function AlertIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>; }
function BellIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>; }
function SparklesIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>; }
