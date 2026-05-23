'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function CoordinatorRiskPage() {
  const groups = [
    { name: 'Team Alpha', risk: 'low', score: 0.82, reason: 'Regular submissions, active participation' },
    { name: 'Team Beta', risk: 'high', score: 0.34, reason: 'Missing 3 logbooks, low mentor feedback score' },
    { name: 'Team Gamma', risk: 'medium', score: 0.58, reason: 'Occasional delays, average engagement' },
    { name: 'Team Delta', risk: 'low', score: 0.78, reason: 'Consistent progress, good communication' },
  ];

  const riskColors: Record<string, 'success' | 'warning' | 'error'> = { low: 'success', medium: 'warning', high: 'error' };

  return (
    <DashboardLayout role="coordinator" title="Risk Dashboard" userName="Dr. Priya Nair">
      <div className="space-y-4">
        {groups.map((g, i) => (
          <Card key={i}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 text-center">
                  <p className="text-xl font-display text-thunder">{Math.round(g.score * 100)}</p>
                  <p className="text-[10px] text-slate">Score</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <h3 className="text-sm font-medium text-thunder">{g.name}</h3>
                  <p className="text-xs text-slate mt-0.5">{g.reason}</p>
                </div>
              </div>
              <Badge variant={riskColors[g.risk]}>{g.risk.toUpperCase()} RISK</Badge>
            </div>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
