'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';

export default function CoordinatorReportsPage() {
  const reports = [
    { title: 'Department Progress Report', description: 'Overall group progress, submission rates, and completion metrics', type: 'PDF' },
    { title: 'Student Marks Summary', description: 'Aggregated evaluation scores across all groups', type: 'Excel' },
    { title: 'Risk Analysis Report', description: 'AI-generated risk assessments with feature importance', type: 'PDF' },
    { title: 'Mentor Activity Report', description: 'Mentor feedback frequency, review times, and coverage', type: 'Excel' },
  ];

  return (
    <DashboardLayout role="coordinator" title="Reports" userName="Dr. Priya Nair">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r, i) => (
          <Card key={i} className="hover:shadow-elevated transition-shadow cursor-pointer">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold ${r.type === 'PDF' ? 'bg-red-500' : 'bg-green-600'}`}>
                {r.type}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-thunder">{r.title}</h3>
                <p className="text-xs text-slate mt-1">{r.description}</p>
                <button className="text-xs text-cardinal hover:text-cardinal-hover font-medium mt-2">Download →</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
