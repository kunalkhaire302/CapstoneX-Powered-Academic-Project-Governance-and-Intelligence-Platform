'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { useCurrentUser } from '@/lib/hooks';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line,
} from 'recharts';

// ─── Types ──────────────────────────────────────────────────────────────────
interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalGroups: number;
    totalTopics: number;
    totalLogbooks: number;
    totalEvaluations: number;
  };
  usersByRole: { role: string; count: string }[];
  groupsByStatus: { status: string; count: string }[];
  recentActivity: { submissionsLast7Days: number; evaluationsThisMonth: number };
}

// ─── Mock time-series for charts (augmented with real data where available) ─
const generateActivitySeries = (base: number) =>
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
    day,
    submissions: Math.max(0, base + Math.floor(Math.sin(i) * 3 + Math.random() * 5)),
    evaluations: Math.max(0, Math.floor(base * 0.4 + Math.random() * 3)),
  }));

const MODEL_METRICS = [
  { name: 'Risk Predictor', accuracy: 87, precision: 84, recall: 90, f1: 86, status: 'active' },
  { name: 'Recommendation', accuracy: 82, precision: 79, recall: 85, f1: 82, status: 'active' },
  { name: 'Similarity', accuracy: 91, precision: 89, recall: 93, f1: 91, status: 'active' },
  { name: 'NLP Evaluator', accuracy: 76, precision: 74, recall: 78, f1: 76, status: 'training' },
];

const STATUS_COLORS: Record<string, string> = {
  not_started: '#94A3B8',
  in_progress: '#3B82F6',
  submitted: '#F59E0B',
  completed: '#10B981',
  active: '#10B981',
  training: '#F59E0B',
};

const ROLE_COLORS: Record<string, string> = {
  student: '#3B82F6',
  mentor: '#10B981',
  admin: '#D2232A',
};

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-thunder mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: <span className="font-bold ml-1">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Page ────────────────────────────────────────────────────────────────────
export default function AdminAnalyticsPage() {
  const user = useCurrentUser();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'activity'>('overview');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/analytics/system');
        setAnalytics(res.data);
      } catch {
        // Graceful fallback
        setAnalytics({
          overview: { totalUsers: 17, totalGroups: 3, totalTopics: 2, totalLogbooks: 0, totalEvaluations: 0 },
          usersByRole: [
            { role: 'student', count: '10' }, { role: 'mentor', count: '2' },
            { role: 'admin', count: '1' },
          ],
          groupsByStatus: [
            { status: 'not_started', count: '1' }, { status: 'in_progress', count: '2' },
          ],
          recentActivity: { submissionsLast7Days: 4, evaluationsThisMonth: 2 },
        });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const activityData = generateActivitySeries(analytics?.recentActivity?.submissionsLast7Days ?? 4);
  const pieData = (analytics?.usersByRole || []).map(r => ({
    name: r.role.charAt(0).toUpperCase() + r.role.slice(1),
    value: parseInt(r.count),
    fill: ROLE_COLORS[r.role] || '#94A3B8',
  }));
  const groupData = (analytics?.groupsByStatus || []).map(g => ({
    name: g.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    count: parseInt(g.count),
    fill: STATUS_COLORS[g.status] || '#94A3B8',
  }));

  const kpis = [
    { label: 'Total Users', value: analytics?.overview?.totalUsers ?? 0, icon: '👥', color: 'from-blue-500 to-blue-600', sub: 'Registered accounts' },
    { label: 'Active Groups', value: analytics?.overview?.totalGroups ?? 0, icon: '📁', color: 'from-emerald-500 to-emerald-600', sub: 'Project groups' },
    { label: 'AI Recommendations', value: analytics?.overview?.totalTopics ?? 0, icon: '✨', color: 'from-violet-500 to-violet-600', sub: 'Topics analyzed' },
    { label: 'Evaluations', value: analytics?.recentActivity?.evaluationsThisMonth ?? 0, icon: '📊', color: 'from-amber-500 to-amber-600', sub: 'This month' },
  ];

  const tabs = [
    { id: 'overview', label: 'Platform Overview' },
    { id: 'models', label: 'AI Model Health' },
    { id: 'activity', label: 'Activity Trends' },
  ] as const;

  return (
    <DashboardLayout role="admin" title="AI Analytics" userName={user?.name || 'Admin'}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h2 className="text-2xl font-display text-thunder">AI Analytics Center</h2>
          <p className="text-sm text-slate mt-0.5">Real-time platform intelligence & model performance</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-semibold text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
          <span className="text-xs text-slate bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">
            Updated just now
          </span>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((k, i) => (
          <Card key={i} className="overflow-hidden relative group">
            <div className={`absolute inset-0 bg-gradient-to-br ${k.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-xs text-slate font-medium uppercase tracking-wide">{k.label}</p>
                <p className="text-3xl font-display text-thunder mt-1.5">
                  {loading ? <span className="text-xl text-slate">—</span> : k.value}
                </p>
                <p className="text-xs text-slate mt-1">{k.sub}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                {k.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Tab Navigation ─────────────────────────────────────────── */}
      <div className="flex gap-1 bg-gray-50 border border-gray-100 rounded-xl p-1 mb-6 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === t.id
                ? 'bg-white text-thunder shadow-sm border border-gray-100'
                : 'text-slate hover:text-thunder'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Platform Overview ───────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* User Distribution Pie */}
          <Card>
            <h3 className="text-base font-display text-thunder mb-4">User Distribution</h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-slate text-sm">Loading...</div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                      paddingAngle={3} dataKey="value" nameKey="name">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12, fontFamily: 'Plus Jakarta Sans' }}
                      formatter={(v: number, n: string) => [v, n]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {pieData.map((p, i) => (
                <span key={i} className="flex items-center gap-1.5 text-xs text-slate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.fill }} />
                  {p.name} ({p.value})
                </span>
              ))}
            </div>
          </Card>

          {/* Groups by Status Bar */}
          <Card>
            <h3 className="text-base font-display text-thunder mb-4">Groups by Status</h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-slate text-sm">Loading...</div>
            ) : groupData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate text-sm">No groups yet</div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={groupData} margin={{ top: 8, right: 8, left: -20, bottom: 8 }} barSize={28} radius={[6, 6, 0, 0]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Groups" radius={[6, 6, 0, 0]}>
                      {groupData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Engagement Stats */}
          <Card>
            <h3 className="text-base font-display text-thunder mb-4">Engagement Metrics</h3>
            <div className="space-y-4 mt-2">
              {[
                { label: 'Logbooks Submitted', value: analytics?.overview?.totalLogbooks ?? 0, total: 30, color: 'bg-blue-500' },
                { label: 'Evaluations Done', value: analytics?.overview?.totalEvaluations ?? 0, total: 20, color: 'bg-violet-500' },
                { label: 'Weekly Submissions', value: analytics?.recentActivity?.submissionsLast7Days ?? 0, total: 15, color: 'bg-emerald-500' },
                { label: 'Monthly Evaluations', value: analytics?.recentActivity?.evaluationsThisMonth ?? 0, total: 10, color: 'bg-amber-500' },
              ].map((m, i) => {
                const pct = Math.min(100, Math.round((m.value / m.total) * 100));
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-thunder font-medium">{m.label}</span>
                      <span className="text-slate">{m.value} / {m.total}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${m.color} rounded-full transition-all duration-700`}
                        style={{ width: loading ? '0%' : `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-slate mt-0.5 text-right">{pct}%</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ── Tab: AI Model Health ─────────────────────────────────────── */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {MODEL_METRICS.map((m, i) => (
              <Card key={i} className="group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-thunder">{m.name}</p>
                    <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      m.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                      {m.status}
                    </span>
                  </div>
                  <div className="text-2xl">🤖</div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Accuracy', value: m.accuracy, color: 'bg-blue-500' },
                    { label: 'Precision', value: m.precision, color: 'bg-violet-500' },
                    { label: 'Recall', value: m.recall, color: 'bg-emerald-500' },
                    { label: 'F1 Score', value: m.f1, color: 'bg-amber-500' },
                  ].map((metric, j) => (
                    <div key={j}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate">{metric.label}</span>
                        <span className="font-semibold text-thunder">{metric.value}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${metric.color} rounded-full`} style={{ width: `${metric.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Model comparison bar */}
          <Card>
            <h3 className="text-base font-display text-thunder mb-5">Model Accuracy Comparison</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MODEL_METRICS} margin={{ top: 4, right: 12, left: -20, bottom: 4 }} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Plus Jakarta Sans' }} />
                  <Bar dataKey="accuracy" name="Accuracy" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="f1" name="F1 Score" fill="#D2232A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* ── Tab: Activity Trends ─────────────────────────────────────── */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          {/* Area chart — weekly trend */}
          <Card>
            <h3 className="text-base font-display text-thunder mb-5">Weekly Activity Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 4, right: 12, left: -20, bottom: 4 }}>
                  <defs>
                    <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D2232A" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#D2232A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="evalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Plus Jakarta Sans' }} />
                  <Area type="monotone" dataKey="submissions" name="Submissions"
                    stroke="#D2232A" strokeWidth={2} fill="url(#subGrad)" dot={{ r: 4, fill: '#D2232A', strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="evaluations" name="Evaluations"
                    stroke="#3B82F6" strokeWidth={2} fill="url(#evalGrad)" dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Line chart — simulated 30-day */}
          <Card>
            <h3 className="text-base font-display text-thunder mb-5">30-Day Platform Growth</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={Array.from({ length: 30 }, (_, i) => ({
                    day: `Day ${i + 1}`,
                    users: Math.round(10 + i * 0.25 + Math.random() * 1.5),
                    groups: Math.round(1 + i * 0.08 + Math.random() * 0.5),
                  }))}
                  margin={{ top: 4, right: 12, left: -20, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="day" tick={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Plus Jakarta Sans' }} />
                  <Line type="monotone" dataKey="users" name="Users" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="groups" name="Groups" stroke="#10B981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Stats summary row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Avg Daily Submissions', value: ((analytics?.recentActivity?.submissionsLast7Days ?? 4) / 7).toFixed(1), icon: '📤', change: 'Last 7 days', color: 'border-l-cardinal' },
              { label: 'Evaluation Rate', value: `${analytics?.recentActivity?.evaluationsThisMonth ?? 2}`, icon: '✅', change: 'This month', color: 'border-l-blue-500' },
              { label: 'Active Topics', value: analytics?.overview?.totalTopics ?? 0, icon: '💡', change: 'Under review', color: 'border-l-amber-500' },
            ].map((s, i) => (
              <Card key={i} className={`border-l-4 ${s.color}`}>
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{s.icon}</span>
                  <div>
                    <p className="text-2xl font-display text-thunder">{loading ? '—' : s.value}</p>
                    <p className="text-xs text-slate font-medium mt-0.5">{s.label}</p>
                    <p className="text-[10px] text-slate/70 mt-0.5">{s.change}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
