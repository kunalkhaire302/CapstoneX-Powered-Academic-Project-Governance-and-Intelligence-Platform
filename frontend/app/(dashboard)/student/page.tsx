'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/Card';
import Card from '@/components/ui/Card';
import Badge, { StatusBadge } from '@/components/ui/Badge';

export default function StudentDashboard() {
  // In production, these would come from React Query hooks
  const stats = [
    { label: 'Groups Joined', value: 1, trend: { value: 0, positive: true } },
    { label: 'Logbooks Submitted', value: 8, trend: { value: 15, positive: true } },
    { label: 'Pending Evaluations', value: 2, trend: { value: -10, positive: false } },
    { label: 'Overall Score', value: '78%', trend: { value: 5, positive: true } },
  ];

  const recentActivity = [
    { id: 1, action: 'Logbook Week 8 submitted', time: '2 hours ago', type: 'submission' },
    { id: 2, action: 'Mentor approved Logbook Week 7', time: '1 day ago', type: 'feedback' },
    { id: 3, action: 'Topic approved by coordinator', time: '3 days ago', type: 'approval' },
    { id: 4, action: 'Group "Team Alpha" created', time: '1 week ago', type: 'system' },
  ];

  const recommendations = [
    { domain: 'Machine Learning & AI', score: 0.92, reason: 'Matches your Python and TensorFlow skills' },
    { domain: 'Data Science & Analytics', score: 0.85, reason: 'Strong alignment with your analytical interests' },
    { domain: 'Natural Language Processing', score: 0.78, reason: 'Your NLP coursework is a great foundation' },
  ];

  return (
    <DashboardLayout role="student" title="Student Dashboard" userName="Student 1">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <StatCard key={i} label={stat.label} value={stat.value} trend={stat.trend} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-lg font-display text-thunder mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-md hover:bg-surface transition-colors">
                  <div className={`w-2 h-2 rounded-full ${
                    item.type === 'submission' ? 'bg-blue-500' :
                    item.type === 'feedback' ? 'bg-green-500' :
                    item.type === 'approval' ? 'bg-emerald-500' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-thunder">{item.action}</p>
                    <p className="text-xs text-slate">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AI Recommendations */}
        <div>
          <Card>
            <h3 className="text-lg font-display text-thunder mb-4">AI Recommendations</h3>
            <p className="text-xs text-slate mb-4">Project domains matching your profile</p>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="p-3 rounded-md border border-border hover:border-cardinal/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-thunder">{rec.domain}</p>
                    <Badge variant="success">{Math.round(rec.score * 100)}%</Badge>
                  </div>
                  <p className="text-xs text-slate">{rec.reason}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-sm text-cardinal font-medium hover:text-cardinal-hover transition-colors" id="get-recommendations">
              Get More Recommendations →
            </button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
