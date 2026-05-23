'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function StudentMarksPage() {
  const evaluations = [
    { type: 'Mid-Term', score: 32, maxScore: 40, date: '2024-02-20' },
    { type: 'Presentation', score: 18, maxScore: 20, date: '2024-03-05' },
    { type: 'Report', score: 14, maxScore: 20, date: '2024-03-10' },
    { type: 'Final Viva', score: null, maxScore: 20, date: 'Pending' },
  ];

  const totalEarned = evaluations.reduce((sum, e) => sum + (e.score || 0), 0);
  const totalMax = evaluations.reduce((sum, e) => sum + e.maxScore, 0);

  return (
    <DashboardLayout role="student" title="Marks Tracker" userName="Student 1">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <p className="text-sm text-slate">Total Score</p>
          <p className="text-3xl font-display text-thunder mt-1">{totalEarned}<span className="text-lg text-slate">/{totalMax}</span></p>
        </Card>
        <Card>
          <p className="text-sm text-slate">Percentage</p>
          <p className="text-3xl font-display text-thunder mt-1">{Math.round((totalEarned / totalMax) * 100)}%</p>
        </Card>
        <Card>
          <p className="text-sm text-slate">Evaluations</p>
          <p className="text-3xl font-display text-thunder mt-1">{evaluations.filter(e => e.score !== null).length}/{evaluations.length}</p>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-display text-thunder mb-4">Evaluation Breakdown</h3>
        <div className="space-y-4">
          {evaluations.map((ev, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-thunder">{ev.type}</div>
              <div className="flex-1">
                <div className="h-3 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cardinal rounded-full transition-all duration-500"
                    style={{ width: ev.score !== null ? `${(ev.score / ev.maxScore) * 100}%` : '0%' }}
                  />
                </div>
              </div>
              <div className="w-24 text-right text-sm">
                {ev.score !== null ? (
                  <span className="text-thunder font-medium">{ev.score}/{ev.maxScore}</span>
                ) : (
                  <span className="text-slate italic">Pending</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
}
