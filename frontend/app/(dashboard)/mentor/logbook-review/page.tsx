'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/Feedback';
import { BookOpen, Eye } from 'lucide-react';
import { useCurrentUser } from '@/lib/hooks';
import api from '@/lib/api';

type Logbook = { id: string; week_number: number; title: string; content: string; status: string; submitted_at?: string; Group?: { name: string }; student?: { name: string }; feedback?: Array<{ comment: string }> };

export default function MentorLogbookReviewPage() {
  const user = useCurrentUser(); const search = useSearchParams(); const groupId = search.get('group_id');
  const [entries, setEntries] = useState<Logbook[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [selected, setSelected] = useState<Logbook | null>(null); const [comment, setComment] = useState(''); const [outcome, setOutcome] = useState<'graded' | 'revision_requested'>('graded'); const [saving, setSaving] = useState(false);
  const load = useCallback(async () => { setLoading(true); setError(''); try { const { data } = await api.get('/logbooks', { params: groupId ? { group_id: groupId } : undefined }); setEntries((data.data || []).filter((entry: Logbook) => entry.status !== 'draft')); } catch (requestError: any) { setError(requestError.response?.data?.error || 'Logbooks could not be loaded.'); } finally { setLoading(false); } }, [groupId]);
  useEffect(() => { load(); }, [load]);
  const open = (entry: Logbook) => { setSelected(entry); setComment(entry.feedback?.[0]?.comment || ''); setOutcome(entry.status === 'revision_requested' ? 'revision_requested' : 'graded'); };
  const save = async () => { if (!selected || !comment.trim()) return; setSaving(true); setError(''); try { await api.post(`/logbooks/${selected.id}/feedback`, { comment: comment.trim(), status: outcome }); setSelected(null); await load(); } catch (requestError: any) { setError(requestError.response?.data?.error || 'Feedback could not be saved.'); } finally { setSaving(false); } };
  return <DashboardLayout role="mentor" title="Logbook Review" userName={user?.name || 'Mentor'}><div className="mb-6"><h2 className="font-display text-2xl text-thunder">Submitted logbooks</h2><p className="mt-1 text-sm text-slate">Review only entries from groups assigned to you.</p></div>{error && <ErrorState title="Logbook review unavailable" description={error} onRetry={load} />}{loading ? <LoadingState message="Loading submitted logbooks" /> : !error && entries.length === 0 ? <Card><EmptyState icon={BookOpen} title="No submitted logbooks" description="Submitted work from your assigned groups will appear here." /></Card> : <div className="space-y-4">{entries.map(entry => <Card key={entry.id}><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><div className="flex gap-2 text-xs text-slate"><span>Week {entry.week_number}</span><span>•</span><span>{entry.Group?.name || 'Assigned group'}</span><span>•</span><span>{entry.student?.name || 'Student'}</span></div><h3 className="mt-2 font-semibold text-thunder">{entry.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm text-slate">{entry.content}</p>{entry.feedback?.[0] && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate"><b>Saved feedback:</b> {entry.feedback[0].comment}</p>}</div><Button size="sm" variant="secondary" icon={<Eye className="h-4 w-4" />} onClick={() => open(entry)}>Review</Button></div></Card>)}</div>}<Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title="Review logbook" footer={<><Button variant="secondary" onClick={() => setSelected(null)}>Cancel</Button><Button onClick={save} loading={saving} disabled={!comment.trim()}>Save review</Button></>}><p className="text-sm text-slate">{selected?.title}</p><label className="mt-5 block text-sm font-medium text-thunder">Decision</label><select className="mt-1 w-full rounded-lg border border-border p-2 text-sm" value={outcome} onChange={event => setOutcome(event.target.value as 'graded' | 'revision_requested')}><option value="graded">Mark reviewed</option><option value="revision_requested">Request revision</option></select><label className="mt-4 block text-sm font-medium text-thunder">Feedback</label><textarea className="mt-1 w-full rounded-lg border border-border p-3 text-sm" rows={5} value={comment} onChange={event => setComment(event.target.value)} required /></Modal></DashboardLayout>;
}
