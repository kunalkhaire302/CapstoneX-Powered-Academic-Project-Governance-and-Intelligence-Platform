'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { BookOpen, Check, Eye } from 'lucide-react';
import { useCurrentUser } from '@/lib/hooks';

export default function MentorLogbookReviewPage() {
  const user = useCurrentUser();
  
  const pending = [
    { id: '1', student: 'Student 1', group: 'Team Alpha', week: 8, title: 'Model Training & Evaluation', date: '2026-05-20' },
    { id: '2', student: 'Student 4', group: 'Team Alpha', week: 8, title: 'Frontend Integration', date: '2026-05-20' },
    { id: '3', student: 'Student 5', group: 'Team Delta', week: 7, title: 'IoT Sensor Calibration', date: '2026-05-15' },
  ];

  return (
    <DashboardLayout role="mentor" title="Logbook Review" userName={user?.name || 'Mentor'}>
      <PageHeader 
        title="Pending Logbooks" 
        description="Review and grade weekly logbook submissions from your assigned groups."
        badge={
          <Badge variant="warning">{pending.length} pending</Badge>
        }
      />

      {pending.length === 0 ? (
        <Card className="border-dashed border-2 bg-cx-bg-subtle shadow-none">
          <EmptyState 
            icon={<BookOpen className="w-8 h-8 text-cx-text-muted" />}
            title="All caught up!"
            description="There are no pending logbooks to review at this time."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {pending.map(entry => (
            <Card key={entry.id} hover>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono font-semibold bg-cx-bg-muted px-2 py-0.5 rounded border border-cx-border text-cx-text-secondary">Week {entry.week}</span>
                    <span className="text-xs text-cx-text-muted">•</span>
                    <span className="text-xs text-cx-text-secondary font-medium">{entry.group}</span>
                  </div>
                  <h3 className="text-base font-semibold text-cx-text">{entry.title}</h3>
                  <p className="text-xs text-cx-text-muted mt-1">Submitted by <span className="font-medium text-cx-text-secondary">{entry.student}</span> • {entry.date}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" icon={<Eye className="w-4 h-4" />}>Review</Button>
                  <Button size="sm" icon={<Check className="w-4 h-4" />}>Approve</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
