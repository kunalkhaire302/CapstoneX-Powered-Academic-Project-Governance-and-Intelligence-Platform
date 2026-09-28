'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/Card';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Users, Clock, CheckCircle, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import DataTable from '@/components/ui/DataTable';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useCurrentUser } from '@/lib/hooks';

function WelcomeBanner() {
  const user = useCurrentUser();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 bg-gradient-dark rounded-2xl p-8 text-white shadow-brand relative overflow-hidden"
    >
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold mb-2">
            {greeting}, {user?.name?.split(' ')[0] || 'Mentor'} 👋
          </h2>
          <p className="text-slate-300 max-w-lg">
            Here's an overview of your assigned groups and pending logbook reviews.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function MentorDashboard() {
  const user = useCurrentUser();
  const [groups, setGroups] = useState<any[]>([]);
  const [logbooks, setLogbooks] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([api.get('/groups'), api.get('/logbooks'), api.get('/evaluations')])
      .then(([groupsRes, logbooksRes, evaluationsRes]) => {
        setGroups((groupsRes.data.data || []).filter((group: any) => group.mentor_id === user.id));
        setLogbooks(logbooksRes.data.data || []);
        setEvaluations(evaluationsRes.data.data || []);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const pendingReviews = logbooks.filter(logbook => ['submitted', 'revision_requested'].includes(logbook.status));
  const average = evaluations.length ? Math.round(evaluations.reduce((sum, evaluation) => sum + Number(evaluation.total_score || 0) / Number(evaluation.max_score || 1) * 100, 0) / evaluations.length) : '—';
  const stats = [
    { label: 'Assigned Groups', value: groups.length, iconBg: 'bg-blue-50 text-blue-600', icon: <Users className="w-6 h-6" /> },
    { label: 'Pending Reviews', value: pendingReviews.length, iconBg: 'bg-amber-50 text-amber-600', icon: <Clock className="w-6 h-6" /> },
    { label: 'Evaluations Done', value: evaluations.length, iconBg: 'bg-emerald-50 text-emerald-600', icon: <CheckCircle className="w-6 h-6" /> },
    { label: 'Avg Score Given', value: average === '—' ? '—' : `${average}%`, iconBg: 'bg-violet-50 text-violet-600', icon: <Target className="w-6 h-6" /> },
  ];
  const groupRows = groups.map(group => ({ ...group, topic: group.Topics?.find((topic: any) => topic.status === 'approved')?.title || 'No approved topic', members: group.members?.length || 0, pendingLogbooks: pendingReviews.filter(logbook => logbook.group_id === group.id).length }));

  const columns = [
    { 
      header: 'Group',
      accessorKey: 'name' as const,
      className: 'font-semibold text-cx-text',
    },
    { 
      header: 'Topic',
      accessorKey: 'topic' as const,
      className: 'text-cx-text-secondary',
    },
    {
      header: 'Members',
      cell: (group: any) => (
        <div className="flex -space-x-1.5">
          {Array.from({ length: Math.min(group.members, 3) }).map((_, j) => (
            <div key={j} className="w-6 h-6 rounded-full bg-cx-bg-muted border-2 border-cx-surface flex items-center justify-center text-[9px] font-bold text-cx-text-secondary">
              {String.fromCharCode(65 + j)}
            </div>
          ))}
          {group.members > 3 && <div className="w-6 h-6 rounded-full bg-cx-bg-muted border-2 border-cx-surface flex items-center justify-center text-[9px] text-cx-text-secondary">+{group.members - 3}</div>}
        </div>
      )
    },
    {
      header: 'Status',
      cell: (group: any) => <StatusBadge status={group.status} />
    },
    {
      header: 'Pending',
      cell: (group: any) => group.pendingLogbooks > 0 ? (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          {group.pendingLogbooks} logbooks
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <CheckCircle className="w-3.5 h-3.5" />
          All reviewed
        </span>
      )
    }
  ];

  return (
    <DashboardLayout role="mentor" title="Mentor Dashboard">
      <WelcomeBanner />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <StatCard key={i} label={stat.label} value={loading ? '...' : stat.value} icon={stat.icon} iconBg={stat.iconBg} delay={i} />
        ))}
      </div>

      <Card padding="none">
        <div className="flex items-center justify-between p-6 border-b border-cx-border-subtle">
          <h3 className="text-lg font-display font-semibold text-cx-text">Assigned Groups</h3>
          <span className="text-xs text-cx-text-secondary bg-cx-bg-muted px-2.5 py-1 rounded-full">{loading ? 'Loading' : `${groups.length} groups`}</span>
        </div>
        <DataTable data={groupRows} columns={columns} className="border-none shadow-none rounded-none" />
      </Card>
    </DashboardLayout>
  );
}
