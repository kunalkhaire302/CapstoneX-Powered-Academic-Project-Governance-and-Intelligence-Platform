'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, CalendarDays, ChevronDown, LogOut, Menu, Search, Settings, Sparkles, X, ChevronRight, Home } from 'lucide-react';
import SettingsModal, { UserProfile } from '../ui/SettingsModal';
import api, { setStoredAccessToken } from '@/lib/api';
import Link from 'next/link';

interface TopbarProps {
  title?: string;
  role: 'student' | 'mentor' | 'admin';
  onMenuToggle?: () => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
}

export default function Topbar({ title = 'Dashboard', role, onMenuToggle, userProfile, setUserProfile }: TopbarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(open => !open);
      }
      if (event.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { /* Clear the local session regardless. */ }
    setStoredAccessToken(null);
    localStorage.removeItem('user');
    router.push('/login');
  };

  const notificationHref = `/${role}/notifications`;
  const quickActions: Record<TopbarProps['role'], Array<[string, string]>> = {
    student: [['Explore recommendations', '/student/recommendations'], ['Open AI project review', '/student/ai-team'], ['Review project marks', '/student/marks']],
    mentor: [['Review assigned groups', '/mentor/groups'], ['Open AI review workspace', '/mentor/ai-team'], ['Review project risk', '/mentor/risk']],
    admin: [['Open analytics', '/admin/analytics'], ['Manage users', '/admin/users'], ['Review AI operations', '/admin/ai-team']],
  };

  // Generate breadcrumbs from pathname
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs = paths.map((path, index) => {
    const href = '/' + paths.slice(0, index + 1).join('/');
    const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
    return { href, label, isLast: index === paths.length - 1 };
  });

  return (
    <header className="h-[64px] bg-cx-bg-elevated/80 backdrop-blur-md border-b border-cx-border sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 transition-all" role="banner">
      {/* Left: Hamburger + Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-cx-text-muted hover:text-cx-text hover:bg-cx-bg-subtle transition-colors -ml-2"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center space-x-1.5 text-sm text-cx-text-muted font-medium">
          <Link href={`/${role}`} className="hover:text-cx-text transition-colors flex items-center">
            <Home className="w-4 h-4" />
          </Link>
          
          {breadcrumbs.length > 1 && breadcrumbs.slice(1).map((crumb, i) => (
            <div key={crumb.href} className="flex items-center space-x-1.5">
              <ChevronRight className="w-4 h-4 text-cx-border-strong" />
              {crumb.isLast ? (
                <span className="text-cx-text">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-cx-text transition-colors">
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Center/Right section */}
      <div className="flex items-center gap-3 sm:gap-4" ref={dropdownRef}>
        {/* Command Palette Trigger */}
        <button
          className="hidden md:flex items-center gap-3 px-3 py-2 text-sm text-cx-text-muted bg-cx-bg hover:bg-cx-bg-subtle rounded-lg transition-all border border-cx-border min-w-[200px] lg:min-w-[280px] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cardinal"
          id="search-btn"
          aria-label="Search"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="w-4 h-4 text-cx-text-muted group-hover:text-cx-brand transition-colors" />
          <span className="flex-1 text-left text-xs font-medium">Search workspace</span>
          <kbd className="text-[10px] bg-cx-bg-muted text-cx-text-secondary px-1.5 py-0.5 rounded border border-cx-border font-mono font-semibold tracking-widest hidden lg:block">⌘K</kbd>
        </button>

        <div className="h-6 w-px bg-cx-border hidden md:block" />

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => router.push(notificationHref)}
            className="relative w-9 h-9 flex items-center justify-center text-cx-text-secondary hover:text-cx-brand bg-transparent hover:bg-cx-brand-subtle rounded-lg transition-all"
            id="notification-bell"
            aria-label="Open notifications"
          >
            <Bell className="w-[18px] h-[18px]" strokeWidth={2} />
            {/* Example active badge */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-cx-brand rounded-full border-2 border-cx-surface" />
          </button>
        </div>

        {/* User Menu */}
        <div className="relative hidden sm:block">
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-full border border-transparent hover:bg-cx-bg-subtle p-1 pr-2 transition-all"
            aria-expanded={userMenuOpen} 
            aria-label="Open account menu"
          >
            <div className="w-8 h-8 rounded-full bg-cx-bg-muted border border-cx-border flex items-center justify-center text-xs font-bold text-cx-text">
              {userProfile.name?.charAt(0) || 'U'}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-cx-text-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-cx-border bg-cx-surface p-1 shadow-lg animate-scale-in origin-top-right">
              <div className="px-3 py-2.5 mb-1">
                <p className="truncate text-sm font-semibold text-cx-text">{userProfile.name}</p>
                <p className="mt-0.5 truncate text-xs text-cx-text-muted">{userProfile.email}</p>
              </div>
              <div className="h-px bg-cx-border-subtle my-1 mx-2" />
              <button 
                onClick={() => { setSettingsModalOpen(true); setUserMenuOpen(false); }} 
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-cx-text-secondary hover:bg-cx-bg-subtle hover:text-cx-text transition-colors"
              >
                <Settings className="w-4 h-4" /> Account settings
              </button>
              <button 
                onClick={handleLogout} 
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {searchOpen && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center bg-cx-bg-overlay px-4 pt-[14vh] backdrop-blur-sm" onMouseDown={() => setSearchOpen(false)}>
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-cx-border bg-cx-surface shadow-xl animate-scale-in" onMouseDown={event => event.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-cx-border px-4 py-3">
              <Search className="w-5 h-5 text-cx-brand" />
              <input autoFocus className="min-w-0 flex-1 border-0 p-0 text-base bg-transparent shadow-none outline-none ring-0 placeholder:text-cx-text-muted" placeholder="Search projects, teams, or actions…" />
              <button onClick={() => setSearchOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-cx-text-muted hover:bg-cx-bg-muted transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-2">
              <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-wider text-cx-text-muted">Quick actions</p>
              {quickActions[role].map(([label, href]) => (
                <button key={href} onClick={() => { setSearchOpen(false); router.push(href); }} className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-cx-text-secondary hover:bg-cx-bg-subtle hover:text-cx-text transition-colors">
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-cx-bg-muted text-cx-text-muted group-hover:bg-cx-brand-subtle group-hover:text-cx-brand transition-colors"><Sparkles className="w-4 h-4" /></span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <SettingsModal 
        isOpen={settingsModalOpen} 
        onClose={() => setSettingsModalOpen(false)} 
        profile={userProfile}
        onSaveProfile={(newProfile) => setUserProfile(newProfile)}
      />
    </header>
  );
}
