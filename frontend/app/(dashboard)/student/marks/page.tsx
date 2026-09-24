'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Award, BarChart3, ClipboardCheck } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/Feedback';
import PageHeader from '@/components/ui/PageHeader';
import api from '@/lib/api';
import { useCurrentUser } from '@/lib/hooks';

type Evaluation = { id?: string; type: string; total_score: string | number; max_score: string | number; submitted_at?: string };

export default function StudentMarksPage() {
  const user = useCurrentUser();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const { data } = await api.get('/evaluations'); setEvaluations(data.data || []); }
    catch (requestError: any) { setError(requestError.response?.data?.error || 'Your evaluations could not be loaded.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (user?.id) load(); }, [load, user?.id]);
  const totals = useMemo(() => evaluations.reduce((result, item) => {
    const score = Number(item.total_score); const maximum = Number(item.max_score);
    if (Number.isFinite(score) && Number.isFinite(maximum) && maximum > 0) { result.earned += score; result.maximum += maximum; }
    return result;
  }, { earned: 0, maximum: 0 }), [evaluations]);
  const percentage = totals.maximum ? Math.round((totals.earned / totals.maximum) * 100) : null;

  return <DashboardLayout role="student" title="Marks" userName={user?.name || 'Student'}>
    <PageHeader eyebrow="Assessment record" title="Marks and evaluations" description="Only submitted, server-verified evaluations appear here. Upcoming assessments are not shown as grades." />
    {error ? <ErrorState title="Marks unavailable" description={error} onRetry={load} /> : loading ? <LoadingState label="Loading evaluations" rows={4} /> : <>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card><Award className="h-5 w-5 text-brand" /><p className="mt-4 text-3xl font-display text-thunder">{totals.earned}<span className="text-base text-slate-500">/{totals.maximum}</span></p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">Recorded score</p></Card>
        <Card><BarChart3 className="h-5 w-5 text-blue-600" /><p className="mt-4 text-3xl font-display text-thunder">{percentage === null ? '—' : `${percentage}%`}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">Weighted result</p></Card>
        <Card><ClipboardCheck className="h-5 w-5 text-emerald-600" /><p className="mt-4 text-3xl font-display text-thunder">{evaluations.length}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">Evaluations recorded</p></Card>
      </div>
      <Card>
        <h2 className="font-display text-xl text-thunder">Evaluation record</h2>
        {evaluations.length === 0 ? <EmptyState title="No marks have been recorded" description="Completed mentor evaluations will appear here after submission." /> : <div className="mt-5 divide-y divide-slate-100">{evaluations.map((evaluation, index) => {
          const score = Number(evaluation.total_score); const maximum = Number(evaluation.max_score);
          const ratio = maximum > 0 ? Math.min(100, Math.max(0, (score / maximum) * 100)) : 0;
          return <article key={evaluation.id || `${evaluation.type}-${index}`} className="grid gap-3 py-5 sm:grid-cols-[minmax(9rem,1fr)_2fr_auto] sm:items-center"><div><h3 className="font-semibold text-thunder">{evaluation.type}</h3>{evaluation.submitted_at && <time dateTime={evaluation.submitted_at} className="text-xs text-slate-500">{new Date(evaluation.submitted_at).toLocaleDateString()}</time>}</div><div className="h-2 overflow-hidden rounded-full bg-slate-100" aria-label={`${ratio.toFixed(0)} percent`}><div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${ratio}%` }} /></div><p className="text-right text-sm font-bold text-thunder">{score}/{maximum}</p></article>;
        })}</div>}
      </Card>
    </>}
  </DashboardLayout>;
}
