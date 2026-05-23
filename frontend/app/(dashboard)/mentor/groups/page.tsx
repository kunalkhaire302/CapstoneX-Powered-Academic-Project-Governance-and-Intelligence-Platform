'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';

export default function MentorGroupsPage() {
  const groups = [
    { id: '1', name: 'Team Alpha', topic: 'AI Performance Prediction', members: 4, status: 'in_progress' },
    { id: '2', name: 'Team Beta', topic: 'Pending...', members: 3, status: 'not_started' },
    { id: '3', name: 'Team Delta', topic: 'IoT Smart Campus', members: 4, status: 'in_progress' },
    { id: '4', name: 'Team Epsilon', topic: 'Blockchain Certificates', members: 3, status: 'submitted' },
  ];

  return (
    <DashboardLayout role="mentor" title="My Groups" userName="Prof. Anita Sharma">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map(g => (
          <Card key={g.id} className="hover:shadow-elevated transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-display text-thunder">{g.name}</h3>
              <StatusBadge status={g.status} />
            </div>
            <p className="text-sm text-slate mb-3">{g.topic}</p>
            <div className="flex items-center gap-1">
              {Array.from({ length: g.members }).map((_, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-cardinal-light flex items-center justify-center text-xs font-medium text-cardinal">
                  S{i + 1}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
