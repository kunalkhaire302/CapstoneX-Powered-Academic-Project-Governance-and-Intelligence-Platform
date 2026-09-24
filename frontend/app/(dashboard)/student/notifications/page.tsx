'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, BellRing, CheckCheck, ExternalLink, Inbox, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import api from '@/lib/api';
import { useCurrentUser } from '@/lib/hooks';

type NotificationItem = {
  id: string; title: string; body?: string;
  type: 'submission' | 'feedback' | 'approval' | 'alert' | 'system';
  read: boolean; link?: string; created_at?: string; createdAt?: string;
};

const typeStyles = {
  submission: 'bg-blue-50 text-blue-700', feedback: 'bg-violet-50 text-violet-700',
  approval: 'bg-emerald-50 text-emerald-700', alert: 'bg-amber-50 text-amber-800',
  system: 'bg-slate-100 text-slate-700',
};

export default function StudentNotificationsPage() {
  const user = useCurrentUser();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.get('/notifications', { params: { limit: 100 } });
      setItems((data.data || []).map((item: NotificationItem) => ({ ...item, link: item.link?.startsWith('/student/') && !item.link.includes('\\') ? item.link : undefined })));
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Notifications could not be loaded.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  const unread = useMemo(() => items.filter(item => !item.read).length, [items]);
  const markRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setItems(current => current.map(item => item.id === id ? { ...item, read: true } : item));
    } catch { setError('Could not mark this notification as read. Please retry.'); }
  };
  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setItems(current => current.map(item => ({ ...item, read: true })));
    } catch { setError('Could not update notifications. Please retry.'); }
  };

  return (
    <DashboardLayout role="student" title="Notifications" userName={user?.name || 'Student'}>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-cardinal-700">Activity centre</p><h1 className="mt-2 font-display text-3xl text-thunder">Your project signals</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Feedback, approvals, deadlines and system updates—kept in one accountable timeline.</p></div>
        <div className="flex gap-2"><Button variant="secondary" onClick={load} icon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}>Refresh</Button>{unread > 0 && <Button onClick={markAllRead} icon={<CheckCheck className="h-4 w-4" />}>Mark all read</Button>}</div>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card><BellRing className="h-5 w-5 text-cardinal" /><p className="mt-4 text-3xl font-display text-thunder">{unread}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">Unread</p></Card>
        <Card><Bell className="h-5 w-5 text-blue-600" /><p className="mt-4 text-3xl font-display text-thunder">{items.length}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">Total signals</p></Card>
        <Card><CheckCheck className="h-5 w-5 text-emerald-600" /><p className="mt-4 text-3xl font-display text-thunder">{items.length - unread}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">Acknowledged</p></Card>
      </div>
      {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</div>}
      <Card className="overflow-hidden !p-0">
        {loading ? <div className="space-y-3 p-6">{[1,2,3].map(item => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-100" />)}</div> : items.length === 0 ? <div className="grid min-h-[360px] place-items-center p-8 text-center"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-500"><Inbox className="h-7 w-7" /></span><h2 className="mt-5 font-display text-2xl text-thunder">The timeline is clear.</h2><p className="mt-2 text-sm text-slate-600">New mentor feedback and project decisions will appear here.</p></div></div> : <div className="divide-y divide-slate-100">{items.map(item => {
          const created = item.created_at || item.createdAt;
          return <article key={item.id} className={`group flex gap-4 p-5 transition-colors sm:p-6 ${item.read ? 'bg-white' : 'bg-cardinal-50/35 hover:bg-cardinal-50/55'}`}><button onClick={() => !item.read && markRead(item.id)} aria-label={item.read ? 'Notification read' : 'Mark notification read'} className={`mt-1 h-3 w-3 shrink-0 rounded-full border-2 ${item.read ? 'border-slate-300 bg-white' : 'border-cardinal bg-cardinal shadow-[0_0_0_5px_rgba(210,35,42,.1)]'}`} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${typeStyles[item.type] || typeStyles.system}`}>{item.type}</span>{created && <time className="text-xs text-slate-500">{new Date(created).toLocaleString()}</time>}</div><h2 className="mt-3 text-base font-bold text-thunder">{item.title}</h2>{item.body && <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>}{item.link && <Link href={item.link} onClick={() => markRead(item.id)} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-cardinal-700">Open related work <ExternalLink className="h-3.5 w-3.5" /></Link>}</div></article>;
        })}</div>}
      </Card>
    </DashboardLayout>
  );
}
