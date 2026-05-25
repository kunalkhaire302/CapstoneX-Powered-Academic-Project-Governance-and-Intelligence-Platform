'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/Card';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';

export default function MentorDashboard() {
  const stats = [
    { label: 'Assigned Groups', value: 4, trend: { value: 0, positive: true }, iconBg: 'bg-blue-50 text-blue-500', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg> },
    { label: 'Pending Reviews', value: 6, trend: { value: 20, positive: false }, iconBg: 'bg-amber-50 text-amber-500', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'Evaluations Done', value: 12, trend: { value: 8, positive: true }, iconBg: 'bg-emerald-50 text-emerald-500', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'Avg Score Given', value: '72', trend: { value: 3, positive: true }, iconBg: 'bg-violet-50 text-violet-500', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" /></svg> },
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
          <StatCard key={i} label={stat.label} value={stat.value} trend={stat.trend} icon={stat.icon} iconBg={stat.iconBg} delay={i} />
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-display text-thunder">Assigned Groups</h3>
          <span className="text-xs text-slate bg-gray-50 px-2.5 py-1 rounded-full">{groups.length} groups</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-slate font-semibold text-xs uppercase tracking-wider">Group</th>
                <th className="text-left py-3 px-4 text-slate font-semibold text-xs uppercase tracking-wider">Topic</th>
                <th className="text-left py-3 px-4 text-slate font-semibold text-xs uppercase tracking-wider">Members</th>
                <th className="text-left py-3 px-4 text-slate font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-slate font-semibold text-xs uppercase tracking-wider">Pending</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-thunder group-hover:text-cardinal transition-colors">{group.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate">{group.topic}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex -space-x-1.5">
                      {Array.from({ length: Math.min(group.members, 3) }).map((_, j) => (
                        <div key={j} className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate">
                          {String.fromCharCode(65 + j)}
                        </div>
                      ))}
                      {group.members > 3 && <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[9px] text-slate">+{group.members - 3}</div>}
                    </div>
                  </td>
                  <td className="py-3.5 px-4"><StatusBadge status={group.status} /></td>
                  <td className="py-3.5 px-4">
                    {group.pendingLogbooks > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {group.pendingLogbooks} logbooks
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        All reviewed
                      </span>
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
