'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { useCurrentUser } from '@/lib/hooks';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function StudentMarksPage() {
  const user = useCurrentUser();
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        setLoading(true);
        // By default, backend listEvaluations returns student's own marks if they are logged in
        const res = await api.get('/evaluations');
        setEvaluations(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch marks", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchMarks();
  }, [user]);

  // Aggregate standard types to show what's pending
  const expectedTypes = ['Proposal', 'Mid-Term', 'Presentation', 'Final'];
  
  // Merge live evaluations with expected placeholders
  const displayEvaluations = expectedTypes.map(type => {
    const found = evaluations.find(e => e.type === type);
    if (found) {
      return { type, score: parseFloat(found.total_score), maxScore: parseFloat(found.max_score), date: new Date(found.submitted_at).toLocaleDateString() };
    }
    return { type, score: null, maxScore: 100, date: 'Pending' };
  });

  // Include any extra evaluations that aren't in the standard types
  evaluations.forEach(ev => {
    if (!expectedTypes.includes(ev.type)) {
      displayEvaluations.push({
        type: ev.type,
        score: parseFloat(ev.total_score),
        maxScore: parseFloat(ev.max_score),
        date: new Date(ev.submitted_at).toLocaleDateString()
      });
    }
  });

  const totalEarned = displayEvaluations.reduce((sum, e) => sum + (e.score || 0), 0);
  const totalMax = displayEvaluations.reduce((sum, e) => sum + (e.score !== null ? e.maxScore : 0), 0); // Only sum max for graded
  const percentage = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;
  const completedCount = displayEvaluations.filter(e => e.score !== null).length;

  return (
    <DashboardLayout role="student" title="Marks Tracker" userName={user?.name || 'Student'}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <p className="text-sm text-slate">Total Score</p>
          <p className="text-3xl font-display text-thunder mt-1">
            {loading ? '...' : totalEarned}
            <span className="text-lg text-slate">/{totalMax || 0}</span>
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate">Percentage (Graded)</p>
          <p className="text-3xl font-display text-thunder mt-1">
            {loading ? '...' : `${percentage}%`}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate">Evaluations Completed</p>
          <p className="text-3xl font-display text-thunder mt-1">
            {loading ? '...' : `${completedCount}/${displayEvaluations.length}`}
          </p>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-display text-thunder mb-4">Evaluation Breakdown</h3>
        {loading ? (
          <p className="text-slate">Loading marks...</p>
        ) : (
          <div className="space-y-4">
            {displayEvaluations.map((ev, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium text-thunder">{ev.type}</div>
                <div className="flex-1">
                  <div className="h-3 bg-surface rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${ev.score !== null && (ev.score/ev.maxScore) >= 0.5 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: ev.score !== null ? `${(ev.score / ev.maxScore) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
                <div className="w-32 text-right text-sm">
                  {ev.score !== null ? (
                    <span className="text-thunder font-medium">{ev.score}/{ev.maxScore}</span>
                  ) : (
                    <span className="text-slate italic">Pending</span>
                  )}
                  <p className="text-xs text-slate mt-0.5">{ev.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
