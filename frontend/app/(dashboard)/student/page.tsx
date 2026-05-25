'use client';

import DashboardLayout, { useUserProfile } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/Card';
import Card from '@/components/ui/Card';
import Badge, { StatusBadge } from '@/components/ui/Badge';

export default function StudentDashboard() {
  const { userProfile } = useUserProfile();
  const stats = [
    { label: 'Groups Joined', value: 1, trend: { value: 0, positive: true }, iconBg: 'bg-blue-50 text-blue-500', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg> },
    { label: 'Logbooks Submitted', value: 8, trend: { value: 15, positive: true }, iconBg: 'bg-emerald-50 text-emerald-500', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg> },
    { label: 'Pending Evaluations', value: 2, trend: { value: -10, positive: false }, iconBg: 'bg-amber-50 text-amber-500', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'Overall Score', value: '78%', trend: { value: 5, positive: true }, iconBg: 'bg-violet-50 text-violet-500', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg> },
  ];

  const recentActivity = [
    { id: 1, action: 'Logbook Week 8 submitted', time: '2 hours ago', type: 'submission', icon: '📤' },
    { id: 2, action: 'Mentor approved Logbook Week 7', time: '1 day ago', type: 'feedback', icon: '✅' },
    { id: 3, action: 'Topic approved by coordinator', time: '3 days ago', type: 'approval', icon: '🎯' },
    { id: 4, action: 'Group "Team Alpha" created', time: '1 week ago', type: 'system', icon: '👥' },
  ];

  const recommendations = [
    { domain: 'Machine Learning & AI', score: 0.92, reason: 'Matches your Python and TensorFlow skills' },
    { domain: 'Data Science & Analytics', score: 0.85, reason: 'Strong alignment with your analytical interests' },
    { domain: 'Natural Language Processing', score: 0.78, reason: 'Your NLP coursework is a great foundation' },
  ];

  return (
    <DashboardLayout role="student" title="Student Dashboard" userName={userProfile.name}>
      {/* Welcome Banner */}
      <div className="mb-8 bg-gradient-to-r from-[#0F172A] via-[#1a2744] to-[#0F172A] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cardinal/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <p className="text-white/50 text-sm mb-1">Welcome back,</p>
          <h2 className="text-2xl font-display mb-2">{userProfile.name} 👋</h2>
          <p className="text-white/40 text-sm">Your capstone journey is progressing well. Keep up the great work!</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <StatCard key={i} label={stat.label} value={stat.value} trend={stat.trend} icon={stat.icon} iconBg={stat.iconBg} delay={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-display text-thunder">Recent Activity</h3>
              <span className="text-xs text-slate bg-gray-50 px-2.5 py-1 rounded-full">Last 7 days</span>
            </div>
            <div className="space-y-1">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-thunder">{item.action}</p>
                    <p className="text-xs text-slate">{item.time}</p>
                  </div>
                  <svg className="w-4 h-4 text-slate/30 group-hover:text-slate transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AI Recommendations */}
        <div>
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-display text-thunder">AI Recommendations</h3>
              <span className="text-xs bg-cardinal-50 text-cardinal px-2 py-0.5 rounded-full font-semibold">AI</span>
            </div>
            <p className="text-xs text-slate mb-5">Project domains matching your profile</p>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-gray-100 hover:border-cardinal/20 hover:bg-cardinal-50/30 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-thunder">{rec.domain}</p>
                    <Badge variant="success">{Math.round(rec.score * 100)}%</Badge>
                  </div>
                  {/* Score bar */}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mb-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700" style={{ width: `${rec.score * 100}%` }} />
                  </div>
                  <p className="text-xs text-slate">{rec.reason}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-sm text-cardinal font-semibold hover:text-cardinal-hover transition-colors flex items-center justify-center gap-1 py-2 rounded-lg hover:bg-cardinal-50" id="get-recommendations">
              Get More Recommendations
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
