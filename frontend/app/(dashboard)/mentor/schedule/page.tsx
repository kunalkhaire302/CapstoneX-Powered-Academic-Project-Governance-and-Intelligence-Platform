'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';

export default function MentorSchedulePage() {
  const schedule = [
    { day: 'Monday', time: '10:00 AM', group: 'Team Alpha', type: 'Weekly Sync', location: 'Room 302' },
    { day: 'Tuesday', time: '2:00 PM', group: 'Team Beta', type: 'Topic Discussion', location: 'Online - Zoom' },
    { day: 'Wednesday', time: '11:00 AM', group: 'Team Delta', type: 'Progress Review', location: 'Room 205' },
    { day: 'Thursday', time: '3:00 PM', group: 'Team Epsilon', type: 'Final Review', location: 'Room 302' },
  ];

  return (
    <DashboardLayout role="mentor" title="Schedule" userName="Prof. Anita Sharma">
      <div className="space-y-3">
        {schedule.map((s, i) => (
          <Card key={i}>
            <div className="flex items-center gap-6">
              <div className="w-24 text-center">
                <p className="text-sm font-display text-cardinal">{s.day}</p>
                <p className="text-xs text-slate">{s.time}</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex-1">
                <p className="text-sm font-medium text-thunder">{s.group} — {s.type}</p>
                <p className="text-xs text-slate mt-0.5">📍 {s.location}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
