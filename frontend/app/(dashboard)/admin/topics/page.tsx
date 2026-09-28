'use client';

import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ErrorState, EmptyState, LoadingState } from '@/components/ui/Feedback';
import { useCurrentUser } from '@/lib/hooks';
import api from '@/lib/api';

type Topic = { id: string; title: string; domain_tags?: string[]; status: 'approved' | 'submitted' | 'pending' | 'rejected' | 'revision_requested'; Group?: { name: string }; created_at?: string };
const styles: Record<string, 'success' | 'warning' | 'error' | 'info'> = { approved: 'success', submitted: 'warning', pending: 'warning', rejected: 'error', revision_requested: 'info' };

export default function AdminTopicsPage() {
  const user = useCurrentUser(); const [topics, setTopics] = useState<Topic[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [acting, setActing] = useState<string | null>(null);
  const load = useCallback(async () => { setLoading(true); setError(''); try { const { data } = await api.get('/topics', { params: { limit: 100 } }); setTopics(data.data || []); } catch (requestError: any) { setError(requestError.response?.data?.error || 'Topics could not be loaded.'); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const decide = async (topic: Topic, action: 'approve' | 'reject') => { setActing(`${topic.id}:${action}`); setError(''); try { await api.put(`/topics/${topic.id}/${action}`, action === 'reject' ? { reason: 'Rejected by administrator.' } : {}); await load(); } catch (requestError: any) { setError(requestError.response?.data?.error || `Topic could not be ${action}d.`); } finally { setActing(null); } };
  return <DashboardLayout role="admin" title="Topic Approvals" userName={user?.name || 'Admin'}>{error && <div className="mb-5"><ErrorState title="Topic workflow unavailable" description={error} onRetry={load} /></div>}{loading ? <LoadingState message="Loading submitted topics" /> : topics.length === 0 ? <Card><EmptyState title="No topics to review" description="Submitted topics will appear here when student groups send them for review." /></Card> : <Card padding="sm"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border"><th className="p-3 text-left">Title</th><th className="p-3 text-left">Group</th><th className="p-3 text-left">Domain</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Actions</th></tr></thead><tbody>{topics.map(topic => <tr key={topic.id} className="border-b border-border last:border-0"><td className="p-3 font-medium text-thunder">{topic.title}</td><td className="p-3 text-slate">{topic.Group?.name || 'Unassigned group'}</td><td className="p-3">{topic.domain_tags?.length ? topic.domain_tags.join(', ') : '—'}</td><td className="p-3"><Badge variant={styles[topic.status] || 'info'}>{topic.status.replace('_', ' ')}</Badge></td><td className="p-3">{['submitted', 'pending', 'revision_requested'].includes(topic.status) ? <div className="flex gap-2"><Button size="sm" onClick={() => decide(topic, 'approve')} loading={acting === `${topic.id}:approve`}>Approve</Button><Button size="sm" variant="secondary" onClick={() => decide(topic, 'reject')} loading={acting === `${topic.id}:reject`}>Reject</Button></div> : <span className="text-xs text-slate">Reviewed</span>}</td></tr>)}</tbody></table></div></Card>}</DashboardLayout>;
}
