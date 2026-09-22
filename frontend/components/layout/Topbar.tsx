'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CalendarDays, ChevronDown, LogOut, Menu, Search, Settings, Sparkles, X } from 'lucide-react';
import SettingsModal, { UserProfile } from '../ui/SettingsModal';

interface TopbarProps {
  title?: string;
  onMenuToggle?: () => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
}

export default function Topbar({ title = 'Dashboard', onMenuToggle, userProfile, setUserProfile }: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
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

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <header className="h-[68px] sm:h-[82px] bg-white/75 backdrop-blur-2xl border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-7 lg:px-9 sticky top-0 z-30" role="banner">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-4">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white/50 transition-colors -ml-2"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="hidden sm:flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-[0.22em] mb-1.5">
            <span>Command center</span><span className="h-1 w-1 rounded-full bg-cardinal" /><span className="text-cardinal-600">Live</span>
          </div>
          <h1 className="text-xl sm:text-[26px] font-display text-slate-950 leading-none tracking-[-0.025em]">{title}</h1>
        </div>
      </div>

      {/* Center/Right section */}
      <div className="flex items-center gap-3 sm:gap-5" ref={dropdownRef}>
        {/* Command Palette Trigger */}
        <button
          className="hidden md:flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 bg-white hover:bg-gray-50 rounded-xl transition-all shadow-sm border border-gray-100 min-w-[240px] group"
          id="search-btn"
          aria-label="Search"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="w-4 h-4 text-slate-300 group-hover:text-cardinal-500 transition-colors" />
          <span className="flex-1 text-left text-xs font-medium">Search workspace</span>
          <kbd className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md border border-slate-200 font-mono font-semibold">⌘ K</kbd>
        </button>

        <div className="hidden xl:flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/60 px-3 py-2 text-[11px] font-semibold text-slate-500">
          <CalendarDays className="h-3.5 w-3.5 text-cardinal" />
          {new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date())}
        </div>

        <div className="h-6 w-px bg-slate-200 hidden md:block" />

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
            className="relative w-10 h-10 flex items-center justify-center text-slate-500 hover:text-cardinal-600 bg-white hover:bg-red-50 shadow-sm border border-gray-100 rounded-xl transition-all"
            id="notification-bell"
            aria-label="Notifications — 3 unread"
            aria-expanded={notifOpen}
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.7} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-cardinal rounded-full ring-2 ring-white animate-pulse" aria-hidden="true" />
          </button>

          {/* Notification Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
              <div className="px-5 py-3 border-b border-gray-50 flex justify-between items-center">
                <span className="font-semibold text-sm text-slate-900">Notifications</span>
                <span className="text-[10px] font-bold text-cardinal bg-cardinal-50 px-2 py-0.5 rounded-full uppercase tracking-wider">3 New</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                {/* ... (keep original notifications) */}
                <div className="px-4 py-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                  <p className="text-sm text-slate-900 font-medium">Project proposal approved</p>
                  <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
                </div>
                <div className="px-4 py-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                  <p className="text-sm text-slate-900 font-medium">New meeting scheduled</p>
                  <p className="text-xs text-slate-500 mt-1">5 hours ago</p>
                </div>
                <div className="px-4 py-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                  <p className="text-sm text-slate-900 font-medium">Logbook submission due</p>
                  <p className="text-xs text-slate-500 mt-1">Yesterday</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative hidden sm:block">
          <button onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200/70 bg-white px-2 py-1.5 pr-3 shadow-sm hover:border-slate-300"
            aria-expanded={userMenuOpen} aria-label="Open account menu">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#111827] text-xs font-bold text-white">{userProfile.name?.charAt(0) || 'U'}</span>
            <span className="hidden lg:block max-w-28 truncate text-xs font-bold text-slate-700">{userProfile.name}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_55px_rgba(15,23,42,.16)] animate-scale-in origin-top-right">
              <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                <p className="truncate text-xs font-bold text-slate-900">{userProfile.name}</p>
                <p className="mt-0.5 truncate text-[11px] text-slate-400">{userProfile.email}</p>
              </div>
              <button onClick={() => { setSettingsModalOpen(true); setUserMenuOpen(false); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-950"><Settings className="h-4 w-4" /> Account settings</button>
              <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-cardinal-600 hover:bg-cardinal-50"><LogOut className="h-4 w-4" /> Sign out</button>
            </div>
          )}
        </div>
      </div>

      {searchOpen && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center bg-slate-950/45 px-4 pt-[14vh] backdrop-blur-sm" onMouseDown={() => setSearchOpen(false)}>
          <div className="w-full max-w-xl overflow-hidden rounded-[22px] border border-white/60 bg-white shadow-[0_30px_100px_rgba(0,0,0,.3)] animate-scale-in" onMouseDown={event => event.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <Search className="h-5 w-5 text-cardinal" />
              <input autoFocus className="min-w-0 flex-1 border-0 p-0 text-sm shadow-none outline-none ring-0" placeholder="Search projects, teams, or actions…" />
              <button onClick={() => setSearchOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-3">
              <p className="px-3 pb-2 pt-1 text-[9px] font-bold uppercase tracking-[.2em] text-slate-400">Quick actions</p>
              {[['AI project analysis', '/student/recommendations'], ['Review project risk', '/mentor/risk'], ['Open analytics', '/admin/analytics']].map(([label, href]) => (
                <button key={href} onClick={() => { setSearchOpen(false); router.push(href); }} className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-cardinal-50 group-hover:text-cardinal"><Sparkles className="h-4 w-4" /></span>{label}
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
