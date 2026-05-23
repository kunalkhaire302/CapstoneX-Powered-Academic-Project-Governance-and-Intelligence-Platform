'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/Card';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';

export default function CoordinatorDashboard() {
  const stats = [
    { label: 'Dept Groups', value: 15, trend: { value: 3, positive: true } },
    { label: 'Topics Pending', value: 4, trend: { value: -2, positive: true } },
    { label: 'At-Risk Groups', value: 2, trend: { value: 1, positive: false } },
    { label: 'Completion Rate', value: '68%', trend: { value: 5, positive: true } },
  ];

  const kanbanGroups = {
    not_started: [{ name: 'Team Beta', members: 3 }],
    in_progress: [{ name: 'Team Alpha', members: 4 }, { name: 'Team Delta', members: 4 }],
    submitted: [{ name: 'Team Gamma', members: 3 }],
    evaluated: [{ name: 'Team Omega', members: 4 }],
  };

  const columns = [
    { key: 'not_started', label: 'Not Started', color: 'border-gray-300' },
    { key: 'in_progress', label: 'In Progress', color: 'border-blue-400' },
    { key: 'submitted', label: 'Submitted', color: 'border-yellow-400' },
    { key: 'evaluated', label: 'Evaluated', color: 'border-green-400' },
  ];

  return (
    <DashboardLayout role="coordinator" title="Coordinator Dashboard" userName="Dr. Priya Nair">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => <StatCard key={i} label={s.label} value={s.value} trend={s.trend} />)}
      </div>

      <Card>
        <h3 className="text-lg font-display text-thunder mb-4">Group Status Board</h3>
        <div className="grid grid-cols-4 gap-4">
          {columns.map(col => (
            <div key={col.key} className={`border-t-2 ${col.color} pt-3`}>
              <h4 className="text-sm font-medium text-slate mb-3">{col.label}
                <span className="ml-2 text-xs bg-surface px-1.5 py-0.5 rounded">
                  {(kanbanGroups as any)[col.key]?.length || 0}
                </span>
              </h4>
              <div className="space-y-2">
                {((kanbanGroups as any)[col.key] || []).map((g: any, i: number) => (
                  <div key={i} className="p-3 bg-surface rounded-md border border-border hover:shadow-card transition-all cursor-pointer">
                    <p className="text-sm font-medium text-thunder">{g.name}</p>
                    <p className="text-xs text-slate mt-1">{g.members} members</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
}
