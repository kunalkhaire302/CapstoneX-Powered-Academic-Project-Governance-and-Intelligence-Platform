'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function MentorLogbookReviewPage() {
  const pending = [
    { id: '1', student: 'Student 1', group: 'Team Alpha', week: 8, title: 'Model Training & Evaluation', date: '2026-05-20' },
    { id: '2', student: 'Student 4', group: 'Team Alpha', week: 8, title: 'Frontend Integration', date: '2026-05-20' },
    { id: '3', student: 'Student 5', group: 'Team Delta', week: 7, title: 'IoT Sensor Calibration', date: '2026-05-15' },
  ];

  return (
    <DashboardLayout role="mentor" title="Logbook Review" userName="Prof. Anita Sharma">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display text-thunder">Pending Reviews</h2>
        <Badge variant="warning">{pending.length} pending</Badge>
      </div>
      <div className="space-y-4">
        {pending.map(entry => (
          <Card key={entry.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono bg-surface px-2 py-0.5 rounded text-slate">Week {entry.week}</span>
                  <span className="text-xs text-slate">• {entry.group}</span>
                </div>
                <h3 className="text-base font-medium text-thunder">{entry.title}</h3>
                <p className="text-xs text-slate mt-1">By {entry.student} • {entry.date}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary">View</Button>
                <Button size="sm">Approve</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
