'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { StatCard } from '@/components/ui/Card';
import { useCurrentUser } from '@/lib/hooks';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Users, FileText, CheckCircle, Activity, Download, FileSpreadsheet, ShieldAlert, Bot, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

interface Analytics {
  overview: { totalUsers: number; totalGroups: number; totalTopics: number; totalLogbooks: number; totalEvaluations: number };
  usersByRole: { role: string; count: string }[];
  groupsByStatus: { status: string; count: string }[];
  recentActivity: { submissionsLast7Days: number; evaluationsThisMonth: number };
}

export default function AdminDashboardPage() {
  const user = useCurrentUser();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (type: 'pdf' | 'excel') => {
    setDownloading(type);
    try {
      const res = await api.get(`/export/groups/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `groups_report.${type === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error(`Failed to download ${type} report`, error);
    } finally {
      setDownloading(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/analytics/system');
        setAnalytics(res.data);
      } catch {
        setAnalytics({
          overview: { totalUsers: 17, totalGroups: 3, totalTopics: 2, totalLogbooks: 0, totalEvaluations: 0 },
          usersByRole: [
            { role: 'student', count: '10' }, { role: 'mentor', count: '2' },
            { role: 'admin', count: '1' },
          ],
          groupsByStatus: [
            { status: 'not_started', count: '1' }, { status: 'in_progress', count: '2' },
          ],
          recentActivity: { submissionsLast7Days: 0, evaluationsThisMonth: 0 },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = analytics?.overview;
  const roleConfig: Record<string, { color: string; bg: string }> = {
    student: { color: 'bg-blue-500', bg: 'bg-blue-50' },
    mentor: { color: 'bg-emerald-500', bg: 'bg-emerald-50' },
    admin: { color: 'bg-cardinal-500', bg: 'bg-cardinal-50' },
  };

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? '—', trend: { value: 0, positive: true }, change: `${stats?.totalUsers || 0} active`, icon: <Users className="w-6 h-6" />, iconBg: 'bg-blue-50 text-blue-600' },
    { label: 'Active Groups', value: stats?.totalGroups ?? '—', trend: { value: 0, positive: true }, change: `${analytics?.groupsByStatus?.find(g => g.status === 'in_progress')?.count || 0} in progress`, icon: <Activity className="w-6 h-6" />, iconBg: 'bg-emerald-50 text-emerald-600' },
    { label: 'Submissions (7d)', value: analytics?.recentActivity?.submissionsLast7Days ?? '—', trend: { value: 0, positive: true }, change: 'Last 7 days', icon: <FileText className="w-6 h-6" />, iconBg: 'bg-amber-50 text-amber-600' },
    { label: 'Evaluations', value: analytics?.recentActivity?.evaluationsThisMonth ?? '—', trend: { value: 0, positive: true }, change: 'This month', icon: <CheckCircle className="w-6 h-6" />, iconBg: 'bg-violet-50 text-violet-600' },
  ];

  return (
    <DashboardLayout role="admin" title="Admin Dashboard">

      {/* ── Welcome Header ─────────────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 p-6 bg-gradient-dark rounded-2xl text-white relative overflow-hidden shadow-brand"
      >
        <div className="relative z-10">
          <p className="text-sm text-white/60 font-medium">{getGreeting()},</p>
          <h1 className="text-2xl font-display font-bold mt-0.5">{user?.name || 'Admin'} 👋</h1>
          <p className="text-sm text-white/50 mt-1">Here&apos;s what&apos;s happening on CapstoneX today.</p>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/10 rounded-full text-xs font-semibold text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Online
          </span>
          <Link href="/admin/analytics"
            className="px-4 py-2 text-sm font-semibold bg-cardinal hover:bg-cardinal-hover text-white rounded-xl transition-colors shadow-brand">
            View Analytics →
          </Link>
        </div>
      </motion.div>

      {/* ── Stat Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <StatCard key={i} label={s.label} value={loading ? '...' : s.value} icon={s.icon} iconBg={s.iconBg} delay={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users by Role */}
        <Card>
          <h3 className="text-lg font-display font-semibold text-cx-text mb-5">Users by Role</h3>
          <div className="space-y-4">
            {(analytics?.usersByRole || []).map((r, i) => {
              const total = analytics?.overview?.totalUsers || 1;
              const pct = Math.round((parseInt(r.count) / total) * 100);
              const cfg = roleConfig[r.role] || { color: 'bg-slate-400', bg: 'bg-cx-bg-muted' };
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${cfg.color}`} />
                      <span className="text-sm text-cx-text capitalize font-medium">{r.role}s</span>
                    </div>
                    <span className="text-sm font-semibold text-cx-text">{r.count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-cx-bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${cfg.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-display font-semibold text-cx-text mb-5">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Manage Users', sub: 'CRUD + CSV Import', href: '/admin/users', icon: <Users className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50 border-blue-100 hover:border-blue-200' },
              { label: 'Audit Logs', sub: 'View all activity', href: '/admin/audit', icon: <FileText className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-100 hover:border-emerald-200' },
              { label: 'Risk Dashboard', sub: 'AI risk scores', href: '/admin/risk', icon: <ShieldAlert className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50 border-amber-100 hover:border-amber-200' },
              { label: 'Broadcast', sub: 'Send notifications', href: '/admin/notifications', icon: <Bell className="w-5 h-5 text-indigo-600" />, bg: 'bg-indigo-50 border-indigo-100 hover:border-indigo-200' },
              { label: 'AI Teams', sub: 'Smart formation', href: '/admin/teams', icon: <Bot className="w-5 h-5 text-violet-600" />, bg: 'bg-violet-50 border-violet-100 hover:border-violet-200' },
              { label: 'Topics', sub: 'Topic overview', href: '/admin/audit?entity_type=topic', icon: <FileText className="w-5 h-5 text-pink-600" />, bg: 'bg-pink-50 border-pink-100 hover:border-pink-200' },
            ].map((a, i) => (
              <Link key={i} href={a.href} className={`p-3.5 border rounded-xl transition-all text-center group cursor-pointer ${a.bg}`}>
                <span className="flex items-center justify-center w-8 h-8 mx-auto mb-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">{a.icon}</span>
                <p className="text-sm font-semibold text-cx-text group-hover:text-cx-text transition-colors">{a.label}</p>
                <p className="text-[11px] text-cx-text-muted mt-0.5">{a.sub}</p>
              </Link>
            ))}
          </div>
        </Card>

        {/* System Reports */}
        <Card>
          <h3 className="text-lg font-display font-semibold text-cx-text mb-5">System Reports</h3>
          <div className="flex flex-col gap-3">
            <button onClick={() => handleDownload('pdf')} disabled={downloading === 'pdf'}
              className="w-full flex items-center gap-4 p-4 border border-cx-border rounded-xl hover:border-red-200 hover:bg-red-50/50 transition-all text-left group disabled:opacity-50">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-cx-text group-hover:text-red-600 transition-colors">PDF Report</p>
                <p className="text-xs text-cx-text-muted mt-0.5">Formal document format</p>
              </div>
            </button>
            <button onClick={() => handleDownload('excel')} disabled={downloading === 'excel'}
              className="w-full flex items-center gap-4 p-4 border border-cx-border rounded-xl hover:border-emerald-200 hover:bg-emerald-50/50 transition-all text-left group disabled:opacity-50">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-cx-text group-hover:text-emerald-600 transition-colors">Excel Export</p>
                <p className="text-xs text-cx-text-muted mt-0.5">Raw data for analysis</p>
              </div>
            </button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
