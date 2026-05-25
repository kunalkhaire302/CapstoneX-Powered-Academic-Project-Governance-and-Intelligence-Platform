'use client';

import { useState } from 'react';

interface TopbarProps {
  title?: string;
  onMenuToggle?: () => void;
}

export default function Topbar({ title = 'Dashboard', onMenuToggle }: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);

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
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Search */}
        <button
          className="flex items-center gap-2 px-2.5 sm:px-3 py-2 text-sm text-slate bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100"
          id="search-btn"
          aria-label="Search"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <span className="hidden md:inline text-xs">Search...</span>
          <kbd className="hidden lg:inline text-[10px] bg-white text-slate/50 px-1.5 py-0.5 rounded border border-gray-200 font-mono">⌘K</kbd>
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative w-10 h-10 flex items-center justify-center text-slate hover:text-thunder hover:bg-gray-50 rounded-lg transition-all"
          id="notification-bell"
          aria-label="Notifications — 3 unread"
          aria-expanded={notifOpen}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          {/* Unread indicator */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cardinal rounded-full ring-2 ring-white animate-pulse" aria-hidden="true" />
        </button>

        {/* User Menu */}
        <button
          className="flex items-center gap-2 sm:gap-2.5 pl-2 pr-2 sm:pr-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all"
          id="user-menu"
          aria-label="User menu"
          aria-haspopup="true"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cardinal to-cardinal-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs" aria-hidden="true">U</span>
          </div>
          <svg className="w-4 h-4 text-slate/50 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>
    </header>
  );
}
