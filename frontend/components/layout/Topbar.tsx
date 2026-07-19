'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <header className="h-16 sm:h-20 bg-white/40 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 transition-all duration-300" role="banner">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-4">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white/50 transition-colors -ml-2"
          aria-label="Open navigation menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span>Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="text-cardinal-500">{title}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display text-slate-900 leading-none">{title}</h1>
        </div>
      </div>

      {/* Center/Right section */}
      <div className="flex items-center gap-3 sm:gap-5" ref={dropdownRef}>
        {/* Command Palette Trigger */}
        <button
          className="hidden md:flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 bg-white hover:bg-gray-50 rounded-xl transition-all shadow-sm border border-gray-100 min-w-[240px] group"
          id="search-btn"
          aria-label="Search"
          onClick={() => alert('Command Palette coming soon!')}
        >
          <svg className="w-4 h-4 text-slate-300 group-hover:text-cardinal-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <span className="flex-1 text-left text-xs font-medium">Search for anything...</span>
          <kbd className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 font-mono font-semibold">⌘K</kbd>
        </button>

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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
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

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
            className={`flex items-center gap-3 pl-1.5 pr-3 py-1.5 rounded-full transition-all border ${userMenuOpen ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'}`}
            id="user-menu"
            aria-label="User menu"
            aria-haspopup="true"
            aria-expanded={userMenuOpen}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cardinal to-cardinal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white font-bold text-xs" aria-hidden="true">{userProfile.name.charAt(0).toUpperCase()}</span>
            </div>
            <svg className={`w-4 h-4 text-slate-400 hidden sm:block transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {/* Profile Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-fade-in">
              <div className="px-4 py-3 mb-2 border-b border-gray-100/60">
                <p className="text-sm font-semibold text-slate-900">{userProfile.name}</p>
                <p className="text-[12px] text-slate-500 truncate mt-0.5">{userProfile.email}</p>
              </div>
              <div className="space-y-1">
                <button 
                  onClick={() => { setSettingsModalOpen(true); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Settings
                </button>
                <button 
                  onClick={() => { alert('Support center coming soon!'); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Support
                </button>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100/60">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-cardinal hover:bg-red-50 rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4 text-cardinal/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <SettingsModal 
        isOpen={settingsModalOpen} 
        onClose={() => setSettingsModalOpen(false)} 
        profile={userProfile}
        onSaveProfile={(newProfile) => setUserProfile(newProfile)}
      />
    </header>
  );
}
