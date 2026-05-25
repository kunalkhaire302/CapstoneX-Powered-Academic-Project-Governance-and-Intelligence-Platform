'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role?: string;
  title?: string;
  userName?: string;
}

export default function DashboardLayout({ children, role = 'student', title = 'Dashboard', userName = '' }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — hidden on mobile by default, toggled */}
      <Sidebar
        role={role}
        userName={userName}
        userRole={role}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="lg:ml-[250px] min-h-screen flex flex-col">
        <Topbar title={title} onMenuToggle={() => setSidebarOpen(true)} />
        <main id="main-content" className="flex-1 p-4 sm:p-6 max-w-[1200px] w-full mx-auto animate-fade-in" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
