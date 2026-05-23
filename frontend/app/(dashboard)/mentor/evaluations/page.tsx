'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function MentorEvaluationsPage() {
  const evaluations = [
    { id: '1', group: 'Team Alpha', type: 'Mid-Term', status: 'completed', score: 32, maxScore: 40, date: '2026-03-15' },
    { id: '2', group: 'Team Beta', type: 'Mid-Term', status: 'pending', score: null, maxScore: 40, date: 'Pending' },
    { id: '3', group: 'Team Delta', type: 'Mid-Term', status: 'completed', score: 28, maxScore: 40, date: '2026-03-14' },
    { id: '4', group: 'Team Epsilon', type: 'Presentation', status: 'pending', score: null, maxScore: 20, date: 'Pending' },
  ];

  return (
    <DashboardLayout role="mentor" title="Evaluations" userName="Prof. Anita Sharma">
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-slate font-medium">Group</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Type</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Score</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Status</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Date</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map(ev => (
                <tr key={ev.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                  <td className="py-3 px-4 font-medium text-thunder">{ev.group}</td>
                  <td className="py-3 px-4 text-slate">{ev.type}</td>
                  <td className="py-3 px-4">{ev.score !== null ? `${ev.score}/${ev.maxScore}` : <span className="text-slate italic">—</span>}</td>
                  <td className="py-3 px-4"><Badge variant={ev.status === 'completed' ? 'success' : 'warning'}>{ev.status}</Badge></td>
                  <td className="py-3 px-4 text-slate">{ev.date}</td>
                  <td className="py-3 px-4">
                    <Button size="sm" variant={ev.status === 'pending' ? 'primary' : 'secondary'}>
                      {ev.status === 'pending' ? 'Evaluate' : 'View'}
                    </Button>
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
