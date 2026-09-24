'use client';

import DashboardLayout, { useUserProfile } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/Card';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Users, Clock, CheckCircle, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import DataTable from '@/components/ui/DataTable';

function WelcomeBanner() {
  const { userProfile } = useUserProfile();
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
            {greeting}, {userProfile.name.split(' ')[0]} 👋
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
  const stats = [
    { label: 'Assigned Groups', value: 4, trend: { value: 0, positive: true }, iconBg: 'bg-blue-50 text-blue-600', icon: <Users className="w-6 h-6" /> },
    { label: 'Pending Reviews', value: 6, trend: { value: 20, positive: false }, iconBg: 'bg-amber-50 text-amber-600', icon: <Clock className="w-6 h-6" /> },
    { label: 'Evaluations Done', value: 12, trend: { value: 8, positive: true }, iconBg: 'bg-emerald-50 text-emerald-600', icon: <CheckCircle className="w-6 h-6" /> },
    { label: 'Avg Score Given', value: '72', trend: { value: 3, positive: true }, iconBg: 'bg-violet-50 text-violet-600', icon: <Target className="w-6 h-6" /> },
  ];

  const groups = [
    { id: '1', name: 'Team Alpha', topic: 'AI Performance Prediction', status: 'in_progress', members: 4, pendingLogbooks: 2 },
    { id: '2', name: 'Team Beta', topic: 'Pending...', status: 'not_started', members: 3, pendingLogbooks: 0 },
    { id: '3', name: 'Team Delta', topic: 'IoT Smart Campus', status: 'in_progress', members: 4, pendingLogbooks: 1 },
    { id: '4', name: 'Team Epsilon', topic: 'Blockchain Certificates', status: 'submitted', members: 3, pendingLogbooks: 0 },
  ];

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
          <StatCard key={i} label={stat.label} value={stat.value} trend={stat.trend} icon={stat.icon} iconBg={stat.iconBg} delay={i} />
        ))}
      </div>

      <Card padding="none">
        <div className="flex items-center justify-between p-6 border-b border-cx-border-subtle">
          <h3 className="text-lg font-display font-semibold text-cx-text">Assigned Groups</h3>
          <span className="text-xs text-cx-text-secondary bg-cx-bg-muted px-2.5 py-1 rounded-full">{groups.length} groups</span>
        </div>
        <DataTable data={groups} columns={columns} className="border-none shadow-none rounded-none" />
      </Card>
    </DashboardLayout>
  );
}
