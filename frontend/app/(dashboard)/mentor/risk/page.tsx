'use client';

import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/Feedback';
import { ShieldAlert } from 'lucide-react';
import { useCurrentUser } from '@/lib/hooks';
import api from '@/lib/api';

type RiskScore = { id: string; group_id: string; score: number; label: 'low' | 'medium' | 'high'; predicted_at?: string; features_json?: Record<string, unknown> };
const colors: Record<RiskScore['label'], 'success' | 'warning' | 'error'> = { low: 'success', medium: 'warning', high: 'error' };
export default function MentorRiskPage() {
  const user = useCurrentUser(); const [scores, setScores] = useState<RiskScore[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); setError(''); try { const { data } = await api.get('/ai/risk-scores'); setScores(data.data || []); } catch (requestError: any) { setError(requestError.response?.data?.error || 'Stored risk scores could not be loaded.'); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  return <DashboardLayout role="mentor" title="Risk Dashboard" userName={user?.name || 'Mentor'}>{error ? <ErrorState title="Risk data unavailable" description={error} onRetry={load} /> : loading ? <LoadingState message="Loading stored risk scores" /> : scores.length === 0 ? <Card><EmptyState icon={ShieldAlert} title="No risk scores have been recorded" description="Risk appears here only after an authorized AI scoring run stores a result. CapstoneX does not invent risk predictions." /></Card> : <div className="space-y-4">{scores.map(score => <Card key={score.id}><div className="flex items-center justify-between gap-4"><div><p className="text-xs text-slate">Group ID</p><h3 className="mt-1 font-medium text-thunder">{score.group_id}</h3><p className="mt-1 text-xs text-slate">Recorded {score.predicted_at ? new Date(score.predicted_at).toLocaleString() : 'at an unknown time'}</p></div><div className="flex items-center gap-4"><p className="font-display text-3xl text-thunder">{Math.round(score.score * 100)}%</p><Badge variant={colors[score.label] || 'warning'}>{score.label} risk</Badge></div></div></Card>)}</div>}</DashboardLayout>;
}
