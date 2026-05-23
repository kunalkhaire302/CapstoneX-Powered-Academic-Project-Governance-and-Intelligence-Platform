'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/Card';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';

export default function MentorDashboard() {
  const stats = [
    { label: 'Assigned Groups', value: 4, trend: { value: 0, positive: true } },
    { label: 'Pending Reviews', value: 6, trend: { value: 20, positive: false } },
    { label: 'Evaluations Done', value: 12, trend: { value: 8, positive: true } },
    { label: 'Avg Score Given', value: '72', trend: { value: 3, positive: true } },
  ];

  const groups = [
    { id: '1', name: 'Team Alpha', topic: 'AI Performance Prediction', status: 'in_progress', members: 4, pendingLogbooks: 2 },
    { id: '2', name: 'Team Beta', topic: 'Pending...', status: 'not_started', members: 3, pendingLogbooks: 0 },
    { id: '3', name: 'Team Delta', topic: 'IoT Smart Campus', status: 'in_progress', members: 4, pendingLogbooks: 1 },
    { id: '4', name: 'Team Epsilon', topic: 'Blockchain Certificates', status: 'submitted', members: 3, pendingLogbooks: 0 },
  ];

  return (
    <DashboardLayout role="mentor" title="Mentor Dashboard" userName="Prof. Anita Sharma">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <StatCard key={i} label={stat.label} value={stat.value} trend={stat.trend} />
        ))}
      </div>

      <Card>
        <h3 className="text-lg font-display text-thunder mb-4">Assigned Groups</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-slate font-medium">Group</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Topic</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Members</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Status</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Pending</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.id} className="border-b border-border last:border-0 table-row-alt hover:bg-surface transition-colors cursor-pointer">
                  <td className="py-3 px-4 font-medium text-thunder">{group.name}</td>
                  <td className="py-3 px-4 text-slate">{group.topic}</td>
                  <td className="py-3 px-4">{group.members}</td>
                  <td className="py-3 px-4"><StatusBadge status={group.status} /></td>
                  <td className="py-3 px-4">
                    {group.pendingLogbooks > 0 ? (
                      <span className="badge-warning badge">{group.pendingLogbooks} logbooks</span>
                    ) : (
                      <span className="text-slate text-xs">All reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
