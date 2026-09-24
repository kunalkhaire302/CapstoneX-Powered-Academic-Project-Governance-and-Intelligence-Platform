'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState, useRef } from 'react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import api, { setStoredAccessToken } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  Sparkles,
  BookOpen,
  LineChart,
  Bell,
  Calendar,
  ShieldAlert,
  BarChart,
  Settings,
  LogOut,
  ChevronDown,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
  Bot
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const roleNavItems: Record<string, NavItem[]> = {
  student: [
    { label: 'Dashboard', href: '/student', icon: <LayoutDashboard /> },
    { label: 'My Groups', href: '/student/groups', icon: <Users /> },
    { label: 'Topics', href: '/student/topics', icon: <FileText /> },
    { label: 'AI Recommendations', href: '/student/recommendations', icon: <Sparkles /> },
    { label: 'AI Team', href: '/student/ai-team', icon: <Bot /> },
    { label: 'Logbook', href: '/student/logbook', icon: <BookOpen /> },
    { label: 'Marks', href: '/student/marks', icon: <LineChart /> },
    { label: 'Notifications', href: '/student/notifications', icon: <Bell /> },
  ],
  mentor: [
    { label: 'Dashboard', href: '/mentor', icon: <LayoutDashboard /> },
    { label: 'Groups', href: '/mentor/groups', icon: <Users /> },
    { label: 'Logbook Review', href: '/mentor/logbook-review', icon: <BookOpen /> },
    { label: 'Evaluations', href: '/mentor/evaluations', icon: <FileText /> },
    { label: 'Schedule', href: '/mentor/schedule', icon: <Calendar /> },
    { label: 'Risk Dashboard', href: '/mentor/risk', icon: <ShieldAlert /> },
    { label: 'Reports', href: '/mentor/reports', icon: <BarChart /> },
    { label: 'AI Team', href: '/mentor/ai-team', icon: <Bot /> },
    { label: 'Notifications', href: '/mentor/notifications', icon: <Bell /> },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard /> },
    { label: 'Users', href: '/admin/users', icon: <Users /> },
    { label: 'Audit Log', href: '/admin/audit', icon: <FileText /> },
    { label: 'Topic Approvals', href: '/admin/topics', icon: <FileText /> },
    { label: 'Risk Dashboard', href: '/admin/risk', icon: <ShieldAlert /> },
    { label: 'Teams AI', href: '/admin/teams', icon: <Users /> },
    { label: 'AI Analytics', href: '/admin/analytics', icon: <Sparkles /> },
    { label: 'AI Team', href: '/admin/ai-team', icon: <Bot /> },
    { label: 'Model Registry', href: '/admin/models', icon: <LineChart /> },
    { label: 'Notifications', href: '/admin/notifications', icon: <Bell /> },
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
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      if (auth) await signOut(auth);
    } catch(e) {
      console.error('Logout error', e);
    }
    setStoredAccessToken(null);
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen lg:h-[calc(100vh-1.5rem)] lg:top-3 lg:left-3',
        'bg-[#0B101D] flex flex-col z-40',
        'lg:rounded-2xl lg:shadow-[0_24px_70px_rgba(0,0,0,.35)]',
        'transition-all duration-300 ease-out border border-white/5',
        isCollapsed ? 'w-[80px]' : 'w-[280px] sm:w-[264px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Background patterns */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none lg:rounded-2xl" />
      
      {/* Close button — mobile only */}
      <button
        onClick={onClose}
        className="lg:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Close navigation menu"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Collapse toggle — desktop only */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-cx-brand text-white rounded-full items-center justify-center shadow-md hover:bg-cx-brand-hover hover:scale-110 transition-all z-50 border border-[#0B101D]"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Logo */}
      <div className={cn("px-5 pb-6 pt-8 transition-all", isCollapsed ? "items-center" : "")}>
        <Link href="/" className={cn("flex items-center gap-3 group", isCollapsed ? "justify-center" : "")} aria-label="CapstoneX — Go to homepage">
          <div className="relative w-10 h-10 rounded-[12px] bg-cx-brand flex items-center justify-center shadow-brand group-hover:scale-105 transition-all duration-300 flex-shrink-0">
            <img src="/logo.png" alt="" className="w-5 h-5 object-contain brightness-0 invert" aria-hidden="true" />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#0b101d] bg-emerald-400" />
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in truncate">
              <span className="font-display text-xl text-white font-semibold tracking-tight block leading-none mb-1">CapstoneX</span>
              <span className="text-[9px] text-white/40 font-bold uppercase tracking-[0.2em]">Governance OS</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto px-4 scrollbar-hide" aria-label="Sidebar navigation">
        <ul className="space-y-1.5 list-none" role="list">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center rounded-xl text-sm font-medium transition-all duration-200 group relative',
                    isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5',
                    isActive
                      ? 'text-white bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/5'
                      : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                  )}
                >
                  {/* Active indicator */}
                  {isActive && !isCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cx-brand rounded-r-full shadow-glow" aria-hidden="true" />
                  )}
                  
                  <span className={cn(
                    'flex-shrink-0 transition-all duration-200 [&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-[2]',
                    isActive ? 'text-white' : 'text-white/40 group-hover:text-white/80'
                  )}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 mt-auto relative" ref={dropdownRef}>
        {!isCollapsed && (
          <div className="mb-3 flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-white/30">
            <span>System status</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <i className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
            </span>
          </div>
        )}
        
        <div 
          className={cn(
            'flex items-center rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group',
            isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-3'
          )}
          role="button" 
          tabIndex={0}
          onClick={() => setUserMenuOpen(!userMenuOpen)}
        >
          <div className="w-9 h-9 rounded-full bg-cx-brand/20 text-cx-brand-subtle flex items-center justify-center ring-1 ring-white/10 flex-shrink-0 group-hover:ring-white/20 transition-all">
            <span className="font-semibold text-sm">{userName?.charAt(0) || 'U'}</span>
          </div>
          
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{userName || 'User'}</p>
                <p className="text-xs text-white/50 capitalize font-medium">{userRole || role}</p>
              </div>
              <ChevronDown className={cn('w-4 h-4 text-white/40 transition-transform flex-shrink-0', userMenuOpen ? 'rotate-180' : '')} />
            </>
          )}
        </div>

        {/* Profile Dropdown Menu */}
        {userMenuOpen && (
          <div className={cn(
            "absolute bottom-[calc(100%-1rem)] bg-[#1a2235] rounded-xl shadow-2xl border border-white/10 p-2 z-50 animate-fade-in origin-bottom-left",
            isCollapsed ? "left-14 w-48" : "left-4 w-[calc(100%-2rem)]"
          )}>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-red-400 hover:bg-white/5 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
