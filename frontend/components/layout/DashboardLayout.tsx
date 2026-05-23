'use client';

import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role?: string;
  title?: string;
  userName?: string;
}

export default function DashboardLayout({ children, role = 'student', title = 'Dashboard', userName = '' }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar role={role} userName={userName} userRole={role} />
      <div className="ml-60">
        <Topbar title={title} />
        <main className="p-6 max-w-[1200px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
