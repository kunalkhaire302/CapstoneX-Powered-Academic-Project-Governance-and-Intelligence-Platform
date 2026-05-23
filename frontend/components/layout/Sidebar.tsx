'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

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
    { label: 'Logbook', href: '/student/logbook', icon: <BookIcon /> },
    { label: 'Marks', href: '/student/marks', icon: <ChartIcon /> },
  ],
  mentor: [
    { label: 'Dashboard', href: '/mentor', icon: <HomeIcon /> },
    { label: 'Groups', href: '/mentor/groups', icon: <GroupIcon /> },
    { label: 'Logbook Review', href: '/mentor/logbook-review', icon: <BookIcon /> },
    { label: 'Evaluations', href: '/mentor/evaluations', icon: <CheckIcon /> },
    { label: 'Schedule', href: '/mentor/schedule', icon: <CalendarIcon /> },
  ],
  coordinator: [
    { label: 'Dashboard', href: '/coordinator', icon: <HomeIcon /> },
    { label: 'Groups', href: '/coordinator/groups', icon: <GroupIcon /> },
    { label: 'Topics', href: '/coordinator/topics', icon: <FileIcon /> },
    { label: 'Risk Dashboard', href: '/coordinator/risk', icon: <AlertIcon /> },
    { label: 'Reports', href: '/coordinator/reports', icon: <ChartIcon /> },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin', icon: <HomeIcon /> },
    { label: 'Users', href: '/admin/users', icon: <GroupIcon /> },
    { label: 'Audit Log', href: '/admin/audit', icon: <FileIcon /> },
    { label: 'Risk Dashboard', href: '/admin/risk', icon: <AlertIcon /> },
    { label: 'Teams AI', href: '/admin/teams', icon: <GroupIcon /> },
    { label: 'Notifications', href: '/admin/notifications', icon: <BellIcon /> },
  ],
};

export default function Sidebar({ role = 'student', userName = '', userRole = '' }: { role?: string; userName?: string; userRole?: string }) {
  const pathname = usePathname();
  const navItems = roleNavItems[role] || roleNavItems.student;

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="CX" className="w-8 h-8 object-contain" />
          <span className="font-display text-xl text-thunder">CapstoneX</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate">Navigation</span>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'border-l-[3px] border-cardinal bg-cardinal-light text-cardinal'
                  : 'text-slate hover:bg-surface hover:text-thunder'
              }`}
            >
              <span className="w-5 h-5">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-cardinal-light flex items-center justify-center">
            <span className="text-cardinal font-semibold text-sm">{userName?.charAt(0) || 'U'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-thunder truncate">{userName || 'User'}</p>
            <p className="text-xs text-slate capitalize">{userRole || role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Inline SVG icons (Lucide-style)
function HomeIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>; }
function GroupIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>; }
function FileIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>; }
function BookIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>; }
function ChartIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>; }
function CheckIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }
function CalendarIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>; }
function AlertIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>; }
function BellIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>; }
