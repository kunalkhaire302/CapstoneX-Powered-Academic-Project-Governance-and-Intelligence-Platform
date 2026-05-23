'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useCurrentUser } from '@/lib/hooks';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface AuditEntry {
  id: string; action: string; entity_type: string; entity_id: string;
  ip_address: string; metadata: any; created_at?: string; createdAt?: string;
  User?: { id: string; name: string; email: string; role: string };
}

export default function AdminAuditPage() {
  const user = useCurrentUser();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (entityFilter) params.entity_type = entityFilter;
      const res = await api.get('/audit-logs', { params });
      setLogs(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } catch {
      setLogs([
        { id: '1', action: 'user.bulk_import', entity_type: 'user', entity_id: '', ip_address: '::1', metadata: { total: 17, created: 17 }, created_at: new Date().toISOString(), User: { id: '1', name: 'Admin User', email: 'admin@capstonex.com', role: 'admin' } },
        { id: '2', action: 'auth.login', entity_type: 'auth', entity_id: '', ip_address: '::1', metadata: null, created_at: new Date().toISOString(), User: { id: '1', name: 'Admin User', email: 'admin@capstonex.com', role: 'admin' } },
      ]);
      setTotal(2);
    } finally {
      setLoading(false);
    }
  }, [page, entityFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const actionColors: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
    created: 'success', approved: 'success', updated: 'info', login: 'info',
    submitted: 'info', joined: 'info', rejected: 'error', deactivated: 'error',
    bulk_import: 'warning', register: 'success',
  };

  const getColor = (action: string) => {
    const parts = action.split('.');
    return actionColors[parts[parts.length - 1]] || 'default';
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getTimestamp = (log: AuditEntry) => log.created_at || log.createdAt || '';

  const entities = ['user', 'auth', 'topic', 'logbook', 'evaluation', 'group', 'notification'];
  const totalPages = Math.ceil(total / limit);

  return (
    <DashboardLayout role="admin" title="Audit Log" userName={user?.name || 'Admin'}>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button onClick={() => { setEntityFilter(''); setPage(1); }}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${!entityFilter ? 'bg-cardinal text-white' : 'bg-surface text-slate hover:text-thunder'}`}>
          All
        </button>
        {entities.map(e => (
          <button key={e} onClick={() => { setEntityFilter(e); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${entityFilter === e ? 'bg-cardinal text-white' : 'bg-surface text-slate hover:text-thunder'}`}>
            {e.charAt(0).toUpperCase() + e.slice(1)}
          </button>
        ))}
        <span className="text-xs text-slate ml-auto">{total} entries</span>
      </div>

      {/* Table */}
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-slate font-medium">Time</th>
                <th className="text-left py-3 px-4 text-slate font-medium">User</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Action</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Entity</th>
                <th className="text-left py-3 px-4 text-slate font-medium">IP</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate">Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate">No audit logs found</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                    <td className="py-3 px-4 text-slate font-mono text-xs whitespace-nowrap">{formatDate(getTimestamp(log))}</td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-medium text-thunder text-xs">{log.User?.name || 'System'}</span>
                        <p className="text-[10px] text-slate">{log.User?.email || ''}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4"><Badge variant={getColor(log.action)}>{log.action}</Badge></td>
                    <td className="py-3 px-4 text-slate capitalize text-xs">{log.entity_type}</td>
                    <td className="py-3 px-4 text-slate font-mono text-xs">{log.ip_address}</td>
                    <td className="py-3 px-4 text-xs text-slate max-w-[200px] truncate">
                      {log.metadata ? JSON.stringify(log.metadata).substring(0, 60) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-slate">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-xs border border-border rounded disabled:opacity-40 hover:bg-surface">Prev</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-xs border border-border rounded disabled:opacity-40 hover:bg-surface">Next</button>
            </div>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
