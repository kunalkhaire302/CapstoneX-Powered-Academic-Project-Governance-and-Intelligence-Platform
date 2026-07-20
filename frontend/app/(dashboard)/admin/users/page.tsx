'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useCurrentUser } from '@/lib/hooks';
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';

interface User {
  id: string; name: string; email: string; role: string;
  department: string | null; is_active: boolean; created_at: string;
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

// ─── Skeleton rows ────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      {[40, 56, 24, 32, 16, 20].map((w, i) => (
        <td key={i} className="py-3.5 px-4">
          <div className={`h-4 bg-gray-100 rounded-lg animate-pulse w-${w}`} style={{ width: `${w * 4}px` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Role config ──────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<string, { bg: string; text: string; dot: string; badge: 'success' | 'info' | 'warning' | 'error' | 'default' }> = {
  admin:         { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500',    badge: 'error' },
  hod:           { bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500',  badge: 'warning' },
  mentor:        { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500',   badge: 'info' },
  coordinator:   { bg: 'bg-emerald-100',text: 'text-emerald-700',dot: 'bg-emerald-500',badge: 'success' },
  student:       { bg: 'bg-slate-100',  text: 'text-slate-600',  dot: 'bg-slate-400',  badge: 'default' },
  accreditation: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500', badge: 'default' },
};

const AVATAR_GRADIENTS = [
  'from-cardinal to-red-700', 'from-blue-500 to-blue-700', 'from-emerald-500 to-emerald-700',
  'from-violet-500 to-violet-700', 'from-amber-500 to-amber-700', 'from-pink-500 to-pink-700',
];

const ALL_ROLES = ['student', 'mentor', 'coordinator', 'hod', 'admin', 'accreditation'];

export default function AdminUsersPage() {
  const currentUser = useCurrentUser();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [csvModal, setCsvModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({ name: '', email: '', role: 'student', department: '' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await api.get('/users', { params });
      setUsers(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } catch {
      setUsers([
        { id: '1', name: 'Admin User',        email: 'admin@capstonex.com',   role: 'admin',  department: 'Administration',   is_active: true, created_at: '2026-05-01' },
        { id: '2', name: 'Dr. Rajesh Kumar',  email: 'hod@capstonex.com',     role: 'hod',    department: 'Computer Science', is_active: true, created_at: '2026-05-01' },
        { id: '3', name: 'Prof. Anita Sharma',email: 'mentor1@capstonex.com', role: 'mentor', department: 'Computer Science', is_active: true, created_at: '2026-05-01' },
        { id: '4', name: 'Student 1',         email: 'student1@capstonex.com',role: 'student',department: 'Computer Science', is_active: true, created_at: '2026-05-01' },
      ]);
      setTotal(4);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleEdit = (u: User) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, role: u.role, department: u.department || '' });
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await api.put(`/users/${editUser.id}`, { name: form.name, role: form.role, department: form.department });
      showToast('User updated successfully');
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update user', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setSaving(true);
    try {
      await api.delete(`/users/${deleteUser.id}`);
      showToast('User deactivated successfully');
      setDeleteUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to deactivate user', 'error');
    } finally { setSaving(false); }
  };

  const handleAddUser = async () => {
    setSaving(true);
    try {
      await api.post('/auth/register', { ...form, password: 'CapstoneX@2024' });
      showToast('User created successfully');
      setAddModal(false);
      setForm({ name: '', email: '', role: 'student', department: '' });
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to create user', 'error');
    } finally { setSaving(false); }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/users/bulk-import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast(res.data.message || 'Import successful');
      setCsvModal(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Import failed', 'error');
    } finally { setSaving(false); }
  };

  const totalPages = Math.ceil(total / limit);
  const activeCount = users.filter(u => u.is_active).length;
  const thisMonth = users.filter(u => new Date(u.created_at).getMonth() === new Date().getMonth()).length;

  const selectClass = "w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-cardinal/20 focus:border-cardinal outline-none transition-all";

  return (
    <DashboardLayout role="admin" title="User Management" userName={currentUser?.name || 'Admin'}>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xl shadow-sm">👥</div>
          <div>
            <h2 className="text-2xl font-display text-thunder">User Management</h2>
            <p className="text-sm text-slate mt-0.5">Create, edit and manage all platform users</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCsvModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:text-thunder transition-all">
            <span>📄</span> CSV Import
          </button>
          <button onClick={() => { setAddModal(true); setForm({ name: '', email: '', role: 'student', department: '' }); }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-cardinal rounded-xl hover:bg-cardinal-hover transition-all shadow-sm">
            <span>+</span> Add User
          </button>
        </div>
      </div>

      {/* ── KPI Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users',    value: total,       icon: '👥', color: 'from-blue-500 to-blue-600' },
          { label: 'Active',         value: activeCount, icon: '✅', color: 'from-emerald-500 to-emerald-600' },
          { label: 'Inactive',       value: total - activeCount, icon: '⏸️', color: 'from-gray-400 to-gray-500' },
          { label: 'Joined This Month', value: thisMonth, icon: '🆕', color: 'from-violet-500 to-violet-600' },
        ].map((k, i) => (
          <Card key={i} className="group relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate font-medium uppercase tracking-wide">{k.label}</p>
                <p className="text-3xl font-display text-thunder mt-1.5">{loading ? '—' : k.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform`}>
                {k.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Controls ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search with icon */}
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" placeholder="Search by name or email..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-cardinal/20 focus:border-cardinal outline-none transition-all"
            id="search-users" />
        </div>

        {/* Role pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['', ...ALL_ROLES].map(r => (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all border ${
                roleFilter === r
                  ? 'bg-thunder text-white border-thunder shadow-sm'
                  : 'bg-white text-slate border-gray-200 hover:border-gray-300 hover:text-thunder'
              }`}>
              {r || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {['User', 'Email', 'Role', 'Department', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-bold text-slate uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="py-16 flex flex-col items-center gap-3 text-center">
                      <span className="text-5xl">🔍</span>
                      <p className="font-semibold text-thunder">No users found</p>
                      <p className="text-sm text-slate">Try adjusting your search or role filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u, idx) => {
                  const rc = ROLE_CONFIG[u.role] || ROLE_CONFIG.student;
                  const grad = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
                  return (
                    <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-blue-50/20 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0`}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-thunder">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate text-xs">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${rc.bg} ${rc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate text-xs">{u.department || '—'}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${u.is_active ? 'text-emerald-600' : 'text-gray-400'}`}>
                          <span className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(u)}
                            className="p-1.5 rounded-lg text-slate hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                            </svg>
                          </button>
                          <button onClick={() => setDeleteUser(u)}
                            className="p-1.5 rounded-lg text-slate hover:text-red-600 hover:bg-red-50 transition-colors" title="Deactivate">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3.5 border-t border-gray-100 bg-gray-50/40">
            <p className="text-xs text-slate">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of <span className="font-semibold text-thunder">{total}</span> users</p>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-white transition-colors">← Prev</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${page === i + 1 ? 'bg-cardinal text-white shadow-sm' : 'border border-gray-200 hover:bg-white'}`}>
                  {i + 1}
                </button>
              ))}
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-white transition-colors">Next →</button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Edit Modal ───────────────────────────────────────────────── */}
      {editUser && (
        <Modal isOpen title="Edit User" onClose={() => setEditUser(null)}>
          <div className="space-y-4">
            <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-thunder mb-1.5">Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={selectClass}>
                {ALL_ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <Input label="Department" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" onClick={() => setEditUser(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit} loading={saving}>Save Changes</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete Modal ─────────────────────────────────────────────── */}
      {deleteUser && (
        <Modal isOpen title="Deactivate User" onClose={() => setDeleteUser(null)}>
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl mb-4 flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-sm text-red-700">
              Are you sure you want to deactivate <strong>{deleteUser.name}</strong> ({deleteUser.email})?
              They will no longer be able to log in.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setDeleteUser(null)}>Cancel</Button>
            <button onClick={handleDelete} disabled={saving}
              className="px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50">
              {saving ? 'Deactivating...' : 'Deactivate'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Add User Modal ───────────────────────────────────────────── */}
      {addModal && (
        <Modal isOpen title="Add New User" onClose={() => setAddModal(false)}>
          <div className="space-y-4">
            <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input label="Email Address" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <div>
              <label className="block text-sm font-medium text-thunder mb-1.5">Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={selectClass}>
                {ALL_ROLES.filter(r => r !== 'accreditation').map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <Input label="Department" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 flex items-center gap-2">
              🔑 Default password: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200">CapstoneX@2024</code>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" onClick={() => setAddModal(false)}>Cancel</Button>
              <Button onClick={handleAddUser} loading={saving}>Create User</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── CSV Import Modal ─────────────────────────────────────────── */}
      {csvModal && (
        <Modal isOpen title="Import Users from CSV" onClose={() => setCsvModal(false)}>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm font-medium text-blue-800 mb-2">Required CSV columns:</p>
              <code className="text-xs bg-white px-2 py-1 rounded border border-blue-100 text-blue-700 font-mono">name, email, role, department</code>
            </div>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-cardinal/40 hover:bg-cardinal-50/20 transition-all group">
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📂</span>
              <span className="text-sm font-medium text-slate group-hover:text-cardinal">Click to choose CSV file</span>
              <input type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
            </label>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setCsvModal(false)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
