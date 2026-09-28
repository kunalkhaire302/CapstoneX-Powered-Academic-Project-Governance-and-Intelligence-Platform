'use client';

import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/Feedback';
import { Cpu } from 'lucide-react';
import { useCurrentUser } from '@/lib/hooks';
import api from '@/lib/api';

type Health = { status?: string; version?: string; models?: { risk_model?: string; embedding_model?: string; vector_store_projects?: number }; infrastructure?: { database?: string; cache?: string } };
export default function AdminModelsPage() {
  const user = useCurrentUser(); const [health, setHealth] = useState<Health | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); setError(''); try { const { data } = await api.get('/ai/health/detailed'); setHealth(data); } catch (requestError: any) { setHealth(null); setError(requestError.response?.data?.error || 'The AI service health endpoint is unavailable.'); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const rows = health ? [['AI service', health.status || 'unknown'], ['Service version', health.version || 'not reported'], ['Risk model', health.models?.risk_model || 'not reported'], ['Embedding model', health.models?.embedding_model || 'not reported'], ['Indexed projects', health.models?.vector_store_projects?.toString() || 'not reported'], ['Database', health.infrastructure?.database || 'not reported'], ['Cache', health.infrastructure?.cache || 'not reported']] : [];
  return <DashboardLayout role="admin" title="Model Registry" userName={user?.name || 'Admin'}><div className="mb-6 flex items-center justify-between"><div><h2 className="font-display text-2xl text-thunder">AI service status</h2><p className="mt-1 text-sm text-slate">Only service-reported operational status is shown. Performance metrics and retraining controls need a governed model-registry API.</p></div><Button variant="secondary" onClick={load} loading={loading}>Refresh</Button></div>{loading ? <LoadingState message="Checking AI service" /> : error ? <ErrorState title="AI service unavailable" description={error} onRetry={load} /> : health ? <Card><dl className="divide-y divide-border">{rows.map(([label, value]) => <div key={label} className="flex justify-between gap-6 py-4 text-sm"><dt className="font-medium text-thunder">{label}</dt><dd className="text-right text-slate">{value}</dd></div>)}</dl></Card> : <Card><EmptyState icon={Cpu} title="No model status available" description="The backend did not return a model-health response." /></Card>}</DashboardLayout>;
}
