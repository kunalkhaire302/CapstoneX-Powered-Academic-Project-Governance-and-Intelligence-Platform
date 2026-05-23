'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';

export default function CoordinatorGroupsPage() {
  const groups = [
    { id: '1', name: 'Team Alpha', mentor: 'Prof. Anita Sharma', topic: 'AI Performance Prediction', members: 4, status: 'in_progress' },
    { id: '2', name: 'Team Beta', mentor: 'Prof. Vikram Patel', topic: 'Pending...', members: 3, status: 'not_started' },
    { id: '3', name: 'Team Gamma', mentor: 'Prof. Anita Sharma', topic: 'E-Commerce Analytics', members: 3, status: 'submitted' },
    { id: '4', name: 'Team Delta', mentor: 'Prof. Vikram Patel', topic: 'IoT Smart Campus', members: 4, status: 'in_progress' },
  ];

  return (
    <DashboardLayout role="coordinator" title="Department Groups" userName="Dr. Priya Nair">
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-slate font-medium">Group</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Mentor</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Topic</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Members</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(g => (
                <tr key={g.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors cursor-pointer">
                  <td className="py-3 px-4 font-medium text-thunder">{g.name}</td>
                  <td className="py-3 px-4 text-slate">{g.mentor}</td>
                  <td className="py-3 px-4 text-slate">{g.topic}</td>
                  <td className="py-3 px-4">{g.members}</td>
                  <td className="py-3 px-4"><StatusBadge status={g.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
