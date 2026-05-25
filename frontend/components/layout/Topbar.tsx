'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TopbarProps {
  title?: string;
  onMenuToggle?: () => void;
}

export default function Topbar({ title = 'Dashboard', onMenuToggle }: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
    // In a real app, you would clear tokens here
    router.push('/login');
  };

  return (
    <header className="h-14 sm:h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30" role="banner">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-slate hover:text-thunder hover:bg-gray-50 transition-colors -ml-1"
          aria-label="Open navigation menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate mb-0.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span>Home</span>
            <svg className="w-3 h-3 text-slate/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-thunder font-medium">{title}</span>
          </div>
          <h1 className="text-base sm:text-lg font-display text-thunder">{title}</h1>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 sm:gap-2" ref={dropdownRef}>
        {/* Search */}
        <button
          className="flex items-center gap-2 px-2.5 sm:px-3 py-2 text-sm text-slate bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100"
          id="search-btn"
          aria-label="Search"
          onClick={() => alert('Search functionality coming soon!')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <span className="hidden md:inline text-xs">Search...</span>
          <kbd className="hidden lg:inline text-[10px] bg-white text-slate/50 px-1.5 py-0.5 rounded border border-gray-200 font-mono">⌘K</kbd>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
            className="relative w-10 h-10 flex items-center justify-center text-slate hover:text-thunder hover:bg-gray-50 rounded-lg transition-all"
            id="notification-bell"
            aria-label="Notifications — 3 unread"
            aria-expanded={notifOpen}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cardinal rounded-full ring-2 ring-white animate-pulse" aria-hidden="true" />
          </button>

          {/* Notification Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
                <span className="font-semibold text-sm text-thunder">Notifications</span>
                <span className="text-[10px] font-bold text-cardinal bg-cardinal-50 px-2 py-0.5 rounded-full uppercase tracking-wider">3 New</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto p-1.5 space-y-0.5">
                <div className="px-3 py-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <p className="text-sm text-thunder font-medium">Project proposal approved</p>
                  <p className="text-xs text-slate mt-0.5">2 hours ago</p>
                </div>
                <div className="px-3 py-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <p className="text-sm text-thunder font-medium">New meeting scheduled</p>
                  <p className="text-xs text-slate mt-0.5">5 hours ago</p>
                </div>
                <div className="px-3 py-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <p className="text-sm text-thunder font-medium">Logbook submission due</p>
                  <p className="text-xs text-slate mt-0.5">Yesterday</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
            className={`flex items-center gap-2 sm:gap-2.5 pl-2 pr-2 sm:pr-3 py-1.5 rounded-lg transition-all ${userMenuOpen ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            id="user-menu"
            aria-label="User menu"
            aria-haspopup="true"
            aria-expanded={userMenuOpen}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cardinal to-cardinal-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs" aria-hidden="true">U</span>
            </div>
            <svg className={`w-4 h-4 text-slate/50 hidden sm:block transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {/* Profile Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 z-50 animate-fade-in">
              <div className="px-3 py-2.5 mb-1 border-b border-gray-100/60">
                <p className="text-sm font-semibold text-thunder">User Profile</p>
                <p className="text-[13px] text-slate truncate">user@capstonex.com</p>
              </div>
              <div className="space-y-0.5">
                <button 
                  onClick={() => { alert('Settings panel coming soon!'); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate hover:text-thunder hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 text-slate/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Settings
                </button>
                <button 
                  onClick={() => { alert('Support center coming soon!'); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate hover:text-thunder hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 text-slate/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Support
                </button>
              </div>
              <div className="mt-1 pt-1 border-t border-gray-100/60">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-cardinal hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 text-cardinal/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
