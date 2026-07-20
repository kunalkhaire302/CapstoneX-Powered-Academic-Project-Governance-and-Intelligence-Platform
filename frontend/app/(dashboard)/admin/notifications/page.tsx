'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useCurrentUser } from '@/lib/hooks';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface NotificationItem {
  id: string; title: string; body: string; type: string;
  read: boolean; created_at?: string; createdAt?: string; user_id: string;
}

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ message, type, onDismiss }: { message: string; type: 'success' | 'error'; onDismiss: () => void }) {
  useEffect(() => { const t = setTimeout(onDismiss, 4000); return () => clearTimeout(t); }, [onDismiss]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border animate-slide-up max-w-sm ${
      type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
    }`}>
      <span className="text-lg">{type === 'success' ? '✅' : '❌'}</span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onDismiss} className="ml-2 text-current opacity-50 hover:opacity-100">✕</button>
    </div>
  );
}

const PRIORITY_OPTIONS = [
  { value: 'info',     label: 'Info',     icon: 'ℹ️',  color: 'from-blue-500 to-blue-600',    bg: 'bg-blue-50 border-blue-200 text-blue-700' },
  { value: 'warning',  label: 'Warning',  icon: '⚠️',  color: 'from-amber-500 to-amber-600',  bg: 'bg-amber-50 border-amber-200 text-amber-700' },
  { value: 'critical', label: 'Critical', icon: '🚨',  color: 'from-red-500 to-red-600',      bg: 'bg-red-50 border-red-200 text-red-700' },
  { value: 'success',  label: 'Success',  icon: '✅',  color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
];

const AUDIENCE_OPTIONS = [
  { value: '',              label: 'All Users',     icon: '🌐', count: '17' },
  { value: 'student',       label: 'Students',      icon: '🎓', count: '10' },
  { value: 'mentor',        label: 'Mentors',       icon: '👨‍🏫', count: '2' },
  { value: 'coordinator',   label: 'Coordinators',  icon: '📋', count: '1' },
  { value: 'hod',           label: 'HODs',          icon: '🏛️', count: '1' },
];

export default function AdminNotificationsPage() {
  const user = useCurrentUser();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [priority, setPriority] = useState('info');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [history, setHistory] = useState<{ title: string; body: string; target: string; time: string; count: number; priority: string }[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });
  const MAX_BODY = 280;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications', { params: { limit: 20 } });
      setNotifications(res.data.data || []);
    } catch { /* no notifications yet */ }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    try {
      const payload: any = { title, body, type: priority };
      if (targetRole) payload.target_role = targetRole;
      const res = await api.post('/notifications/broadcast', payload);
      showToast(res.data.message || `Broadcast sent to ${targetRole || 'all users'}!`);
      const audience = AUDIENCE_OPTIONS.find(a => a.value === targetRole);
      setHistory(prev => [{
        title, body, priority,
        target: audience?.label || 'All Users',
        time: new Date().toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        count: parseInt(res.data.message?.match(/\d+/)?.[0] || audience?.count || '0'),
      }, ...prev]);
      setTitle(''); setBody(''); setShowPreview(false);
      fetchNotifications();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to send broadcast', 'error');
    } finally { setSending(false); }
  };

  const handleMarkAllRead = async () => {
    try { await api.put('/notifications/read-all'); fetchNotifications(); } catch { }
  };

  const formatDate = (n: NotificationItem) => {
    const iso = n.created_at || n.createdAt;
    if (!iso) return 'Just now';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'Just now';
    const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
  };

  const selectedPriority = PRIORITY_OPTIONS.find(p => p.value === priority) || PRIORITY_OPTIONS[0];
  const selectedAudience = AUDIENCE_OPTIONS.find(a => a.value === targetRole) || AUDIENCE_OPTIONS[0];
  const unreadCount = notifications.filter(n => !n.read).length;

  const inputClass = "w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-cardinal/20 focus:border-cardinal outline-none transition-all";

  return (
    <DashboardLayout role="admin" title="Notifications" userName={user?.name || 'Admin'}>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xl shadow-sm">📢</div>
          <div>
            <h2 className="text-2xl font-display text-thunder">Broadcast Notifications</h2>
            <p className="text-sm text-slate mt-0.5">Send targeted announcements to users or groups</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cardinal-50 border border-cardinal/20 rounded-full text-xs font-semibold text-cardinal">
            <span className="w-1.5 h-1.5 rounded-full bg-cardinal animate-pulse" />
            {unreadCount} unread
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Compose Form (3 cols) ────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <h3 className="text-base font-display text-thunder mb-5">Compose Message</h3>
            <form onSubmit={handleBroadcast} className="space-y-4">

              {/* Audience selector */}
              <div>
                <label className="block text-sm font-medium text-thunder mb-2">Target Audience</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AUDIENCE_OPTIONS.map(a => (
                    <button key={a.value} type="button" onClick={() => setTargetRole(a.value)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                        targetRole === a.value
                          ? 'border-cardinal bg-cardinal-50/50 text-cardinal shadow-sm'
                          : 'border-gray-200 text-slate hover:border-gray-300 hover:text-thunder'
                      }`}>
                      <span className="text-lg">{a.icon}</span>
                      <div>
                        <p className="text-xs font-semibold">{a.label}</p>
                        <p className="text-[10px] opacity-60">{a.count} users</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority selector */}
              <div>
                <label className="block text-sm font-medium text-thunder mb-2">Priority</label>
                <div className="flex gap-2">
                  {PRIORITY_OPTIONS.map(p => (
                    <button key={p.value} type="button" onClick={() => setPriority(p.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        priority === p.value ? p.bg + ' shadow-sm' : 'border-gray-200 text-slate hover:border-gray-300'
                      }`}>
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-thunder mb-1.5">Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  className={inputClass} placeholder="Notification title" required maxLength={100} />
                <p className="text-[10px] text-slate mt-1 text-right">{title.length}/100</p>
              </div>

              {/* Message body */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-thunder">Message</label>
                  <button type="button" onClick={() => setShowPreview(!showPreview)}
                    className="text-xs text-cardinal hover:text-cardinal-hover font-medium">
                    {showPreview ? 'Hide Preview' : 'Preview'}
                  </button>
                </div>
                <textarea value={body} onChange={e => setBody(e.target.value.slice(0, MAX_BODY))}
                  className={`${inputClass} h-28 resize-none`}
                  placeholder="Write your notification message..." required />
                <p className={`text-[10px] mt-1 text-right ${body.length >= MAX_BODY * 0.9 ? 'text-red-500' : 'text-slate'}`}>
                  {body.length}/{MAX_BODY}
                </p>
              </div>

              {/* Preview card */}
              {showPreview && title && (
                <div className={`p-4 rounded-xl border ${selectedPriority.bg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span>{selectedPriority.icon}</span>
                    <p className="text-sm font-bold">{title || 'Notification title'}</p>
                  </div>
                  <p className="text-xs opacity-80 leading-relaxed">{body || 'Message body will appear here...'}</p>
                  <p className="text-[10px] opacity-50 mt-2">To: {selectedAudience.label} · Just now</p>
                </div>
              )}

              <button type="submit" disabled={sending || !title || !body}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-cardinal to-cardinal-600 rounded-xl hover:from-cardinal-hover hover:to-cardinal shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {sending
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending...</>
                  : <><span>📢</span> Send to {selectedAudience.label}</>}
              </button>
            </form>
          </Card>

          {/* Sent history */}
          {history.length > 0 && (
            <Card>
              <h3 className="text-sm font-display text-thunder mb-4">Sent This Session</h3>
              <div className="space-y-3">
                {history.map((h, i) => {
                  const p = PRIORITY_OPTIONS.find(p => p.value === h.priority) || PRIORITY_OPTIONS[0];
                  return (
                    <div key={i} className={`p-3.5 rounded-xl border ${p.bg}`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span>{p.icon}</span>
                          <h4 className="text-sm font-semibold">{h.title}</h4>
                        </div>
                        <span className="text-[10px] opacity-60 whitespace-nowrap">{h.time}</span>
                      </div>
                      <p className="text-xs opacity-70 line-clamp-2 mb-2">{h.body}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] opacity-60">→ {h.target}</span>
                        {h.count > 0 && <span className="text-[10px] font-bold">✓ {h.count} delivered</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* ── Notifications Feed (2 cols) ──────────────────────────── */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-display text-thunder">My Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead}
                className="text-xs text-cardinal hover:text-cardinal-hover font-semibold transition-colors">
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3 text-center">
              <span className="text-4xl">🔔</span>
              <p className="font-semibold text-thunder">No notifications yet</p>
              <p className="text-sm text-slate">Broadcasts you send will appear here</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
              {notifications.map(n => (
                <div key={n.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    n.read ? 'border-gray-100 bg-gray-50/40 hover:bg-gray-50' : 'border-cardinal/20 bg-cardinal-50/20 hover:bg-cardinal-50/30'
                  }`}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      {!n.read && <span className="w-2 h-2 rounded-full bg-cardinal flex-shrink-0 mt-0.5" />}
                      <h4 className="text-sm font-semibold text-thunder leading-tight">{n.title}</h4>
                    </div>
                    <span className="text-[10px] text-slate whitespace-nowrap">{formatDate(n)}</span>
                  </div>
                  <p className="text-xs text-slate leading-relaxed">{n.body}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
