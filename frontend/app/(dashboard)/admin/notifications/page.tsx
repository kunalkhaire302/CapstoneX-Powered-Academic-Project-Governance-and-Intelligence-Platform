'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useCurrentUser } from '@/lib/hooks';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface NotificationItem {
  id: string; title: string; body: string; type: string;
  read: boolean; created_at?: string; createdAt?: string; user_id: string;
}

export default function AdminNotificationsPage() {
  const user = useCurrentUser();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<{ title: string; body: string; target: string; time: string; count: number }[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

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
      const payload: any = { title, body, type: 'system' };
      if (targetRole) payload.target_role = targetRole;
      const res = await api.post('/notifications/broadcast', payload);
      setMessage(res.data.message || 'Broadcast sent!');
      setHistory(prev => [{
        title, body, target: targetRole || 'All Users',
        time: new Date().toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        count: parseInt(res.data.message?.match(/\d+/)?.[0] || '0'),
      }, ...prev]);
      setTitle('');
      setBody('');
      fetchNotifications();
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to send broadcast');
    } finally {
      setSending(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch { /* ignore */ }
  };

  const formatDate = (n: NotificationItem) => {
    const iso = n.created_at || n.createdAt;
    if (!iso) return 'Just now';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'Just now';
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  };

  return (
    <DashboardLayout role="admin" title="Notifications" userName={user?.name || 'Admin'}>
      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700 animate-fade-in">{message}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Broadcast Form */}
        <Card>
          <h3 className="text-lg font-display text-thunder mb-4">📢 Broadcast Notification</h3>
          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-thunder mb-1">Target Audience</label>
              <select value={targetRole} onChange={e => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-md">
                <option value="">All Users</option>
                <option value="student">Students Only</option>
                <option value="mentor">Mentors Only</option>
                <option value="coordinator">Coordinators Only</option>
                <option value="hod">HODs Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-thunder mb-1">Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:ring-2 focus:ring-cardinal focus:outline-none"
                placeholder="Notification title" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-thunder mb-1">Message</label>
              <textarea value={body} onChange={e => setBody(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-md h-28 resize-none focus:ring-2 focus:ring-cardinal focus:outline-none"
                placeholder="Write your notification message..." required />
            </div>
            <Button type="submit" className="w-full" loading={sending}>📢 Send Broadcast</Button>
          </form>
        </Card>

        {/* Notifications Feed */}
        <div className="space-y-4">
          {/* Broadcast History */}
          {history.length > 0 && (
            <Card>
              <h3 className="text-lg font-display text-thunder mb-3">Sent This Session</h3>
              <div className="space-y-3">
                {history.map((h, i) => (
                  <div key={i} className="p-3 border border-green-200 bg-green-50 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-thunder">{h.title}</h4>
                      <Badge variant="success">Sent to {h.count}</Badge>
                    </div>
                    <p className="text-xs text-slate mb-1">{h.body}</p>
                    <span className="text-[10px] text-slate">To: {h.target} • {h.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* My Notifications */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-display text-thunder">My Notifications</h3>
              {notifications.some(n => !n.read) && (
                <button onClick={handleMarkAllRead} className="text-xs text-cardinal hover:text-cardinal-hover font-medium">Mark all read</button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-slate py-4 text-center">No notifications yet</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`p-3 border rounded-md transition-colors ${n.read ? 'border-border' : 'border-cardinal/30 bg-cardinal-light/20'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-thunder">{n.title}</h4>
                      <span className="text-[10px] text-slate">{formatDate(n)}</span>
                    </div>
                    <p className="text-xs text-slate">{n.body}</p>
                    {!n.read && <span className="inline-block w-1.5 h-1.5 bg-cardinal rounded-full mt-1" />}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
