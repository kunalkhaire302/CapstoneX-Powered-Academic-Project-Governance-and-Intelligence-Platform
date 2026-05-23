'use client';

import { useState } from 'react';

export default function Topbar({ title = 'Dashboard' }: { title?: string }) {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-border shadow-topbar flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Breadcrumb */}
      <div>
        <h1 className="text-lg font-display text-thunder">{title}</h1>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative p-2 text-slate hover:text-thunder hover:bg-surface rounded-md transition-colors"
          id="notification-bell"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          {/* Unread indicator */}
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-cardinal text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* User Menu */}
        <button className="flex items-center gap-2 text-sm text-slate hover:text-thunder transition-colors" id="user-menu">
          <div className="w-8 h-8 rounded-full bg-cardinal-light flex items-center justify-center">
            <span className="text-cardinal font-semibold text-xs">U</span>
          </div>
        </button>
      </div>
    </header>
  );
}
