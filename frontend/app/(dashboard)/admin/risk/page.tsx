'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useCurrentUser } from '@/lib/hooks';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface GroupRisk {
  id: string; 
  name: string; 
  status: string; 
  department: string;
  risk: 'low' | 'medium' | 'high'; 
  score: number;
  submissionRate?: number;
  avgDaysLate?: number;
  feedbackScore?: number;
  logins7d?: number;
}

export default function AdminRiskPage() {
  const user = useCurrentUser();
  const [groups, setGroups] = useState<GroupRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'score' | 'name'>('score');

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        setLoading(true);
        // Try the actual AI risk scores endpoint
        const res = await api.get('/ai/risk-scores');
        const dbScores = res.data.data || [];
        
        // Stored scores are the only source of truth for risk. Group data supplies labels only.
        const groupsRes = await api.get('/groups');
        const rawGroups = groupsRes.data.data || [];

        if (dbScores.length > 0) {
           const riskGroups = dbScores.map((rs: any) => {
             const group = rawGroups.find((g: any) => g.id === rs.group_id);
             return {
               id: rs.group_id,
               name: group ? group.name : 'Group record unavailable',
               status: group ? group.status : 'unknown',
               department: group?.department || '',
               risk: rs.label || 'medium',
               score: Number(rs.score),
               submissionRate: rs.features_json?.submissionRate,
               avgDaysLate: rs.features_json?.avgDaysLate,
               feedbackScore: rs.features_json?.feedbackScore,
               logins7d: rs.features_json?.logins7d
             };
           });
           setGroups(riskGroups);
           return;
        }

        setGroups([]);
      } catch (error) {
        console.error("Failed to fetch risk data", error);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchRisk();
  }, [user]);

  const sorted = [...groups].sort((a, b) => sortBy === 'score' ? a.score - b.score : a.name.localeCompare(b.name));
  const riskColors: Record<string, 'success' | 'warning' | 'error'> = { low: 'success', medium: 'warning', high: 'error' };
  const counts = { low: groups.filter(g => g.risk === 'low').length, medium: groups.filter(g => g.risk === 'medium').length, high: groups.filter(g => g.risk === 'high').length };

  return (
    <DashboardLayout role="admin" title="Risk Dashboard" userName={user?.name || 'Admin'}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="border-l-4 border-l-green-500">
          <p className="text-sm text-slate">Low Risk</p>
          <p className="text-3xl font-display text-green-600 mt-1">{loading ? '...' : counts.low}</p>
          <p className="text-xs text-slate mt-1">On track, no intervention needed</p>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <p className="text-sm text-slate">Medium Risk</p>
          <p className="text-3xl font-display text-yellow-600 mt-1">{loading ? '...' : counts.medium}</p>
          <p className="text-xs text-slate mt-1">Monitor closely, may need support</p>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <p className="text-sm text-slate">High Risk</p>
          <p className="text-3xl font-display text-red-600 mt-1">{loading ? '...' : counts.high}</p>
          <p className="text-xs text-slate mt-1">Immediate intervention required</p>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display text-thunder">AI Risk Predictions</h3>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as 'score' | 'name')}
          className="px-3 py-1.5 text-xs border border-border rounded-md">
          <option value="score">Sort by Risk (Worst First)</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      {/* Table */}
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-slate font-medium">Group</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Risk Level</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Confidence</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Submission Rate</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Avg Days Late</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Feedback</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Logins (7d)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-8 text-center text-slate">Analyzing risk factors...</td></tr>
              ) : groups.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-slate">No stored AI risk scores are available. CapstoneX does not infer scores from unrelated group data.</td></tr>
              ) : (
                sorted.map(g => (
                  <tr key={g.id} className={`border-b border-border last:border-0 hover:bg-surface transition-colors ${g.risk === 'high' ? 'bg-red-50/50' : ''}`}>
                    <td className="py-3 px-4 font-medium text-thunder">{g.name}</td>
                    <td className="py-3 px-4"><Badge variant={riskColors[g.risk]}>{g.risk.toUpperCase()}</Badge></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-surface rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${g.risk === 'high' ? 'bg-red-500' : g.risk === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${g.score * 100}%` }} />
                        </div>
                        <span className="text-xs text-slate">{Math.round(g.score * 100)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate">{g.submissionRate == null ? '—' : `${Math.round(g.submissionRate * 100)}%`}</td>
                    <td className="py-3 px-4"><span className={g.avgDaysLate != null && g.avgDaysLate > 5 ? 'text-red-600 font-medium' : 'text-slate'}>{g.avgDaysLate ?? '—'}</span></td>
                    <td className="py-3 px-4 text-slate">{g.feedbackScore == null ? '—' : `${g.feedbackScore}/10`}</td>
                    <td className="py-3 px-4"><span className={g.logins7d != null && g.logins7d < 5 ? 'text-red-600 font-medium' : 'text-slate'}>{g.logins7d ?? '—'}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
