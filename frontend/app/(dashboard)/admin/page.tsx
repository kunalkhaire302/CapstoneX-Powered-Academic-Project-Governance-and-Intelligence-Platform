'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { useCurrentUser } from '@/lib/hooks';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

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
      alert(`Failed to download ${type} report. Please ensure the backend is running and you have proper permissions.`);
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
        // Fallback to mock data if not authenticated
        setAnalytics({
          overview: { totalUsers: 17, totalGroups: 3, totalTopics: 2, totalLogbooks: 0, totalEvaluations: 0 },
          usersByRole: [
            { role: 'student', count: '10' }, { role: 'mentor', count: '2' },
            { role: 'coordinator', count: '1' }, { role: 'hod', count: '1' },
            { role: 'admin', count: '1' }, { role: 'accreditation', count: '1' },
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
  const roleColorMap: Record<string, string> = {
    student: 'bg-blue-500', mentor: 'bg-green-500', coordinator: 'bg-yellow-500',
    hod: 'bg-purple-500', admin: 'bg-red-500', accreditation: 'bg-gray-400',
  };

  return (
    <DashboardLayout role="admin" title="Admin Dashboard" userName={user?.name || 'Admin User'}>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats?.totalUsers ?? '—', change: `${stats?.totalUsers || 0} active`, icon: '👥' },
          { label: 'Active Groups', value: stats?.totalGroups ?? '—', change: `${analytics?.groupsByStatus?.find(g => g.status === 'in_progress')?.count || 0} in progress`, icon: '📁' },
          { label: 'Submissions (7d)', value: analytics?.recentActivity?.submissionsLast7Days ?? '—', change: 'Last 7 days', icon: '📝' },
          { label: 'Evaluations (Month)', value: analytics?.recentActivity?.evaluationsThisMonth ?? '—', change: 'This month', icon: '✅' },
        ].map((s, i) => (
          <Card key={i}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate">{s.label}</p>
                <p className="text-3xl font-display text-thunder mt-1">{loading ? '...' : s.value}</p>
                <p className="text-xs text-green-600 mt-1">↑ {s.change}</p>
              </div>
              <span className="text-2xl">{s.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users by Role */}
        <Card>
          <h3 className="text-lg font-display text-thunder mb-4">Users by Role</h3>
          <div className="space-y-3">
            {(analytics?.usersByRole || []).map((r, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${roleColorMap[r.role] || 'bg-gray-400'}`} />
                  <span className="text-sm text-thunder capitalize">{r.role}s</span>
                </div>
                <span className="text-sm font-medium text-thunder">{r.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-display text-thunder mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Manage Users', sub: 'CRUD + CSV Import', href: '/admin/users' },
              { label: 'Audit Logs', sub: 'View all activity', href: '/admin/audit' },
              { label: 'Risk Dashboard', sub: 'AI risk scores', href: '/admin/risk' },
              { label: 'Broadcast', sub: 'Send notifications', href: '/admin/notifications' },
              { label: 'AI Teams', sub: 'Smart team formation', href: '/admin/teams' },
              { label: 'Topics', sub: 'Topic overview', href: '/admin/audit?entity_type=topic' },
            ].map((a, i) => (
              <Link key={i} href={a.href} className="p-3 border border-border rounded-lg hover:border-cardinal hover:bg-cardinal-light/30 transition-all text-center group">
                <p className="text-sm font-medium text-thunder group-hover:text-cardinal">{a.label}</p>
                <p className="text-xs text-slate mt-0.5">{a.sub}</p>
              </Link>
            ))}
          </div>
        </Card>

        {/* System Reports */}
        <Card>
          <h3 className="text-lg font-display text-thunder mb-4">System Reports</h3>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleDownload('pdf')}
              disabled={downloading === 'pdf'}
              className="w-full flex items-center justify-between p-3 border border-border rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-left group disabled:opacity-50"
            >
              <div>
                <p className="text-sm font-medium text-thunder group-hover:text-red-600">PDF Report</p>
                <p className="text-xs text-slate mt-0.5">Formal document format</p>
              </div>
              <span className="text-xl">{downloading === 'pdf' ? '⏳' : '📄'}</span>
            </button>
            <button
              onClick={() => handleDownload('excel')}
              disabled={downloading === 'excel'}
              className="w-full flex items-center justify-between p-3 border border-border rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group disabled:opacity-50"
            >
              <div>
                <p className="text-sm font-medium text-thunder group-hover:text-green-600">Excel Export</p>
                <p className="text-xs text-slate mt-0.5">Raw data for analysis</p>
              </div>
              <span className="text-xl">{downloading === 'excel' ? '⏳' : '📊'}</span>
            </button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
