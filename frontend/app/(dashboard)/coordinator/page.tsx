'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/Card';
import Card from '@/components/ui/Card';

export default function CoordinatorDashboard() {
  const stats = [
    { label: 'Dept Groups', value: 15, trend: { value: 3, positive: true }, iconBg: 'bg-blue-50 text-blue-500', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg> },
    { label: 'Topics Pending', value: 4, trend: { value: -2, positive: true }, iconBg: 'bg-amber-50 text-amber-500', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg> },
    { label: 'At-Risk Groups', value: 2, trend: { value: 1, positive: false }, iconBg: 'bg-red-50 text-red-500', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg> },
    { label: 'Completion Rate', value: '68%', trend: { value: 5, positive: true }, iconBg: 'bg-emerald-50 text-emerald-500', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ];

  const kanbanGroups = {
    not_started: [{ name: 'Team Beta', members: 3 }],
    in_progress: [{ name: 'Team Alpha', members: 4 }, { name: 'Team Delta', members: 4 }],
    submitted: [{ name: 'Team Gamma', members: 3 }],
    evaluated: [{ name: 'Team Omega', members: 4 }],
  };

  const columns = [
    { key: 'not_started', label: 'Not Started', color: 'from-gray-400 to-gray-500', dotColor: 'bg-gray-400' },
    { key: 'in_progress', label: 'In Progress', color: 'from-blue-400 to-blue-500', dotColor: 'bg-blue-400' },
    { key: 'submitted', label: 'Submitted', color: 'from-amber-400 to-amber-500', dotColor: 'bg-amber-400' },
    { key: 'evaluated', label: 'Evaluated', color: 'from-emerald-400 to-emerald-500', dotColor: 'bg-emerald-400' },
  ];

  return (
    <DashboardLayout role="coordinator" title="Coordinator Dashboard" userName="Dr. Priya Nair">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => <StatCard key={i} label={s.label} value={s.value} trend={s.trend} icon={s.icon} iconBg={s.iconBg} delay={i} />)}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-display text-thunder">Group Status Board</h3>
          <div className="flex items-center gap-3">
            {columns.map(col => (
              <div key={col.key} className="flex items-center gap-1.5 text-xs text-slate">
                <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                {col.label}
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {columns.map(col => (
            <div key={col.key}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-1 h-5 rounded-full bg-gradient-to-b ${col.color}`} />
                <h4 className="text-sm font-semibold text-thunder">{col.label}</h4>
                <span className="text-xs bg-gray-100 text-slate px-1.5 py-0.5 rounded-md font-medium">
                  {(kanbanGroups as any)[col.key]?.length || 0}
                </span>
              </div>
              <div className="space-y-2">
                {((kanbanGroups as any)[col.key] || []).map((g: any, i: number) => (
                  <div key={i} className="p-3.5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-card transition-all cursor-pointer group">
                    <p className="text-sm font-semibold text-thunder group-hover:text-cardinal transition-colors">{g.name}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="flex -space-x-1">
                        {Array.from({ length: Math.min(g.members, 3) }).map((_, j) => (
                          <div key={j} className="w-5 h-5 rounded-full bg-gray-100 border border-white" />
                        ))}
                      </div>
                      <span className="text-xs text-slate">{g.members} members</span>
                    </div>
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
