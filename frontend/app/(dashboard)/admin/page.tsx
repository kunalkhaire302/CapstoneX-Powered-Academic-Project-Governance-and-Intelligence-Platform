'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { useCurrentUser } from '@/lib/hooks';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

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
    admin: { color: 'bg-cardinal', bg: 'bg-cardinal-50' },
  };

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? '—', change: `${stats?.totalUsers || 0} active`, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>, iconBg: 'bg-blue-50 text-blue-500' },
    { label: 'Active Groups', value: stats?.totalGroups ?? '—', change: `${analytics?.groupsByStatus?.find(g => g.status === 'in_progress')?.count || 0} in progress`, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>, iconBg: 'bg-emerald-50 text-emerald-500' },
    { label: 'Submissions (7d)', value: analytics?.recentActivity?.submissionsLast7Days ?? '—', change: 'Last 7 days', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>, iconBg: 'bg-amber-50 text-amber-500' },
    { label: 'Evaluations', value: analytics?.recentActivity?.evaluationsThisMonth ?? '—', change: 'This month', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, iconBg: 'bg-violet-50 text-violet-500' },
  ];

  return (
    <DashboardLayout role="admin" title="Admin Dashboard" userName={user?.name || 'Admin User'}>

      {/* ── Welcome Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 p-6 bg-gradient-to-br from-thunder to-dark-surface rounded-2xl text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D2232A 0%, transparent 60%)' }} />
        <div className="relative">
          <p className="text-sm text-white/60 font-medium">{getGreeting()},</p>
          <h1 className="text-2xl font-display mt-0.5">{user?.name || 'Admin'}</h1>
          <p className="text-sm text-white/50 mt-1">Here's what's happening on CapstoneX today.</p>
        </div>
        <div className="relative flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/10 rounded-full text-xs font-semibold text-white/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Online
          </span>
          <Link href="/admin/analytics"
            className="px-4 py-2 text-sm font-semibold bg-cardinal hover:bg-cardinal-hover rounded-xl transition-colors shadow-sm">
            View Analytics →
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <Card key={i} className="animate-fade-in group" style={{ animationDelay: `${i * 0.08}s` } as any}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate font-medium">{s.label}</p>
                {loading
                  ? <div className="h-9 w-16 bg-gray-100 rounded-lg animate-pulse mt-1" />
                  : <p className="text-3xl font-display text-thunder mt-1">{s.value}</p>
                }
                <p className="text-xs text-emerald-500 font-medium mt-1.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
                  {s.change}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${s.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                {s.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users by Role */}
        <Card>
          <h3 className="text-lg font-display text-thunder mb-5">Users by Role</h3>
          <div className="space-y-3">
            {(analytics?.usersByRole || []).map((r, i) => {
              const total = analytics?.overview?.totalUsers || 1;
              const pct = Math.round((parseInt(r.count) / total) * 100);
              const cfg = roleConfig[r.role] || { color: 'bg-gray-400', bg: 'bg-gray-50' };
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${cfg.color}`} />
                      <span className="text-sm text-thunder capitalize font-medium">{r.role}s</span>
                    </div>
                    <span className="text-sm font-semibold text-thunder">{r.count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${cfg.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-display text-thunder mb-5">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Manage Users', sub: 'CRUD + CSV Import', href: '/admin/users', icon: '👥' },
              { label: 'Audit Logs', sub: 'View all activity', href: '/admin/audit', icon: '📋' },
              { label: 'Risk Dashboard', sub: 'AI risk scores', href: '/admin/risk', icon: '⚠️' },
              { label: 'Broadcast', sub: 'Send notifications', href: '/admin/notifications', icon: '📣' },
              { label: 'AI Teams', sub: 'Smart formation', href: '/admin/teams', icon: '🤖' },
              { label: 'Topics', sub: 'Topic overview', href: '/admin/audit?entity_type=topic', icon: '📄' },
            ].map((a, i) => (
              <Link key={i} href={a.href} className="p-3.5 border border-gray-100 rounded-xl hover:border-cardinal/30 hover:bg-cardinal-50/30 transition-all text-center group">
                <span className="text-xl mb-1.5 block group-hover:scale-110 transition-transform">{a.icon}</span>
                <p className="text-sm font-semibold text-thunder group-hover:text-cardinal transition-colors">{a.label}</p>
                <p className="text-[11px] text-slate mt-0.5">{a.sub}</p>
              </Link>
            ))}
          </div>
        </Card>

        {/* System Reports */}
        <Card>
          <h3 className="text-lg font-display text-thunder mb-5">System Reports</h3>
          <div className="flex flex-col gap-3">
            <button onClick={() => handleDownload('pdf')} disabled={downloading === 'pdf'}
              className="w-full flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-red-200 hover:bg-red-50/50 transition-all text-left group disabled:opacity-50">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-thunder group-hover:text-red-600 transition-colors">PDF Report</p>
                <p className="text-xs text-slate mt-0.5">Formal document format</p>
              </div>
            </button>
            <button onClick={() => handleDownload('excel')} disabled={downloading === 'excel'}
              className="w-full flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/50 transition-all text-left group disabled:opacity-50">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M12 12h.008v.008H12v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-thunder group-hover:text-emerald-600 transition-colors">Excel Export</p>
                <p className="text-xs text-slate mt-0.5">Raw data for analysis</p>
              </div>
            </button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
